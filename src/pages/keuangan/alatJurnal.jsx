import PropTypes from "prop-types";
import { Btn, inputCls } from "./ui";

/** Rentang tanggal awal s.d. akhir (YYYY-MM-DD). Kosong = tanpa batas. */
export function RentangTanggal({ dari, sampai, onChange, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input type="date" className={inputCls} value={dari} max={sampai || undefined} title="Tanggal awal"
        onChange={(e) => onChange(e.target.value, sampai)} />
      <span className="text-gray-500 text-sm whitespace-nowrap">s.d.</span>
      <input type="date" className={inputCls} value={sampai} min={dari || undefined} title="Tanggal akhir"
        onChange={(e) => onChange(dari, e.target.value)} />
    </div>
  );
}
RentangTanggal.propTypes = { dari: PropTypes.string, sampai: PropTypes.string, onChange: PropTypes.func, className: PropTypes.string };

/** Navigasi halaman sederhana: Sebelumnya / Berikutnya + info jumlah data. */
export function Paginasi({ page, size, total, onPage, satuan = "jurnal" }) {
  const halaman = Math.max(1, Math.ceil(total / size));
  const awal = total === 0 ? 0 : (page - 1) * size + 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm text-gray-600">
      <span>{total === 0 ? "Tidak ada data" : `Menampilkan ${awal}–${Math.min(page * size, total)} dari ${total} ${satuan}`}</span>
      <div className="flex items-center gap-2">
        <Btn color="gray" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Sebelumnya</Btn>
        <span>Halaman {page} / {halaman}</span>
        <Btn color="gray" disabled={page >= halaman} onClick={() => onPage(page + 1)}>Berikutnya ›</Btn>
      </div>
    </div>
  );
}
Paginasi.propTypes = { page: PropTypes.number, size: PropTypes.number, total: PropTypes.number, onPage: PropTypes.func, satuan: PropTypes.string };

const fmt = (t) => (t ? t.split("-").reverse().join("-") : "");
/** Teks periode untuk kop cetak/CSV. */
export const teksRentang = (dari, sampai) =>
  dari || sampai ? `Periode: ${dari ? fmt(dari) : "awal"} s.d. ${sampai ? fmt(sampai) : "sekarang"}` : "Periode: semua";

/** Rentang tanggal satu bulan (YYYY-MM) -> {dari, sampai}. */
export const rentangBulan = (periode) => {
  if (!periode) return { dari: "", sampai: "" };
  const [y, m] = periode.split("-").map(Number);
  return { dari: `${periode}-01`, sampai: `${periode}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}` };
};
