import PropTypes from "prop-types";

export const rp = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(v) || 0);

export const num = (v) => new Intl.NumberFormat("id-ID").format(Number(v) || 0);

export const today = () => new Date().toISOString().slice(0, 10);

export const DANA_WARNA = {
  ZAKAT: "bg-emerald-100 text-emerald-800",
  INFAQ: "bg-sky-100 text-sky-800",
  DSKL: "bg-violet-100 text-violet-800",
  PENGELOLA: "bg-amber-100 text-amber-800",
  WAKAF: "bg-rose-100 text-rose-800",
  BELUM_ALOKASI: "bg-gray-200 text-gray-700",
};

export function DanaBadge({ dana }) {
  if (!dana) return <span className="text-gray-400 text-xs">netral</span>;
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${DANA_WARNA[dana] || "bg-gray-100 text-gray-700"}`}
    >
      {dana}
    </span>
  );
}
DanaBadge.propTypes = { dana: PropTypes.string };

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}
Field.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node,
};

export const inputCls =
  "w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";

export function Btn({ color = "blue", className = "", ...props }) {
  const c = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
    amber: "bg-yellow-500 hover:bg-yellow-600 text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    slate: "bg-slate-700 hover:bg-slate-800 text-white",
  }[color];
  return (
    <button
      {...props}
      className={`px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition ${c} ${className}`}
    />
  );
}
Btn.propTypes = { color: PropTypes.string, className: PropTypes.string };

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl p-5 w-full shadow-lg relative max-h-[92vh] overflow-y-auto ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
        {children}
      </div>
    </div>
  );
}
Modal.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
  children: PropTypes.node,
  wide: PropTypes.bool,
};

export function Tabel({ kolom, baris, kosong = "Tidak ada data" }) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            {kolom.map((k) => (
              <th
                key={k.judul}
                className={`py-2.5 px-3 text-nowrap ${k.kanan ? "text-right" : "text-left"}`}
              >
                {k.judul}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {baris.length === 0 && (
            <tr>
              <td
                colSpan={kolom.length}
                className="py-6 text-center text-gray-400"
              >
                {kosong}
              </td>
            </tr>
          )}
          {baris.map((b, i) => (
            <tr key={b.id ?? i} className="border-t hover:bg-gray-50">
              {kolom.map((k) => (
                <td
                  key={k.judul}
                  className={`py-2 px-3 ${k.kanan ? "text-right tabular-nums" : ""}`}
                >
                  {k.tampil ? k.tampil(b) : b[k.kunci]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
Tabel.propTypes = {
  kolom: PropTypes.array,
  baris: PropTypes.array,
  kosong: PropTypes.string,
};

export function Judul({ children, aksi }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
      <h1 className="text-2xl font-bold text-gray-800">{children}</h1>
      <div className="flex flex-wrap gap-2 items-center">{aksi}</div>
    </div>
  );
}
Judul.propTypes = { children: PropTypes.node, aksi: PropTypes.node };
