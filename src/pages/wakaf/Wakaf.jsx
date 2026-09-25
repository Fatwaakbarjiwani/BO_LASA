import { useState } from "react";
import PropTypes from "prop-types";
import { HasilPengelolaan, MutasiPengelolaan, PenerimaanHarta, PengukuranUlang, PenyaluranMauquf } from "./WakafInput";
import { DaftarAkunWakaf, DaftarHarta, DaftarJurnalWakaf, WakafOnline } from "./WakafData";
import { BukuBesarWakaf, LaporanWakaf, WakafTemporer } from "./WakafLaporan";

const Lap = (jenis) => {
  const C = () => <LaporanWakaf jenis={jenis} />;
  C.displayName = `Laporan-${jenis}`;
  return C;
};

/**
 * Menu Wakaf: buku wakaf terpisah dari Administrasi Keuangan ZIS (tabel dan laporan sendiri).
 * Input mengikuti sheet laporan BWI; laporan mengikuti BWI dan PSAK 412.
 */
const GRUP = [
  {
    nama: "Input (format BWI)",
    item: [
      ["penerimaan", "Penerimaan Harta Wakaf", PenerimaanHarta],
      ["mutasi", "Mutasi Pengelolaan", MutasiPengelolaan],
      ["ukur", "Dampak Pengukuran Ulang", PengukuranUlang],
      ["hasil", "Hasil Pengelolaan", HasilPengelolaan],
      ["penyaluran", "Penyaluran Mauquf Alaih", PenyaluranMauquf],
      ["online", "Donasi Wakaf Online", WakafOnline],
    ],
  },
  {
    nama: "Data",
    item: [
      ["harta", "Daftar Harta Wakaf", DaftarHarta],
      ["jurnal", "Daftar Jurnal", DaftarJurnalWakaf],
      ["akun", "Daftar Akun", DaftarAkunWakaf],
    ],
  },
  {
    nama: "Laporan BWI",
    item: [
      ["aktivitas", "Laporan Aktivitas", Lap("aktivitas")],
      ["arusKas", "Laporan Arus Kas", Lap("arus-kas")],
      ["rincianAset", "Laporan Rincian Aset", Lap("rincian-aset")],
      ["posisi", "Laporan Posisi Keuangan", Lap("posisi")],
    ],
  },
  {
    nama: "PSAK 412",
    item: [
      ["neracaSaldo", "Neraca Saldo", Lap("neraca-saldo")],
      ["bukuBesar", "Buku Besar", BukuBesarWakaf],
      ["temporer", "Wakaf Temporer", WakafTemporer],
    ],
  },
];

export default function Wakaf({ initial } = {}) {
  const [page, setPage] = useState(initial || "penerimaan");
  const aktif = GRUP.flatMap((g) => g.item).find(([id]) => id === page);
  const Halaman = aktif ? aktif[2] : null;
  return (
    <div className="space-y-4">
      <div className="text-3xl font-extrabold text-gray-800">Wakaf</div>
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
                    page === id ? "bg-green-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-green-100"
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
Wakaf.propTypes = { initial: PropTypes.string };
