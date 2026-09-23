import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

/** Klien HTTP untuk modul Administrasi Keuangan. Token admin diambil dari localStorage (diset saat login). */
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("tokenAdmin");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Terjadi kesalahan";

export const keuangan = {
  meta: () => api.get("/keuangan/meta").then((r) => r.data),
  donatur: (q) =>
    api.get("/keuangan/donatur", { params: { q } }).then((r) => r.data),

  jurnal: (params) =>
    api.get("/keuangan/jurnal", { params }).then((r) => r.data),
  jurnalDetail: (id) => api.get(`/keuangan/jurnal/${id}`).then((r) => r.data),
  postJurnal: (cmd) => api.post("/keuangan/jurnal", cmd).then((r) => r.data),
  voidJurnal: (id, alasan) =>
    api.post(`/keuangan/jurnal/${id}/void`, { alasan }).then((r) => r.data),

  periode: () => api.get("/keuangan/periode").then((r) => r.data),
  periksa: (p) => api.get(`/keuangan/periode/${p}/periksa`).then((r) => r.data),
  tutup: (p) => api.post(`/keuangan/periode/${p}/tutup`).then((r) => r.data),
  buka: (p, alasan) =>
    api.post(`/keuangan/periode/${p}/buka`, { alasan }).then((r) => r.data),

  kontaminasi: () =>
    api.get("/keuangan/monitor/kontaminasi").then((r) => r.data),
  timpang: () => api.get("/keuangan/monitor/timpang").then((r) => r.data),
  netral: () => api.get("/keuangan/monitor/netral").then((r) => r.data),
  pelanggaran: () =>
    api.get("/keuangan/monitor/pelanggaran").then((r) => r.data),
  versi: () => api.get("/keuangan/monitor/versi").then((r) => r.data),
  audit: () => api.get("/keuangan/monitor/audit").then((r) => r.data),

  // Jenis zakat dinamis (master jenis_zakat)
  jenisZakat: (semua = false) =>
    api.get("/keuangan/jenis-zakat", { params: { semua } }).then((r) => r.data),
  jenisZakatBaru: (nama) =>
    api.post("/keuangan/jenis-zakat", { nama }).then((r) => r.data),
  jenisZakatUbah: (kode, b) =>
    api.put(`/keuangan/jenis-zakat/${kode}`, b).then((r) => r.data),

  mustahik: (params) =>
    api.get("/keuangan/mustahik", { params }).then((r) => r.data),
  mustahikBaru: (b) => api.post("/keuangan/mustahik", b).then((r) => r.data),
  mustahikUbah: (id, b) =>
    api.put(`/keuangan/mustahik/${id}`, b).then((r) => r.data),
  mustahikHapus: (id) =>
    api.delete(`/keuangan/mustahik/${id}`).then((r) => r.data),

  rekening: () => api.get("/keuangan/rekening").then((r) => r.data),
  rekeningUbah: (id, b) =>
    api.put(`/keuangan/rekening/${id}`, b).then((r) => r.data),

  unit: () => api.get("/keuangan/unit-internal").then((r) => r.data),
  unitBaru: (nama) =>
    api.post("/keuangan/unit-internal", { nama }).then((r) => r.data),
  setoran: (periode) =>
    api.get("/keuangan/setoran", { params: { periode } }).then((r) => r.data),
  setoranSimpan: (periode, unitId, b) =>
    api.put(`/keuangan/setoran/${periode}/${unitId}`, b).then((r) => r.data),

  konfigurasi: () => api.get("/keuangan/konfigurasi").then((r) => r.data),
  konfigurasiUbah: (kunci, nilai) =>
    api.put(`/keuangan/konfigurasi/${kunci}`, { nilai }).then((r) => r.data),
  alokasi: () => api.get("/keuangan/alokasi-amil").then((r) => r.data),
  alokasiSimpan: (b) =>
    api.post("/keuangan/alokasi-amil", b).then((r) => r.data),

  lpd: (fund, year) =>
    api.get(`/keuangan/laporan/lpd/${fund}`, { params: { year } }).then((r) => r.data),
  statement: (type, ruang, period) =>
    api
      .get(`/keuangan/laporan/statement/${type}`, { params: { ruang, period } })
      .then((r) => r.data),

  // Data yang sama persis dengan yang dibaca aplikasi mobile (untuk pratinjau/rekonsiliasi)
  harian: (ruang, date) =>
    api
      .get("/mobile/v1/harian/reconciliation", { params: { ruang, date } })
      .then((r) => r.data),
  saldoBank: (ruang, coaId, balance) =>
    api
      .put(`/mobile/v1/harian/bank/${coaId}`, { balance }, { params: { ruang } })
      .then((r) => r.data),
  versiMobile: () => api.get("/mobile/v1/meta/versions").then((r) => r.data),

  // COA
  coaAll: () => api.get("/coa/all").then((r) => r.data),
  coaCreate: (b) => api.post("/coa/create", b).then((r) => r.data),
  coaEdit: (id, b) => api.put(`/coa/edit/${id}`, b).then((r) => r.data),
  coaDelete: (id) => api.delete(`/coa/delete/${id}`).then((r) => r.data),
};

export default api;
