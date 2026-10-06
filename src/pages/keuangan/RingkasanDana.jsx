import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Pie } from "react-chartjs-2";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, num } from "./ui";
import { barisKopCsv, bukaPdf, gambarKop, muatLogo, simpanCsv } from "./kopLaporan";
import { ModalBukuBesar, paramDariRef, rentangTelusur } from "./telusur";

Chart.register(ArcElement, Tooltip, Legend);

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WARNA = ["#4f81bd", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#c0504d", "#2c4d75", "#77933c", "#b65708", "#7f7f7f"];
const DASAR = [
  ["akhir", "Saldo akhir"],
  ["masuk", "Masuk"],
  ["keluar", "Keluar"],
];
const TAB = [
  ["dana", "Dana"],
  ["campaign", "Campaign"],
  ["bidang", "Bidang"],
  ["bank", "Bank / Tunai"],
];
const jumlah = (arr) => arr.reduce((s, v) => s + (v || 0), 0);
const KOSONG = { awal: 0, masuk: 0, keluar: 0, akhir: 0 };

/**
 * Ringkasan seperti blok LAP BANK di Excel, per bulan terpilih (atau setahun):
 *  - DANA       : dari LPD tiap dana. LPD menyimpan pendayagunaan sebagai angka negatif; Keluar ditampilkan positif.
 *                 Infaq Umum = LPD Infaq dikurangi LPD Campaign (Infaq Terikat), karena LPD Infaq sudah mencakup campaign.
 *  - CAMPAIGN, BIDANG, BANK/TUNAI : dari GET /keuangan/laporan/rincian (LaporanService.rincianLapBank).
 * Setiap tabel berkolom saldo awal | masuk | keluar | saldo akhir; Dana dan Bidang punya diagram pie seperti Excel.
 */
export default function RingkasanDana({ year, bulan }) {
  const [lpd, setLpd] = useState(null);
  const [rincian, setRincian] = useState(null);
  const [gagal, setGagal] = useState("");
  const [tab, setTab] = useState("dana");
  const [telusur, setTelusur] = useState(null); // { judul, params } pop-up buku besar rekening

  useEffect(() => {
    setLpd(null);
    Promise.all(["ZAKAT", "INFAQ", "CAMPAIGN", "DSKL", "OPERASIONAL"].map((f) => keuangan.lpd(f, year)))
      .then(([zakat, infaq, campaign, dskl, amil]) => setLpd({ zakat, infaq, campaign, dskl, amil }))
      .catch((e) => setGagal(errMsg(e)));
  }, [year]);

  useEffect(() => {
    setRincian(null);
    keuangan.rincianLapBank(year, bulan).then(setRincian).catch((e) => setGagal(errMsg(e)));
  }, [year, bulan]);

  if (gagal) return <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">Ringkasan gagal dimuat: {gagal}</div>;
  if (!lpd || !rincian) return <div className="text-gray-400 text-sm mb-4">Memuat ringkasan…</div>;

  // Nilai satu LPD untuk bulan terpilih ("" = setahun penuh).
  const ambil = (r) => {
    const i = bulan ? r.months.indexOf(bulan) : -1;
    if (!r.months.length || (bulan && i < 0)) return KOSONG;
    if (i >= 0) return { awal: r.openingBalance[i], masuk: r.receiptTotals[i], keluar: -r.usageTotals[i], akhir: r.closingBalance[i] };
    return { awal: r.openingBalance[0], masuk: jumlah(r.receiptTotals), keluar: -jumlah(r.usageTotals), akhir: r.closingBalance[r.closingBalance.length - 1] };
  };
  const kurang = (a, b) => ({ awal: a.awal - b.awal, masuk: a.masuk - b.masuk, keluar: a.keluar - b.keluar, akhir: a.akhir - b.akhir });
  const terikat = ambil(lpd.campaign);
  const cutover = rincian.cutover ? `${NAMA_BULAN[parseInt(rincian.cutover.slice(5), 10) - 1]} ${rincian.cutover.slice(0, 4)}` : "cut-over";

  const TABEL = {
    dana: {
      judul: "DANA", kolom: "Dana", total: "TOTAL DANA LAZ SULTAN AGUNG", pie: "akhir",
      baris: [
        { nama: "ZAKAT", ...ambil(lpd.zakat) },
        { nama: "INFAQ UMUM", ...kurang(ambil(lpd.infaq), terikat) },
        { nama: "INFAQ TERIKAT (CAMPAIGN)", ...terikat },
        { nama: "DSKL", ...ambil(lpd.dskl) },
        { nama: "AMIL", ...ambil(lpd.amil) },
      ],
      catatan: "Wakaf dilaporkan di menu Wakaf. Infaq Umum = Infaq dikurangi Infaq Terikat (campaign).",
    },
    campaign: {
      judul: "CAMPAIGN", kolom: "Campaign", total: "TOTAL CAMPAIGN", pie: null,
      baris: rincian.campaign,
      catatan: `Penerimaan dan penyaluran yang ditandai campaign (Infaq Terikat). Saldo campaign dihitung sejak cut-over ${cutover}, karena saldo awal belum dirinci per campaign.`,
    },
    bidang: {
      judul: "BIDANG", kolom: "Bidang", total: "TOTAL", pie: "keluar", luarPie: ["LAINNYA"],
      baris: rincian.bidang,
      catatan: "Bidang diambil dari akun pendayagunaan (Daftar Akun → Bidang program), atau dari kategori campaign. Transaksi Dana Pengelola = AMIL. "
        + `Saldo awal = akumulasi sejak Januari (atau sejak cut-over ${cutover}). "Belum ada bidang" = akun yang belum diberi bidang; tidak digambar di diagram.`,
    },
    bank: {
      judul: "BANK/TUNAI", kolom: "Rekening", total: "TOTAL BANK/TUNAI", pie: null,
      baris: rincian.bank,
      catatan: "Saldo sama dengan halaman Rekening & Harian. Masuk = debit, Keluar = kredit rekening pada periode. Klik nama rekening untuk melihat buku besarnya.",
      onKlik: (b) => setTelusur({
        judul: `${b.kode} ${b.nama}`,
        params: { ...paramDariRef(b.ref), ...rentangTelusur([`${year}-01`, `${year}-12`], bulan) },
      }),
    },
  };

  const judulBulan = bulan ? `${NAMA_BULAN[parseInt(bulan.slice(5), 10) - 1]} ${year}` : `Tahun ${year}`;
  const subjudul = `${bulan ? "Bulan" : "Periode"}: ${judulBulan} | Konsolidasi Zakat, Infaq, DSKL, dan Pengelola`;
  const sufiks = bulan || String(year);
  const barisNilai = (b) => [b.awal, b.masuk, b.keluar, b.akhir];
  const totalDari = (baris) => baris.reduce((t, b) => ({ awal: t.awal + b.awal, masuk: t.masuk + b.masuk, keluar: t.keluar + b.keluar, akhir: t.akhir + b.akhir }), { ...KOSONG });
  const kepala = (t) => [t.kolom, bulan ? "Saldo awal" : "Saldo awal tahun", "Masuk", "Keluar", "Saldo akhir"];

  const unduhCsv = () => {
    const rows = [...barisKopCsv("RINGKASAN DANA (LAP BANK)", subjudul)];
    TAB.forEach(([k]) => {
      const t = TABEL[k];
      rows.push([], [t.judul], kepala(t));
      t.baris.forEach((b) => rows.push([b.nama, ...barisNilai(b)]));
      rows.push([t.total, ...barisNilai(totalDari(t.baris))]);
    });
    simpanCsv(rows, `Ringkasan-LAP-BANK-${sufiks}.csv`);
  };

  const cetak = async () => {
    try {
      const logo = await muatLogo();
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      let y = gambarKop(doc, logo, "RINGKASAN DANA (LAP BANK)", subjudul);
      TAB.forEach(([k], i) => {
        const t = TABEL[k];
        if (i > 0 && y > 230) { doc.addPage(); y = 15; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(t.judul, 14, y + 4);
        autoTable(doc, {
          startY: y + 6,
          head: [kepala(t)],
          body: t.baris.map((b) => [b.nama, ...barisNilai(b).map(num)]),
          foot: [[t.total, ...barisNilai(totalDari(t.baris)).map(num)]],
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 101, 52] },
          footStyles: { fillColor: [224, 247, 250], textColor: 20, fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 62 }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
        });
        y = doc.lastAutoTable.finalY + 8;
      });
      bukaPdf(doc, `Ringkasan-LAP-BANK-${sufiks}.pdf`);
    } catch (e) {
      Swal.fire("Gagal mencetak", e.message, "error");
    }
  };

  const aktif = TABEL[tab];
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-bold">Ringkasan — {judulBulan}</h3>
        <div className="flex gap-2">
          <Btn color="gray" onClick={unduhCsv}>Unduh CSV ringkasan</Btn>
          <Btn color="gray" onClick={cetak}>Cetak ringkasan</Btn>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3 border-b">
        {TAB.map(([k, n]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === k ? "border-green-600 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
            {n}
          </button>
        ))}
      </div>
      <TabelRingkasan key={tab} {...aktif} kepala={kepala(aktif)} />
      {telusur && <ModalBukuBesar judul={telusur.judul} params={telusur.params} onClose={() => setTelusur(null)} />}
    </div>
  );
}

RingkasanDana.propTypes = { year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), bulan: PropTypes.string };

/** Satu tabel ringkasan (uraian | saldo awal | masuk | keluar | saldo akhir), opsional dengan diagram pie. */
function TabelRingkasan({ baris, kepala, total, pie, luarPie = [], catatan, onKlik }) {
  const [dasar, setDasar] = useState(pie || "akhir");
  const tot = baris.reduce((t, b) => ({ awal: t.awal + b.awal, masuk: t.masuk + b.masuk, keluar: t.keluar + b.keluar, akhir: t.akhir + b.akhir }), { ...KOSONG });
  const untukPie = baris.filter((b) => !luarPie.includes(b.kode));
  const nilaiPie = untukPie.map((b) => Math.max(0, b[dasar]));
  const warnaDari = (b) => WARNA[untukPie.indexOf(b) % WARNA.length];

  const tabel = (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            {kepala.map((k, i) => <th key={k} className={`${i ? "text-right px-2" : "text-left px-3"} py-2 ${i === 4 ? "pr-3" : ""}`}>{k}</th>)}
          </tr>
        </thead>
        <tbody>
          {baris.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">Tidak ada data pada periode ini</td></tr>
          )}
          {baris.map((b, i) => (
            <tr key={`${b.kode || b.nama}-${i}`} className={`border-t ${luarPie.includes(b.kode) ? "text-gray-500" : ""}`}>
              <td className="px-3 py-1.5">
                {pie && !luarPie.includes(b.kode) && <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ background: warnaDari(b) }} />}
                {onKlik && b.ref ? (
                  <button type="button" className="text-left text-blue-700 hover:underline" title="Lihat buku besar" onClick={() => onKlik(b)}>
                    {b.kode} {b.nama}
                  </button>
                ) : b.nama}
              </td>
              {[b.awal, b.masuk, b.keluar, b.akhir].map((x, j) => (
                <td key={j} className={`px-2 text-right tabular-nums ${x < 0 ? "text-red-600" : ""} ${j === 3 ? "pr-3 font-medium" : ""}`}>{num(x)}</td>
              ))}
            </tr>
          ))}
          <tr className="border-t font-semibold bg-cyan-50">
            <td className="px-3 py-1.5">{total}</td>
            {[tot.awal, tot.masuk, tot.keluar, tot.akhir].map((x, j) => (
              <td key={j} className={`px-2 text-right tabular-nums ${x < 0 ? "text-red-600" : ""} ${j === 3 ? "pr-3" : ""}`}>{num(x)}</td>
            ))}
          </tr>
        </tbody>
      </table>
      {catatan && <p className="text-xs text-gray-500 mt-2">{catatan}</p>}
    </div>
  );

  if (!pie) return tabel;
  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-4 items-start">
      {tabel}
      <div>
        <label className="text-sm text-gray-600 flex items-center justify-end gap-2 mb-2">
          Diagram berdasarkan
          <select className="border rounded px-2 py-1" value={dasar} onChange={(e) => setDasar(e.target.value)}>
            {DASAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>
        <div className="h-72">
          {jumlah(nilaiPie) > 0 ? (
            <Pie
              data={{ labels: untukPie.map((b) => b.nama), datasets: [{ data: nilaiPie, backgroundColor: untukPie.map(warnaDari) }] }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: (c) => `${c.label}: ${num(c.raw)} (${((c.raw / jumlah(nilaiPie)) * 100).toFixed(1)}%)`,
                    },
                  },
                },
              }}
            />
          ) : <div className="h-full flex items-center justify-center text-sm text-gray-400">Tidak ada nilai positif untuk digambar</div>}
        </div>
        <p className="text-xs text-gray-400 text-right">Nilai minus tidak digambar.</p>
      </div>
    </div>
  );
}

TabelRingkasan.propTypes = {
  baris: PropTypes.arrayOf(PropTypes.object).isRequired,
  kepala: PropTypes.arrayOf(PropTypes.string).isRequired,
  total: PropTypes.string,
  pie: PropTypes.string,
  luarPie: PropTypes.arrayOf(PropTypes.string),
  catatan: PropTypes.string,
  onKlik: PropTypes.func,
};
