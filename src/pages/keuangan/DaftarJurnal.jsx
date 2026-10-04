import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Judul, Modal, SearchSelect, Tabel, inputCls, rp } from "./ui";
import { barisKopCsv, simpanCsv } from "./kopLaporan";
import { cetakDaftarJurnal, cetakJurnal } from "./cetakJurnal";
import { unduhExcelJurnal, unduhExcelJurnalSatu } from "../../services/jurnalExport";
import { Paginasi, RentangTanggal, rentangBulan, teksRentang } from "./alatJurnal";

const hariIni = () => new Date().toISOString().slice(0, 10);
const BATAS_UNDUH = 1000; // batas baris dari backend untuk CSV/cetak; Excel mengambil seluruh hasil filter

const UKURAN_HALAMAN = 50;
// dari/sampai di state = from/to di backend
const paramsDari = (f) => Object.fromEntries(
  Object.entries({ ...f, from: f.dari, to: f.sampai }).filter(([k, v]) => v && !["akunLabel", "dari", "sampai"].includes(k)),
);
const teksPeriode = (f) => teksRentang(f.dari, f.sampai);
const teksFilter = (f) =>
  [f.dana && `Dana ${f.dana}`, f.jenis && `Jenis ${f.jenis}`, f.status && `Status ${f.status}`, f.akun && `Akun ${f.akunLabel || f.akun}`,
    f.q && `Cari "${f.q}"`].filter(Boolean).join(", ");

/** CSV rapi: kop lembaga + periode + filter, baris data, lalu total jurnal POSTED. Nilai berupa angka polos agar bisa dihitung di Excel. */
function unduhJurnalCsv(rows, f) {
  const ket = [teksPeriode(f), teksFilter(f)].filter(Boolean).join(" | ");
  const total = rows.filter((j) => j.status === "POSTED").reduce((s, j) => s + (Number(j.total) || 0), 0);
  const tabel = [
    ...barisKopCsv("DAFTAR JURNAL", ket),
    ["No", "No. Bukti", "Tanggal", "Jenis", "Dana", "Pihak", "Keterangan", "Status", "Nilai"],
    ...rows.map((j, i) => [i + 1, j.nomorBukti, String(j.tanggal).slice(0, 10), j.jenis, j.dana, j.pihak, j.keterangan, j.status, Math.round(Number(j.total) || 0)]),
    ["", "", "", "", "", "", "", "Total (POSTED)", Math.round(total)],
  ];
  const akun = f.akunLabel ? `-${f.akunLabel.replace(/[^A-Za-z0-9]+/g, "-")}` : "";
  const rentang = f.dari || f.sampai ? `${f.dari || "awal"}_sd_${f.sampai || "sekarang"}` : "semua";
  simpanCsv(tabel, `Daftar-Jurnal${akun}-${rentang}-${hariIni()}.csv`);
}

const STATUS_WARNA = {
  POSTED: "bg-green-100 text-green-800",
  VOID: "bg-gray-200 text-gray-600 line-through",
  DRAFT: "bg-yellow-100 text-yellow-800",
};

const KOSONG = { dana: "", jenis: "", dari: "", sampai: "", status: "", q: "", akun: "" };
/** Filter dari "Lacak sumber" masih berbentuk periode (bulan): ubah ke rentang tanggal bulan itu. */
const dariLacak = ({ periode, ...x }) => ({ ...KOSONG, ...x, ...(periode ? rentangBulan(periode) : {}) });

/**
 * initialFilter: dikirim dari halaman laporan lain lewat tombol "Lacak sumber" (mis. LpdPage).
 * Setiap objek baru (referensi berubah) menimpa filter yang sedang aktif di sini, termasuk saat
 * nilainya sama tapi user mengklik lacak lagi dari baris berbeda — makanya pemanggil selalu
 * membuat objek baru, bukan menaruh literal yang sama.
 */
export default function DaftarJurnal({ initialFilter }) {
  const [rows, setRows] = useState([]);
  const [rekening, setRekening] = useState([]);
  const [f, setF] = useState(() => (initialFilter ? dariLacak(initialFilter) : KOSONG));
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFilter) setF(dariLacak(initialFilter));
  }, [initialFilter]);

  // Rekening bank/kas untuk filter "per rekening bank" (kelompok KAS_BANK), dipakai juga untuk nama file unduhan.
  useEffect(() => {
    keuangan.coaAll().then((all) => setRekening(all.filter((r) => r.kelompok === "KAS_BANK")))
      .catch(() => setRekening([]));
  }, []);

  const muat = useCallback(() => {
    setLoading(true);
    keuangan.jurnalBerhalaman({ ...paramsDari(f), page, size: UKURAN_HALAMAN })
      .then((r) => { setRows(r.items); setTotal(r.total); })
      .catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [f, page]);
  useEffect(() => { muat(); }, [muat]);
  useEffect(() => { setPage(1); }, [f]);

  const buka = (id) => keuangan.jurnalDetail(id).then(setDetail).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));

  const batalkan = async (j) => {
    const { value: alasan, isConfirmed } = await Swal.fire({
      title: `Batalkan ${j.nomorBukti}?`,
      input: "text",
      inputLabel: "Alasan pembatalan (wajib)",
      showCancelButton: true,
      confirmButtonText: "Batalkan jurnal",
      cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      const r = await keuangan.voidJurnal(j.id, alasan);
      await Swal.fire("Berhasil", r.pesan, "success");
      setDetail(null);
      muat();
    } catch (e) {
      Swal.fire("Ditolak", errMsg(e), "error");
    }
  };

  // CSV & cetak mengambil ulang hingga BATAS_UNDUH baris sesuai filter (tabel di layar hanya satu halaman).
  const ambilUntukUnduh = async () => {
    const semua = await keuangan.jurnal({ ...paramsDari(f), limit: BATAS_UNDUH });
    if (!semua.length) throw new Error("Tidak ada jurnal pada filter/periode ini.");
    if (semua.length >= BATAS_UNDUH) {
      await Swal.fire("Dibatasi", `Hanya ${BATAS_UNDUH} jurnal teratas yang dimasukkan. Gunakan "Unduh Excel" untuk hasil lengkap, atau persempit filternya.`, "info");
    }
    return semua;
  };
  const jalankan = (aksi) => async () => {
    try { await aksi(); } catch (e) { Swal.fire("Gagal", e?.response ? errMsg(e) : e.message, "error"); }
  };
  const unduhCsv = jalankan(async () => unduhJurnalCsv(await ambilUntukUnduh(), f));
  const cetak = jalankan(async () => cetakDaftarJurnal(await ambilUntukUnduh(), { rentang: teksPeriode(f), filter: teksFilter(f) }));
  const unduhExcel = jalankan(() => unduhExcelJurnal({
    dana: f.dana, jenis: f.jenis, status: f.status, q: f.q, akun: f.akun, from: f.dari, to: f.sampai,
  }));
  return (
    <div>
      <Judul
        aksi={
          <>
            <Btn color="gray" onClick={unduhExcel}>Unduh Excel</Btn>
            <Btn color="gray" onClick={unduhCsv}>Unduh CSV</Btn>
            <Btn color="gray" onClick={cetak}>Cetak</Btn>
          </>
        }
      >
        Daftar Jurnal
      </Judul>
      {f.akun && (
        <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-3 py-2 w-fit">
          <span>Menelusuri akun: <b>{f.akunLabel || f.akun}</b>{f.dari || f.sampai ? ` · ${teksRentang(f.dari, f.sampai).replace("Periode: ", "")}` : ""}</span>
          <button className="text-blue-500 hover:text-blue-800 font-bold" onClick={() => setF({ ...f, akun: "", akunLabel: "" })} title="Hapus filter akun">×</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mb-3">
        <select className={inputCls} value={f.dana} onChange={(e) => setF({ ...f, dana: e.target.value })}>
          <option value="">Semua dana</option>
          {["ZAKAT", "INFAQ", "DSKL", "PENGELOLA", "WAKAF"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
          <option value="">Semua jenis</option>
          {["PENERIMAAN", "PENYALURAN", "BEBAN_OPERASIONAL", "TRANSFER_DANA", "ALOKASI_AMIL", "BAGI_HASIL_BANK", "PENYESUAIAN"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <SearchSelect
          value={f.akun}
          onChange={(v) => {
            const r = rekening.find((x) => String(x.id) === String(v));
            setF({ ...f, akun: v, akunLabel: r ? `${r.accountCode} ${r.accountName}` : "" });
          }}
          options={[
            { value: "", label: "Semua rekening bank" },
            ...rekening.map((r) => ({ value: r.id, label: `${r.accountCode} ${r.accountName}` })),
          ]}
          placeholder="Cari rekening bank…"
        />
        <RentangTanggal className="md:col-span-2" dari={f.dari} sampai={f.sampai} onChange={(dari, sampai) => setF({ ...f, dari, sampai })} />
        <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">Semua status</option>
          {["POSTED", "VOID"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <input className={inputCls} placeholder="Cari no. bukti / keterangan" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      </div>
      <Tabel
        kolom={[
          { judul: "No. Bukti", tampil: (j) => <button className="text-blue-600 hover:underline" onClick={() => buka(j.id)}>{j.nomorBukti}</button> },
          { judul: "Tanggal", tampil: (j) => String(j.tanggal).slice(0, 10) },
          { judul: "Jenis", kunci: "jenis" },
          { judul: "Dana", tampil: (j) => <DanaBadge dana={j.dana} /> },
          { judul: "Keterangan", tampil: (j) => <span className="line-clamp-1 max-w-xs inline-block">{j.keterangan}</span> },
          { judul: "Nilai", kanan: true, tampil: (j) => rp(j.total) },
          { judul: "Status", tampil: (j) => (
            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_WARNA[j.status] || ""}`}>
              {j.status}{j.lintasDanaLegacy ? " · legacy" : ""}
            </span>
          ) },
        ]}
        baris={rows}
        kosong={loading ? "Memuat…" : "Tidak ada jurnal"}
      />
      <Paginasi page={page} size={UKURAN_HALAMAN} total={total} onPage={setPage} />
      {detail && (
        <Modal wide title={`Jurnal ${detail.nomorBukti}`} onClose={() => setDetail(null)}>
          <div className="text-sm text-gray-600 mb-3 grid grid-cols-2 gap-1">
            <div>Tanggal: <b>{String(detail.tanggal).slice(0, 10)}</b></div>
            <div>Jenis: <b>{detail.jenis}</b> <DanaBadge dana={detail.dana} /></div>
            <div>Status: <b>{detail.status}</b> · {detail.verifikasi}</div>
            <div>Sumber: <b>{detail.sumber}</b></div>
            <div className="col-span-2">Keterangan: {detail.keterangan}</div>
          </div>
          <Tabel
            kolom={[
              { judul: "Dana", tampil: (b) => <DanaBadge dana={b.dana} /> },
              { judul: "Akun", tampil: (b) => `${b.kode} ${b.akun}` },
              { judul: "Debit", kanan: true, tampil: (b) => (Number(b.debit) ? rp(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (Number(b.kredit) ? rp(b.kredit) : "") },
            ]}
            baris={detail.baris.filter((b) => !b.dihapus)}
          />
          {detail.penerimaan?.length > 0 && (
            <div className="mt-3 text-sm">
              <b>Donatur:</b> {detail.penerimaan[0].donatur_nama} · {detail.penerimaan[0].metode_bayar}
              {detail.penerimaan[0].jenis_zakat && ` · Zakat ${detail.penerimaan[0].jenis_zakat}`}
            </div>
          )}
          {detail.penyaluran?.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Penerima</div>
              <Tabel
                kolom={[
                  { judul: "Penerima", tampil: (p) => p.penerima || "—" },
                  { judul: "Asnaf", kunci: "asnaf" },
                  { judul: "Jumlah penerima", kanan: true, kunci: "jmlPenerima" },
                  { judul: "Jumlah", kanan: true, tampil: (p) => rp(p.jumlah) },
                ]}
                baris={detail.penyaluran}
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Btn color="gray" onClick={jalankan(() => cetakJurnal(detail))}>Cetak</Btn>
            <Btn color="gray" onClick={jalankan(() => unduhExcelJurnalSatu(detail.id))}>Unduh Excel</Btn>
            {detail.status === "POSTED" && <Btn color="red" onClick={() => batalkan(detail)}>Batalkan (VOID)</Btn>}
          </div>
        </Modal>
      )}
    </div>
  );
}

DaftarJurnal.propTypes = {
  initialFilter: PropTypes.shape({
    dana: PropTypes.string,
    jenis: PropTypes.string,
    periode: PropTypes.string,
    status: PropTypes.string,
    q: PropTypes.string,
    akun: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    akunLabel: PropTypes.string,
  }),
};
