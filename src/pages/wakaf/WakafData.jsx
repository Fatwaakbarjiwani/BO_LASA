import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { wakaf } from "../../services/wakafApi";
import { errMsg } from "../../services/keuanganApi";
import { Btn, Judul, Modal, Tabel, inputCls, num, rp } from "../keuangan/ui";
import { useWakafMeta } from "./WakafInput";

const JENIS_JURNAL = {
  PENERIMAAN: "Penerimaan", MUTASI: "Mutasi", PENGUKURAN_ULANG: "Pengukuran Ulang",
  HASIL_PENGELOLAAN: "Hasil Pengelolaan", PENYALURAN: "Penyaluran", SALDO_AWAL: "Saldo Awal", PENYESUAIAN: "Penyesuaian",
};
const gagal = (e) => Swal.fire("Gagal", errMsg(e), "error");

// ------------------------------------------------------------------ Daftar harta benda wakaf

export function DaftarHarta() {
  const [meta] = useWakafMeta();
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ jenis: "", q: "" });
  const muat = useCallback(() => {
    wakaf.harta(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setRows).catch(gagal);
  }, [f]);
  useEffect(() => { muat(); }, [muat]);
  const total = rows.reduce((s, r) => s + r.currentValue, 0);
  return (
    <div>
      <Judul
        aksi={
          <>
            <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
              <option value="">Semua jenis</option>
              {meta?.jenisHbw.map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
            </select>
            <input className={inputCls} placeholder="Cari nama harta / wakif" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </>
        }
      >
        Daftar Harta Benda Wakaf
      </Judul>
      <p className="text-sm text-gray-500 mb-3">{rows.length} harta, nilai kini {rp(total)}. Nilai kini = nilai wajar awal + dampak pengukuran ulang.</p>
      <Tabel
        kolom={[
          { judul: "Nama harta", tampil: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-gray-500">{r.wakif}</div></div> },
          { judul: "Jenis", tampil: (r) => <div><div>{r.typeLabel}</div><div className="text-xs text-gray-500">{r.account}</div></div> },
          { judul: "Perolehan", kunci: "acquiredAt" },
          { judul: "Jangka waktu", tampil: (r) => `${r.term}${r.dueDate ? ` (s/d ${r.dueDate})` : ""}` },
          { judul: "AIW / Sertifikat", tampil: (r) => `${r.hasAiw ? "Ada" : "Tidak"} / ${r.hasCertificate ? "Ada" : "Tidak"}` },
          { judul: "Jenis wakaf", tampil: (r) => (r.purpose === "SOSIAL" ? "Sosial" : "Produktif") },
          { judul: "Nilai awal", kanan: true, tampil: (r) => num(r.initialValue) },
          { judul: "Nilai kini", kanan: true, tampil: (r) => num(r.currentValue) },
        ]}
        baris={rows}
      />
    </div>
  );
}

// ------------------------------------------------------------------ Daftar jurnal wakaf + detail + pembatalan

export function DaftarJurnalWakaf() {
  const thn = new Date().getFullYear();
  const [f, setF] = useState({ from: `${thn}-01-01`, to: new Date().toISOString().slice(0, 10), jenis: "", q: "" });
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const muat = useCallback(() => {
    wakaf.jurnal(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setRows).catch(gagal);
  }, [f]);
  useEffect(() => { muat(); }, [muat]);

  const batalkan = async (j) => {
    const { value: alasan, isConfirmed } = await Swal.fire({
      title: `Batalkan ${j.nomorBukti}?`, input: "text", inputLabel: "Alasan pembatalan (wajib)",
      showCancelButton: true, confirmButtonText: "Batalkan jurnal", cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      await wakaf.batalkan(j.id, alasan);
      Swal.fire("Dibatalkan", "Jurnal ditandai VOID dan laporan wakaf dihitung ulang.", "success");
      setDetail(null);
      muat();
    } catch (e) {
      gagal(e);
    }
  };

  return (
    <div>
      <Judul
        aksi={
          <>
            <input type="date" className={inputCls} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            <input type="date" className={inputCls} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
            <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
              <option value="">Semua jenis</option>
              {Object.entries(JENIS_JURNAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className={inputCls} placeholder="Cari nomor / keterangan" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </>
        }
      >
        Daftar Jurnal Wakaf
      </Judul>
      <Tabel
        kolom={[
          { judul: "Nomor bukti", tampil: (r) => <button className="text-blue-600 hover:underline" onClick={() => wakaf.jurnalDetail(r.id).then(setDetail).catch(gagal)}>{r.nomorBukti}</button> },
          { judul: "Tanggal", kunci: "tanggal" },
          { judul: "Jenis", tampil: (r) => JENIS_JURNAL[r.jenis] || r.jenis },
          { judul: "Keterangan", tampil: (r) => <span className="line-clamp-2">{r.keterangan}</span> },
          { judul: "Status", tampil: (r) => <span className={r.status === "VOID" ? "text-gray-400 line-through" : "text-green-700"}>{r.status}</span> },
          { judul: "Nilai", kanan: true, tampil: (r) => num(r.nilai) },
        ]}
        baris={rows}
      />
      {detail && (
        <Modal title={detail.nomorBukti} onClose={() => setDetail(null)} wide>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div><span className="text-gray-500">Tanggal:</span> {detail.tanggal}</div>
            <div><span className="text-gray-500">Jenis:</span> {JENIS_JURNAL[detail.jenis]}</div>
            <div className="col-span-2"><span className="text-gray-500">Keterangan:</span> {detail.keterangan}</div>
            {detail.harta && <div className="col-span-2"><span className="text-gray-500">Harta:</span> {detail.harta}</div>}
            {detail.mauqufAlaih && <div><span className="text-gray-500">Mauquf alaih:</span> {detail.mauqufAlaih}</div>}
            {detail.perantara && <div><span className="text-gray-500">Perantara:</span> {detail.perantara}</div>}
            {detail.jenisTransaksi && <div><span className="text-gray-500">Jenis mutasi:</span> {detail.jenisTransaksi}</div>}
            {detail.acuan && <div><span className="text-gray-500">Acuan:</span> {detail.acuan}</div>}
            {detail.stafNazhir && <div><span className="text-gray-500">Staf nazhir:</span> {detail.stafNazhir}</div>}
            {detail.refZis && <div><span className="text-gray-500">Dari buku ZIS:</span> {detail.refZis}</div>}
            <div><span className="text-gray-500">Sumber:</span> {detail.sumber}</div>
            <div><span className="text-gray-500">Status:</span> {detail.status}{detail.alasanBatal ? ` — ${detail.alasanBatal}` : ""}</div>
          </div>
          <Tabel
            kolom={[
              { judul: "Akun", tampil: (b) => `${b.akunKode} ${b.akunNama}` },
              { judul: "Debit", kanan: true, tampil: (b) => (Number(b.debit) ? num(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (Number(b.kredit) ? num(b.kredit) : "") },
            ]}
            baris={detail.baris}
          />
          {detail.status === "POSTED" && (
            <div className="mt-4 text-right"><Btn color="red" onClick={() => batalkan(detail)}>Batalkan (VOID)</Btn></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Donasi wakaf online yang masuk lewat buku ZIS

export function WakafOnline() {
  const [rows, setRows] = useState([]);
  const muat = () => wakaf.online().then(setRows).catch(gagal);
  useEffect(() => { muat(); }, []);
  const catat = async (r) => {
    const { value: jenis, isConfirmed } = await Swal.fire({
      title: `Catat ${r.nomorBukti} ke buku wakaf?`,
      text: `${r.donatur || "Donatur"} — ${rp(r.nilai)}`,
      input: "select",
      inputOptions: { WAKAF_MELALUI_UANG: "Wakaf Melalui Uang", WAKAF_UANG: "Wakaf Uang" },
      inputValue: "WAKAF_MELALUI_UANG",
      showCancelButton: true, confirmButtonText: "Catat", cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      const x = await wakaf.catatOnline(r.nomorBukti, jenis);
      Swal.fire("Tercatat", `Nomor bukti wakaf ${x.nomorBukti}`, "success");
      muat();
    } catch (e) {
      gagal(e);
    }
  };
  return (
    <div>
      <Judul aksi={<Btn color="gray" onClick={muat}>Muat ulang</Btn>}>Donasi Wakaf Online</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Donasi wakaf dari website/aplikasi donatur/teller masih masuk ke buku ZIS (dana WAKAF). Catat ke buku wakaf di sini
        agar tampil di laporan wakaf; setiap transaksi hanya bisa dicatat sekali.
      </p>
      <Tabel
        kolom={[
          { judul: "Nomor bukti ZIS", kunci: "nomorBukti" },
          { judul: "Tanggal", kunci: "tanggal" },
          { judul: "Donatur", kunci: "donatur" },
          { judul: "Metode", tampil: (r) => `${r.metode || "-"} / ${r.kanal || "-"}` },
          { judul: "Nilai", kanan: true, tampil: (r) => num(r.nilai) },
          { judul: "", tampil: (r) => <Btn color="green" onClick={() => catat(r)}>Catat ke buku wakaf</Btn> },
        ]}
        baris={rows}
        kosong="Semua donasi wakaf sudah dicatat di buku wakaf"
      />
    </div>
  );
}

// ------------------------------------------------------------------ Daftar akun wakaf

const KELOMPOK = {
  KAS: "Kas", PIUTANG: "Piutang", SURAT_BERHARGA: "Surat Berharga", LOGAM_MULIA: "Logam Mulia",
  ASET_LANCAR_LAIN: "Aset Lancar Lain", INVESTASI: "Investasi", ASET_TETAP: "Aset Tetap", ASET_TAK_BERWUJUD: "Aset Tak Berwujud",
  ASET_TIDAK_LANCAR_LAIN: "Aset Tidak Lancar Lain", LIABILITAS_PENDEK: "Liabilitas Jk Pendek", LIABILITAS_PANJANG: "Liabilitas Jk Panjang",
  ASET_NETO: "Aset Neto", PENERIMAAN: "Penerimaan", PENGUKURAN_ULANG: "Pengukuran Ulang", HASIL_PENGELOLAAN: "Hasil Pengelolaan",
  BEBAN_PENGELOLAAN: "Beban Pengelolaan", PENYALURAN: "Penyaluran",
};

export function DaftarAkunWakaf() {
  const [meta] = useWakafMeta();
  return (
    <div>
      <Judul>Daftar Akun Wakaf</Judul>
      <p className="text-sm text-gray-500 mb-3">Akun mengikuti &quot;Jenis Akun&quot; laporan BWI dan daftar akun PSAK 412. Terpisah dari COA ZIS.</p>
      <Tabel
        kolom={[
          { judul: "Kode", kunci: "kode" },
          { judul: "Nama akun", kunci: "nama" },
          { judul: "Kelompok", tampil: (a) => KELOMPOK[a.kelompok] || a.kelompok },
          { judul: "Kategori", tampil: (a) => a.grup || "" },
          { judul: "Saldo normal", tampil: (a) => (a.normal === "D" ? "Debit" : "Kredit") },
        ]}
        baris={meta?.akun || []}
      />
    </div>
  );
}
