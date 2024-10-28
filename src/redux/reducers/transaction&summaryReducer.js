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
} = authSlice.actions;

export default authSlice.reducer;
