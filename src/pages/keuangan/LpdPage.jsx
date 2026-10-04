import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls, num } from "./ui";
import { barisKopCsv, simpanCsv } from "./kopLaporan";
import { cetakLaporanBulanan } from "./cetakLaporan";

const FUND = [
  { id: "ZAKAT", nama: "Zakat" },
  { id: "INFAQ", nama: "Infaq / Shodaqoh" },
  { id: "DSKL", nama: "DSKL" },
  { id: "OPERASIONAL", nama: "Operasional (Amil)" },
  { id: "CAMPAIGN", nama: "Campaign (Infaq Terikat)" },
];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const namaBulan = (p) => BULAN[parseInt(p.slice(5), 10) - 1] || p;
const jumlah = (arr) => arr.reduce((s, v) => s + (v || 0), 0);

export default function LpdPage({ onLacak }) {
  const [fund, setFund] = useState("ZAKAT");
  const [year, setYear] = useState(new Date().getFullYear());
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    keuangan.lpd(fund, year).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [fund, year]);

  const bulanPeriode = () => `Periode: ${namaBulan(r.months[0])} s/d ${namaBulan(r.months[r.months.length - 1])} ${r.year}`;

  // Baris-baris laporan dalam satu bentuk, dipakai bersama oleh CSV dan cetak PDF.
  const susunBaris = () => {
    const rows = [{ tipe: "header", label: r.receiptTitle }];
    r.receiptLines.forEach((l) => rows.push({ tipe: "item", label: l.label, nilai: l.monthly }));
    rows.push({ tipe: "total", label: "Jumlah Penerimaan", nilai: r.receiptTotals });
    rows.push({ tipe: "header", label: r.usageTitle });
    r.usageGroups.forEach((g) => {
      if (g.title) rows.push({ tipe: "sub", label: g.title });
      g.lines.forEach((l) => rows.push({ tipe: "item", label: l.label, nilai: l.monthly }));
    });
    rows.push({ tipe: "total", label: "Jumlah Pendayagunaan", nilai: r.usageTotals });
    rows.push({ tipe: "total", label: "Surplus (Defisit)", nilai: r.surplus });
    rows.push({ tipe: "item", label: "Saldo Awal", nilai: r.openingBalance, jumlah: false });
    rows.push({ tipe: "total", label: "Saldo Akhir", nilai: r.closingBalance, jumlah: false });
    return rows;
  };

  const adaData = () => {
    if (r && n > 0) return true;
    Swal.fire("Tidak ada data", `Belum ada data ${r?.reportTitle || "LPD"} untuk tahun ${year}.`, "info");
    return false;
  };

  const unduhCsv = () => {
    if (!adaData()) return;
    const rows = [...barisKopCsv(r.reportTitle, bulanPeriode()), ["Uraian", ...r.months.map(namaBulan), "Jumlah"]];
    susunBaris().forEach((x) => {
      if (!x.nilai) return rows.push([x.label]);
      rows.push([x.label, ...x.nilai, x.jumlah === false ? "" : jumlah(x.nilai)]);
    });
    simpanCsv(rows, `LPD-${fund}-${year}.csv`);
  };

  const cetak = () => {
    if (!adaData()) return;
    cetakLaporanBulanan({
      judul: r.reportTitle, subjudul: bulanPeriode(), kolom: r.months.map(namaBulan), rows: susunBaris(),
      namaFile: `LPD-${fund}-${year}.pdf`,
    });
  };

  const n = r?.months.length || 0;
  const Baris = ({ label, vals, tebal, indent, total = true, accountId }) => (
    <tr className={`border-t ${tebal ? "font-semibold bg-gray-50" : ""}`}>
      <td className={`py-1.5 px-3 ${indent ? "pl-8" : ""}`}>{label}</td>
      {vals.map((v, i) => (
        <td key={i} className={`py-1.5 px-2 text-right tabular-nums ${v < 0 ? "text-red-600" : ""}`}>
          {accountId && v !== 0 && onLacak ? (
            <button
              type="button"
              className="hover:underline hover:text-blue-700"
              title={`Lacak jurnal sumber ${label} · ${r.months[i]}`}
              onClick={() => onLacak({ dana: fund, periode: r.months[i], akun: accountId, akunLabel: label })}
            >
              {num(v)}
            </button>
          ) : num(v)}
        </td>
      ))}
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
            <Btn color="gray" onClick={unduhCsv}>Unduh CSV</Btn>
            <Btn color="gray" onClick={cetak}>Cetak</Btn>
          </>
        }
      >
        Laporan Perubahan Dana
      </Judul>
      <p className="text-sm text-gray-500 mb-3">
        Dihitung langsung dari buku besar; sama persis dengan yang dibaca aplikasi mobile. Bulan sebelum tanggal cut-over
        dihitung mundur dari saldo awal.
        {onLacak && <> Klik angka pada baris akun untuk melacak jurnal sumbernya.</>}
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
              {r.receiptLines.map((l, i) => <Baris key={`${l.label}-${i}`} label={l.label} vals={l.monthly} accountId={l.accountId} indent />)}
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

LpdPage.propTypes = {
  onLacak: PropTypes.func,
};

// eslint-disable-next-line react/prop-types
function FragmentGrup({ g, n, Baris }) {
  return (
    <>
      {g.title && <tr><td colSpan={n + 2} className="py-1.5 px-3 text-gray-500 font-medium">{g.title}</td></tr>}
      {g.lines.map((l, i) => <Baris key={`${l.label}-${i}`} label={l.label} vals={l.monthly} accountId={l.accountId} indent />)}
    </>
  );
}
