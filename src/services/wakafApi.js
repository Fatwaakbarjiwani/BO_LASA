import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Klien HTTP menu Wakaf (buku wakaf terpisah dari Administrasi Keuangan ZIS). Path backend /api/buku-wakaf;
 * /api/wakaf tetap dipakai untuk kategori donasi wakaf lama.
 */
const api = axios.create({ baseURL: `${API_URL}/buku-wakaf` });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("tokenAdmin");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const data = (r) => r.data;

export const wakaf = {
  meta: () => api.get("/meta").then(data),

  penerimaan: (b) => api.post("/penerimaan", b).then(data),
  mutasi: (b) => api.post("/mutasi", b).then(data),
  pengukuranUlang: (b) => api.post("/pengukuran-ulang", b).then(data),
  hasil: (b) => api.post("/hasil", b).then(data),
  penyaluran: (b) => api.post("/penyaluran", b).then(data),

  jurnal: (params) => api.get("/jurnal", { params }).then(data),
  jurnalDetail: (id) => api.get(`/jurnal/${id}`).then(data),
  batalkan: (id, alasan) => api.post(`/jurnal/${id}/void`, { alasan }).then(data),

  harta: (params) => api.get("/harta", { params }).then(data),
  online: () => api.get("/online").then(data),
  catatOnline: (nomorBukti, jenisHbw) =>
    api.post("/online/catat", { jenisHbw }, { params: { nomorBukti } }).then(data),

  laporan: (jenis, params) => api.get(`/laporan/${jenis}`, { params }).then(data),
};
