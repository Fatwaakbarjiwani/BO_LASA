import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls, num } from "./ui";
import { barisKopCsv, simpanCsv } from "./kopLaporan";
import { cetakLaporanBulanan } from "./cetakLaporan";
import { ModalBukuBesar, paramDariRef, rentangTelusur } from "./telusur";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const namaBulan = (p) => BULAN[parseInt(p.slice(5), 10) - 1] || p;
const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const jumlah = (arr) => arr.reduce((s, v) => s + (v || 0), 0);
const TIPE = { HEADER: "header", ITEM: "item", TOTAL: "total" };

/** Laba Rugi konsolidasi Zakat + Infaq + DSKL + Pengelola, dihitung dari buku besar (LaporanService.labaRugi). */
export default function LabaRugiPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [r, setR] = useState(null);
  const [bulan, setBulan] = useState(""); // "" = seluruh bulan; "2026-03" = satu bulan saja
  const [loading, setLoading] = useState(false);
  const [telusur, setTelusur] = useState(null); // { judul, params } pop-up buku besar

  useEffect(() => {
    setLoading(true);
    keuangan.labaRugi(year).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [year]);

  // Tampilan terpilih: seluruh bulan, atau satu bulan saja (Laba Rugi bulanan).
  const idx = r && bulan ? r.months.indexOf(bulan) : -1;
  const bulanTampil = !r ? [] : idx >= 0 ? [r.months[idx]] : r.months;
  const nilaiTampil = (vals) => (idx >= 0 ? [vals[idx]] : vals);
  const n = bulanTampil.length;
  const periode = () => `${idx >= 0 ? `Bulan: ${NAMA_BULAN[parseInt(bulan.slice(5), 10) - 1]} ${r.year}` : `Periode: ${namaBulan(r.months[0])} s/d ${namaBulan(r.months[r.months.length - 1])} ${r.year}`} | Konsolidasi Zakat, Infaq, DSKL, dan Pengelola`;
  const adaData = () => {
    if (r && r.months.length > 0) return true;
    Swal.fire("Tidak ada data", `Belum ada data laba rugi tahun ${year}.`, "info");
    return false;
  };

  const sufiks = () => (idx >= 0 ? `${year}-${bulan.slice(5)}` : year);
  const unduhCsv = () => {
    if (!adaData()) return;
    const rows = [...barisKopCsv(r.title, periode()), ["Uraian", ...bulanTampil.map(namaBulan), ...(idx >= 0 ? [] : ["Jumlah"])]];
    r.lines.forEach((l) => rows.push(l.values ? [l.label, ...nilaiTampil(l.values), ...(idx >= 0 ? [] : [jumlah(l.values)])] : [l.label]));
    simpanCsv(rows, `Laba-Rugi-${sufiks()}.csv`);
  };

  const cetak = () => {
    if (!adaData()) return;
    cetakLaporanBulanan({
      judul: r.title, subjudul: periode(), kolom: bulanTampil.map(namaBulan), namaFile: `Laba-Rugi-${sufiks()}.pdf`, tanpaJumlah: idx >= 0,
      rows: r.lines.map((l) => ({ tipe: TIPE[l.style] || "item", label: l.label, nilai: l.values ? nilaiTampil(l.values) : undefined, jumlah: idx < 0 })),
    });
  };

  return (
    <div>
      <Judul
        aksi={
          <>
            <input type="number" className={`${inputCls} w-28`} value={year} onChange={(e) => { setYear(e.target.value); setBulan(""); }} />
            <select className={`${inputCls} w-44`} value={bulan} onChange={(e) => setBulan(e.target.value)} title="Tampilkan seluruh bulan atau satu bulan saja">
              <option value="">Semua bulan (tahunan)</option>
              {(r?.months || []).map((m) => <option key={m} value={m}>{NAMA_BULAN[parseInt(m.slice(5), 10) - 1]} (bulanan)</option>)}
            </select>
            <Btn color="gray" onClick={unduhCsv}>Unduh CSV</Btn>
            <Btn color="gray" onClick={cetak}>Cetak</Btn>
          </>
        }
      >
        Laba Rugi
      </Judul>
      <p className="text-sm text-gray-500 mb-3">
        Gabungan seluruh dana (Zakat, Infaq termasuk campaign, DSKL, Pengelola) dari buku besar. Alokasi hak amil dan transfer
        antar dana tidak dihitung agar tidak ganda. Wakaf punya laporan sendiri di menu Wakaf. Klik nama baris untuk menelusuri buku besar dan jurnalnya.
      </p>
      {loading && <div className="text-gray-400">Memuat…</div>}
      {r && r.months.length === 0 && !loading && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">Belum ada data tahun {r.year}.</div>}
      {r && r.months.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <caption className="text-left p-3 font-bold">{r.title} — {idx >= 0 ? `${NAMA_BULAN[parseInt(bulan.slice(5), 10) - 1]} ` : "Tahun "}{r.year}</caption>
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-2 px-3">Uraian</th>
                {bulanTampil.map((m) => <th key={m} className="text-right px-2">{namaBulan(m)}</th>)}
                {idx < 0 && <th className="text-right px-3">Jumlah</th>}
              </tr>
            </thead>
            <tbody>
              {r.lines.map((l) =>
                l.values ? (
                  <tr key={l.label} className={`border-t ${l.style === "TOTAL" ? "font-semibold bg-gray-50" : ""}`}>
                    <td className={`py-1.5 px-3 ${l.style === "ITEM" ? "pl-8" : ""}`}>
                      {l.ref ? (
                        <button type="button" className="text-left text-blue-700 hover:underline" title="Telusuri buku besar"
                          onClick={() => setTelusur({ judul: l.label, params: { ...paramDariRef(l.ref), ...rentangTelusur(r.months, bulan) } })}>{l.label}</button>
                      ) : l.label}
                    </td>
                    {nilaiTampil(l.values).map((v, i) => (
                      <td key={i} className={`py-1.5 px-2 text-right tabular-nums ${v < 0 ? "text-red-600" : ""}`}>{num(v)}</td>
                    ))}
                    {idx < 0 && <td className={`py-1.5 px-3 text-right tabular-nums font-medium ${jumlah(l.values) < 0 ? "text-red-600" : ""}`}>{num(jumlah(l.values))}</td>}
                  </tr>
                ) : (
                  <tr key={l.label}>
                    <td colSpan={n + (idx < 0 ? 2 : 1)} className="py-2 px-3 font-bold text-green-800 bg-green-50">{l.label}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
      {telusur && <ModalBukuBesar judul={telusur.judul} params={telusur.params} onClose={() => setTelusur(null)} />}
    </div>
  );
}
