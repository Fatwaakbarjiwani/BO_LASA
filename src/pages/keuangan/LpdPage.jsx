import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls, num } from "./ui";

const FUND = [
  { id: "ZAKAT", nama: "Zakat" },
  { id: "INFAQ", nama: "Infaq / Shodaqoh" },
  { id: "DSKL", nama: "DSKL" },
  { id: "OPERASIONAL", nama: "Operasional (Amil)" },
  { id: "WAKAF", nama: "Wakaf" },
];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const namaBulan = (p) => BULAN[parseInt(p.slice(5), 10) - 1] || p;
const jumlah = (arr) => arr.reduce((s, v) => s + (v || 0), 0);

export default function LpdPage() {
  const [fund, setFund] = useState("ZAKAT");
  const [year, setYear] = useState(new Date().getFullYear());
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    keuangan.lpd(fund, year).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [fund, year]);

  const unduhCsv = () => {
    if (!r) return;
    const rows = [[r.reportTitle], [`Tahun ${r.year}`], [], ["Uraian", ...r.months.map(namaBulan), "Jumlah"]];
    rows.push([r.receiptTitle]);
    r.receiptLines.forEach((l) => rows.push([l.label, ...l.monthly, jumlah(l.monthly)]));
    rows.push(["Jumlah Penerimaan", ...r.receiptTotals, jumlah(r.receiptTotals)]);
    rows.push([r.usageTitle]);
    r.usageGroups.forEach((g) => {
      if (g.title) rows.push([g.title]);
      g.lines.forEach((l) => rows.push([l.label, ...l.monthly, jumlah(l.monthly)]));
    });
    rows.push(["Jumlah Pendayagunaan", ...r.usageTotals, jumlah(r.usageTotals)]);
    rows.push(["Surplus (Defisit)", ...r.surplus, jumlah(r.surplus)]);
    rows.push(["Saldo Awal", ...r.openingBalance]);
    rows.push(["Saldo Akhir", ...r.closingBalance]);
    const csv = rows.map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `LPD-${fund}-${year}.csv`;
    a.click();
  };

  const n = r?.months.length || 0;
  const Baris = ({ label, vals, tebal, indent, total = true }) => (
    <tr className={`border-t ${tebal ? "font-semibold bg-gray-50" : ""}`}>
      <td className={`py-1.5 px-3 ${indent ? "pl-8" : ""}`}>{label}</td>
      {vals.map((v, i) => <td key={i} className={`py-1.5 px-2 text-right tabular-nums ${v < 0 ? "text-red-600" : ""}`}>{num(v)}</td>)}
      <td className="py-1.5 px-3 text-right tabular-nums font-medium">{total ? num(jumlah(vals)) : ""}</td>
    </tr>
  );

  return (
    <div>
      <Judul
        aksi={
          <>
            <select className={inputCls} value={fund} onChange={(e) => setFund(e.target.value)}>
              {FUND.map((f) => <option key={f.id} value={f.id}>{f.nama}</option>)}
            </select>
            <input type="number" className={`${inputCls} w-28`} value={year} onChange={(e) => setYear(e.target.value)} />
            <Btn color="gray" onClick={unduhCsv} disabled={!r || n === 0}>Unduh CSV</Btn>
            <Btn color="gray" onClick={() => window.print()}>Cetak</Btn>
          </>
        }
      >
        Laporan Perubahan Dana
      </Judul>
      <p className="text-sm text-gray-500 mb-3">
        Dihitung langsung dari buku besar; sama persis dengan yang dibaca aplikasi mobile. Bulan sebelum tanggal cut-over
        dihitung mundur dari saldo awal.
      </p>
      {loading && <div className="text-gray-400">Memuat…</div>}
      {r && n === 0 && !loading && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">Belum ada data untuk {r.reportTitle} tahun {r.year}.</div>}
      {r && n > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <caption className="text-left p-3 font-bold">{r.reportTitle} — Tahun {r.year}</caption>
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-2 px-3">Uraian</th>
                {r.months.map((m) => <th key={m} className="text-right px-2">{namaBulan(m)}</th>)}
                <th className="text-right px-3">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={n + 2} className="py-2 px-3 font-bold text-green-800 bg-green-50">{r.receiptTitle}</td></tr>
              {r.receiptLines.map((l) => <Baris key={l.label} label={l.label} vals={l.monthly} indent />)}
              <Baris label="Jumlah Penerimaan" vals={r.receiptTotals} tebal />
              <tr><td colSpan={n + 2} className="py-2 px-3 font-bold text-amber-800 bg-amber-50">{r.usageTitle}</td></tr>
              {r.usageGroups.map((g, gi) => (
                <FragmentGrup key={gi} g={g} n={n} Baris={Baris} />
              ))}
              <Baris label="Jumlah Pendayagunaan" vals={r.usageTotals} tebal />
              <Baris label="Surplus (Defisit)" vals={r.surplus} tebal />
              <Baris label="Saldo Awal" vals={r.openingBalance} total={false} />
              <Baris label="Saldo Akhir" vals={r.closingBalance} tebal total={false} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function FragmentGrup({ g, n, Baris }) {
  return (
    <>
      {g.title && <tr><td colSpan={n + 2} className="py-1.5 px-3 text-gray-500 font-medium">{g.title}</td></tr>}
      {g.lines.map((l) => <Baris key={l.label} label={l.label} vals={l.monthly} indent />)}
    </>
  );
}
