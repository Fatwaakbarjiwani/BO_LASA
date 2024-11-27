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
  bukuBesar: [],
  createDokumentasi: false,
  id: "",
  type: "campaign",
  modalCreateCoa: false,
  modalEditCoa: false,
  detailCoa: [],
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
    setBukuBesar: (state, action) => {
      state.bukuBesar = action.payload;
    },
    setCreateDokumentasi: (state, action) => {
      state.createDokumentasi = action.payload;
    },
    setId: (state, action) => {
      state.id = action.payload;
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
} = authSlice.actions;

export default authSlice.reducer;
