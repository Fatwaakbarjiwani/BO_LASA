import { useCallback, useState } from "react";
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
 * Administrasi Keuangan. Halaman dikelompokkan menurut alur kerja, lalu ditata dalam dua baris:
 * baris 1 = tempat menginput/mengelola data master & transaksi (Daftar Akun paling depan, kiri atas),
 * baris 2 = seluruh laporan. Halaman lama dipertahankan di grup "Lama" (baris 1, ditampilkan pudar)
 * selama masa berjalan paralel dan akan dipensiunkan setelah laporan baru divalidasi terhadap workbook Excel.
 */
const GRUP = [
  {
    nama: "Master",
    baris: "input",
    item: [
      ["coa", "Daftar Akun (COA)", CoaPage],
      ["saldoAwal", "Saldo Awal", SaldoAwal],
      ["rekening", "Rekening & Harian", RekeningPage],
      ["mustahik", "Mustahik & Mauquf Alaih", MustahikPage],
    ],
  },
  {
    nama: "Transaksi",
    baris: "input",
    item: [
      ["inputJurnal", "Input Jurnal", InputJurnal],
      ["daftarJurnal", "Daftar Jurnal", DaftarJurnal],
    ],
  },
  {
    nama: "Periode",
    baris: "input",
    item: [
      ["periode", "Tutup Buku", PeriodePage],
      ["setoran", "Setoran Internal", SetoranPage],
    ],
  },
  { nama: "Sistem", baris: "input", item: [["monitor", "Monitor & Pengaturan", MonitorPage]] },
  {
    nama: "Lama",
    baris: "input",
    pudar: true,
    item: [
      ["jurnalUmum", "Jurnal Umum (lama)", JurnalUmum],
      ["jurnal", "Jurnal (lama)", Jurnal],
      ["laporanAktifitas", "Laporan Aktivitas (lama)", LaporanAktifitas],
      ["laporanPengelola", "Laporan Pengelola (lama)", LaporanPengelola],
    ],
  },
  {
    nama: "Laporan",
    baris: "laporan",
    item: [
      ["lpd", "Perubahan Dana (LPD)", LpdPage],
      ["bukuBesar", "Buku Besar", BukuBesar],
      ["neracaSaldo", "Neraca Saldo", NeracaSaldo],
      ["posisiKeuangan", "Posisi Keuangan", LaporanPosisiKeuangan],
    ],
  },
];

const BARIS_URUT = ["input", "laporan"];

export default function Administrasi({ initial } = {}) {
  const [page, setPage] = useState(initial || "inputJurnal");
  // Filter "lacak sumber": dikirim laporan (mis. LPD) ke Daftar Jurnal supaya angka bisa ditelusuri
  // ke jurnal aslinya. Setiap panggilan trace() membuat objek baru walau isinya sama, supaya klik
  // ulang pada baris yang sama tetap memicu useEffect di DaftarJurnal.
  const [lacak, setLacak] = useState(null);
  const trace = useCallback((filter) => {
    setLacak({ ...filter, _t: Date.now() });
    setPage("daftarJurnal");
  }, []);

  const aktif = GRUP.flatMap((g) => g.item).find(([id]) => id === page);
  const Halaman = aktif ? aktif[2] : null;
  const propsHalaman =
    page === "lpd" ? { onLacak: trace } : page === "daftarJurnal" ? { initialFilter: lacak } : {};

  return (
    <div className="space-y-4">
      <div className="text-3xl font-extrabold text-gray-800">Administrasi Keuangan</div>
      <div className="bg-white rounded-lg shadow px-4 py-3 space-y-3">
        {BARIS_URUT.map((baris, i) => (
          <div key={baris} className={i > 0 ? "flex flex-wrap gap-x-6 gap-y-3 pt-3 border-t border-gray-100" : "flex flex-wrap gap-x-6 gap-y-3"}>
            {GRUP.filter((g) => g.baris === baris).map((g) => (
              <div key={g.nama} className={g.pudar ? "opacity-60" : ""}>
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
        ))}
      </div>
      <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
        {Halaman && <Halaman key={page} {...propsHalaman} />}
      </div>
    </div>
  );
}
