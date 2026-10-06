import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls, num } from "./ui";
import { barisKopCsv, simpanCsv } from "./kopLaporan";
import { cetakLaporanBulanan } from "./cetakLaporan";
import { Paginasi } from "./alatJurnal";
import { ModalBukuBesar, paramDariRef, rentangTelusur } from "./telusur";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const namaBulan = (p) => BULAN[parseInt(p.slice(5), 10) - 1] || p;
const namaPanjang = (p) => NAMA_BULAN[parseInt(p.slice(5), 10) - 1] || p;
const TIPE = { HEADER: "header", ITEM: "item", TOTAL: "total" };
const UKURAN = 25;

const INFO = {
  NERACA: {
    judul: "Neraca",
    file: "Neraca",
    ket: "Saldo akhir tiap akun per akhir bulan (saldo awal + seluruh jurnal POSTED s/d bulan tsb.), gabungan Zakat, Infaq, DSKL, dan Pengelola. Wakaf punya laporan sendiri di menu Wakaf.",
  },
  POSISI: {
    judul: "Posisi Keuangan",
    file: "Posisi-Keuangan",
    ket: "Laporan posisi keuangan format ISAK 35: aset, liabilitas, dan aset neto diringkas per dana, per akhir bulan. Wakaf punya laporan sendiri di menu Wakaf.",
  },
  NERACA_SALDO: {
    judul: "Neraca Saldo",
    file: "Neraca-Saldo",
    ket: "Saldo seluruh akun per akhir bulan. Tampilan bulanan memisahkan kolom Debit dan Kredit; pada tampilan tahunan angka dalam kurung adalah saldo kredit.",
  },
};

/** Neraca / Posisi Keuangan / Neraca Saldo (LaporanService.neraca), filter tahunan atau bulanan seperti Laba Rugi. */
export default function NeracaPage({ mode = "NERACA" }) {
  const info = INFO[mode];
  const saldo = mode === "NERACA_SALDO";
  const [year, setYear] = useState(new Date().getFullYear());
  const [r, setR] = useState(null);
  const [bulan, setBulan] = useState(""); // "" = seluruh bulan; "2026-03" = posisi akhir bulan tsb.
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [telusur, setTelusur] = useState(null); // { judul, params } pop-up buku besar

  useEffect(() => {
    setLoading(true);
    keuangan.neraca(year, mode).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [year, mode]);
  useEffect(() => setPage(1), [year, bulan]);

  const idx = r && bulan ? r.months.indexOf(bulan) : -1;
  const bulanan = idx >= 0;
  const bulanTampil = !r ? [] : bulanan ? [r.months[idx]] : r.months;
  // Kolom & nilai yang tampil. Neraca saldo bulanan dipecah menjadi Debit | Kredit.
  const kolom = saldo && bulanan ? ["Debit", "Kredit"] : bulanTampil.map(namaBulan);
  const nilaiTampil = (l) => {
    const vals = bulanan ? [l.values[idx]] : l.values;
    if (saldo && bulanan) {
      const v = vals[0];
      if (l.style === "TOTAL") return l.label.includes("DEBIT") ? [v, null] : [null, v];
      return [v > 0 ? v : null, v < 0 ? -v : null];
    }
    return vals;
  };
  const teks = (v) => (v == null ? "" : saldo && !bulanan && v < 0 ? `(${num(-v)})` : num(v));

  const periode = () =>
    `${bulanan ? `Per akhir ${namaPanjang(bulan)} ${r.year}` : `Periode: ${namaBulan(r.months[0])} s/d ${namaBulan(r.months[r.months.length - 1])} ${r.year} (saldo akhir tiap bulan)`} | Konsolidasi Zakat, Infaq, DSKL, dan Pengelola`;
  const adaData = () => {
    if (r && r.months.length > 0) return true;
    Swal.fire("Tidak ada data", `Belum ada data ${info.judul.toLowerCase()} tahun ${year}.`, "info");
    return false;
  };
  const sufiks = () => (bulanan ? `${year}-${bulan.slice(5)}` : year);

  const unduhCsv = () => {
    if (!adaData()) return;
    const rows = [...barisKopCsv(r.title, periode()), ["Uraian", ...kolom]];
    r.lines.forEach((l) => rows.push(l.values ? [l.label, ...nilaiTampil(l).map((v) => (v == null ? "" : v))] : [l.label]));
    simpanCsv(rows, `${info.file}-${sufiks()}.csv`);
  };

  const cetak = () => {
    if (!adaData()) return;
    cetakLaporanBulanan({
      judul: r.title, subjudul: periode(), kolom, namaFile: `${info.file}-${sufiks()}.pdf`, tanpaJumlah: true,
      rows: r.lines.map((l) => ({ tipe: TIPE[l.style] || "item", label: l.label, nilai: l.values ? nilaiTampil(l).map((v) => v ?? 0) : undefined, jumlah: false })),
    });
  };

  const lines = r?.lines || [];
  const halaman = lines.slice((page - 1) * UKURAN, page * UKURAN);

  return (
    <div>
      <Judul
        aksi={
          <>
            <input type="number" className={`${inputCls} w-28`} value={year} onChange={(e) => { setYear(e.target.value); setBulan(""); }} />
            <select className={`${inputCls} w-44`} value={bulan} onChange={(e) => setBulan(e.target.value)} title="Tampilkan seluruh bulan atau satu bulan saja">
              <option value="">Semua bulan (tahunan)</option>
              {(r?.months || []).map((m) => <option key={m} value={m}>{namaPanjang(m)} (bulanan)</option>)}
            </select>
            <Btn color="gray" onClick={unduhCsv}>Unduh CSV</Btn>
            <Btn color="gray" onClick={cetak}>Cetak</Btn>
          </>
        }
      >
        {info.judul}
      </Judul>
      <p className="text-sm text-gray-500 mb-3">{info.ket} Klik nama akun untuk menelusuri buku besar dan jurnalnya.</p>
      {loading && <div className="text-gray-400">Memuat…</div>}
      {r && r.months.length === 0 && !loading && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">Belum ada data tahun {r.year}.</div>}
      {r && r.months.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <caption className="text-left p-3 font-bold">{r.title} — {bulanan ? `Per akhir ${namaPanjang(bulan)} ` : "Tahun "}{r.year}</caption>
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left py-2 px-3">Uraian</th>
                  {kolom.map((k) => <th key={k} className="text-right px-2">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {halaman.map((l, i) =>
                  l.values ? (
                    <tr key={`${l.label}-${i}`} className={`border-t ${l.style === "TOTAL" ? "font-semibold bg-gray-50" : ""}`}>
                      <td className={`py-1.5 px-3 ${l.style === "ITEM" && !saldo ? "pl-8" : ""}`}>
                      {l.ref ? (
                        <button type="button" className="text-left text-blue-700 hover:underline" title="Telusuri buku besar"
                          onClick={() => setTelusur({ judul: l.label, params: { ...paramDariRef(l.ref), ...rentangTelusur(r.months, bulan) } })}>{l.label}</button>
                      ) : l.label}
                    </td>
                      {nilaiTampil(l).map((v, j) => (
                        <td key={j} className={`py-1.5 px-2 text-right tabular-nums ${v < 0 && !saldo ? "text-red-600" : ""}`}>{teks(v)}</td>
                      ))}
                    </tr>
                  ) : (
                    <tr key={`${l.label}-${i}`}>
                      <td colSpan={kolom.length + 1} className="py-2 px-3 font-bold text-green-800 bg-green-50">{l.label}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <Paginasi page={page} size={UKURAN} total={lines.length} onPage={setPage} satuan="baris" />
        </>
      )}
      {telusur && <ModalBukuBesar judul={telusur.judul} params={telusur.params} onClose={() => setTelusur(null)} />}
    </div>
  );
}

NeracaPage.propTypes = { mode: PropTypes.oneOf(["NERACA", "POSISI", "NERACA_SALDO"]) };
