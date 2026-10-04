import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Unduh Excel jurnal dari backend (JurnalExportController).
 *  - unduhExcelJurnal(params)  : banyak jurnal; params = {jenis, from, to, q, status, dana, akun, periode}
 *  - unduhExcelJurnalSatu(id)  : satu jurnal
 * Berkas disimpan lewat dialog unduh browser. Melempar Error berisi pesan dari server bila ditolak.
 */
const api = axios.create({ baseURL: API_URL, responseType: "blob" });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("tokenAdmin");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

async function pesanGalat(e) {
  const data = e?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message || e.message;
    } catch {
      return e.message;
    }
  }
  return e?.message || "Gagal mengunduh Excel";
}

function namaDariHeader(res, cadangan) {
  const cd = res.headers["content-disposition"] || "";
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd);
  return m ? decodeURIComponent(m[1]) : cadangan;
}

async function unduh(url, params, cadangan) {
  try {
    const res = await api.get(url, { params });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(res.data);
    a.download = namaDariHeader(res, cadangan);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch (e) {
    throw new Error(await pesanGalat(e));
  }
}

const bersih = (p) => Object.fromEntries(Object.entries(p || {}).filter(([, v]) => v !== "" && v != null));

export const unduhExcelJurnal = (params) => unduh("/keuangan/jurnal/export", bersih(params), "daftar-jurnal.xlsx");
export const unduhExcelJurnalSatu = (id) => unduh(`/keuangan/jurnal/${id}/export`, undefined, `jurnal-${id}.xlsx`);
