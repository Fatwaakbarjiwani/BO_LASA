import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
const key = "secretKey";

const initialState = {
  nml: getNmlFromLocalStorage(),
  methode: "",
  transactionUser: [],
  transaction: [],
  distribution: [],
  summaryDashboard: [],
  jurnal: [],
  posisiKeuangan: [],
  laporanAktivitas: [],
  neracaSaldo: [],
  bukuBesar: [],
  createDokumentasi: false,
  id: "",
  searchTransaksi: "",
  type: "campaign",
  modalCreateCoa: false,
  modalEditCoa: false,
  detailCoa: [],
  saldoCoa: [],
  persentase: [],
};
function getNmlFromLocalStorage() {
  const encryptedNml = localStorage.getItem("nml");
  if (encryptedNml) {
    // Decrypt nilai nml sebelum mengembalikannya
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedNml, key);
      const originalNml = bytes.toString(CryptoJS.enc.Utf8);
      return originalNml;
    } catch (error) {
      // Handle kesalahan dekripsi
      console.error("Error decrypting nml:", error);
      return null;
    }
  }
  return null;
}
const authSlice = createSlice({
  name: "summary&transaction",
  initialState,
  reducers: {
    setNml: (state, action) => {
      if (action.payload) {
        // Enkripsi nilai nml sebelum menyimpannya
        const encryptedNml = CryptoJS.AES.encrypt(
          action.payload,
          key
        ).toString();
        localStorage.setItem("nml", encryptedNml);
      } else {
        localStorage.removeItem("nml");
      }
      state.nml = action.payload;
    },
    setMethode: (state, action) => {
      state.methode = action.payload;
    },
    setTransactionUser: (state, action) => {
      state.transactionUser = action.payload;
    },
    setTransaction: (state, action) => {
      state.transaction = action.payload;
    },
    setDistribution: (state, action) => {
      state.distribution = action.payload;
    },
    setSummaryDashboard: (state, action) => {
      state.summaryDashboard = action.payload;
    },
    setJurnal: (state, action) => {
      state.jurnal = action.payload;
    },
    setNeracaSaldo: (state, action) => {
      state.neracaSaldo = action.payload;
    },
    setPosisiKeuangan: (state, action) => {
      state.posisiKeuangan = action.payload;
    },
    setLaporanAktivitas: (state, action) => {
      state.laporanAktivitas = action.payload;
    },
    setBukuBesar: (state, action) => {
      state.bukuBesar = action.payload;
    },
    setCreateDokumentasi: (state, action) => {
      state.createDokumentasi = action.payload;
    },
    setId: (state, action) => {
      state.id = action.payload;
    },
    setSearchTransaksi: (state, action) => {
      state.searchTransaksi = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setModalCreateCoa: (state, action) => {
      state.modalCreateCoa = action.payload;
    },
    setModalEditCoa: (state, action) => {
      state.modalEditCoa = action.payload;
    },
    setDetailCoa: (state, action) => {
      state.detailCoa = action.payload;
    },
    setSaldoCoa: (state, action) => {
      state.saldoCoa = action.payload;
    },
    setPersentase: (state, action) => {
      state.persentase = action.payload;
    },
  },
});

export const {
  setNml,
  setMethode,
  setTransactionUser,
  setSummaryDashboard,
  setTransaction,
  setDistribution,
  setJurnal,
  setBukuBesar,
  setCreateDokumentasi,
  setId,
  setType,
  setModalCreateCoa,
  setModalEditCoa,
  setDetailCoa,
  setSearchTransaksi,
  setPersentase,
  setSaldoCoa,
  setPosisiKeuangan,
  setLaporanAktivitas,
  setNeracaSaldo,
} = authSlice.actions;

export default authSlice.reducer;
