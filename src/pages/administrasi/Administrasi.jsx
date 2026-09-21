import { useState } from "react";
import Jurnal from "../jurnal/admin/Jurnal";
import JurnalUmum from "../jurnal/admin/JurnalUmum";
import BukuBesar from "../bukuBesar/BukuBesar";
import SaldoAwal from "../saldoAwal/SaldoAwal";
import LaporanPosisiKeuangan from "../neraca/LaporanPosisiKeuangan";
import LaporanAktifitas from "../laporanAktifitas/LaporanAktifitas";
import LaporanPengelola from "../laporanPengelola/LaporanPengelola";
import NeracaSaldo from "../neracaSaldo/NeracaSaldo";
import CoaPage from "../keuangan/CoaPage";
import InputJurnal from "../keuangan/InputJurnal";
import DaftarJurnal from "../keuangan/DaftarJurnal";
import LpdPage from "../keuangan/LpdPage";
import PeriodePage from "../keuangan/PeriodePage";
import MustahikPage from "../keuangan/MustahikPage";
import RekeningPage from "../keuangan/RekeningPage";
import SetoranPage from "../keuangan/SetoranPage";
import MonitorPage from "../keuangan/MonitorPage";

/**
 * Administrasi Keuangan. Halaman dikelompokkan menurut alur kerja; halaman lama dipertahankan di grup "Lama"
 * selama masa berjalan paralel dan akan dipensiunkan setelah laporan baru divalidasi terhadap workbook Excel.
 */
const GRUP = [
  {
    nama: "Master",
    item: [
      ["coa", "COA", CoaPage],
      ["saldoAwal", "Saldo Awal", SaldoAwal],
      ["rekening", "Rekening & Harian", RekeningPage],
      ["mustahik", "Mustahik", MustahikPage],
    ],
  },
  {
    nama: "Transaksi",
    item: [
      ["inputJurnal", "Input Jurnal", InputJurnal],
      ["daftarJurnal", "Daftar Jurnal", DaftarJurnal],
    ],
  },
  {
    nama: "Laporan",
    item: [
      ["lpd", "Perubahan Dana (LPD)", LpdPage],
      ["bukuBesar", "Buku Besar", BukuBesar],
      ["neracaSaldo", "Neraca Saldo", NeracaSaldo],
      ["posisiKeuangan", "Posisi Keuangan", LaporanPosisiKeuangan],
    ],
  },
  {
    nama: "Periode",
    item: [
      ["periode", "Tutup Buku", PeriodePage],
      ["setoran", "Setoran Internal", SetoranPage],
    ],
  },
  { nama: "Sistem", item: [["monitor", "Monitor & Pengaturan", MonitorPage]] },
  {
    nama: "Lama",
    item: [
      ["jurnalUmum", "Jurnal Umum (lama)", JurnalUmum],
      ["jurnal", "Jurnal (lama)", Jurnal],
      ["laporanAktifitas", "Laporan Aktivitas (lama)", LaporanAktifitas],
      ["laporanPengelola", "Laporan Pengelola (lama)", LaporanPengelola],
    ],
  },
];

export default function Administrasi({ initial } = {}) {
  const [page, setPage] = useState(initial || "inputJurnal");
  const aktif = GRUP.flatMap((g) => g.item).find(([id]) => id === page);
  const Halaman = aktif ? aktif[2] : null;

  return (
    <div className="space-y-4">
      <div className="text-3xl font-extrabold text-gray-800">Administrasi Keuangan</div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 bg-white rounded-lg shadow px-4 py-3">
        {GRUP.map((g) => (
          <div key={g.nama}>
            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{g.nama}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.item.map(([id, nama]) => (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg text-nowrap transition ${
                    page === id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {nama}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 rounded-lg shadow-lg">{Halaman && <Halaman key={page} />}</div>
    </div>
  );
}
