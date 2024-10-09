import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
const key = "secretKey";

function getPsFromLocalStorage() {
  const encryptedPs = localStorage.getItem("ps");
  if (encryptedPs) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPs, key);
      const originalPs = bytes.toString(CryptoJS.enc.Utf8);
      return originalPs;
    } catch (error) {
      console.error("Error decrypting ps:", error);
      return null;
    }
  }
  return null;
}
const initialState = {
  tokenAdmin: localStorage.getItem("tokenAdmin") || null,
  modalResetPassword: false,
  phoneNumber: "",
  email: "",
  acount: "",
  user: null,
  donatur: [],
  ps: getPsFromLocalStorage(),
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenAdmin: (state, action) => {
      if (action.payload) {
        localStorage.setItem("tokenAdmin", action.payload);
      } else {
        localStorage.removeItem("tokenAdmin");
      }
      state.tokenAdmin = action.payload;
    },
    setModalResetPassword: (state, action) => {
      state.modalResetPassword = action.payload;
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setAcount: (state, action) => {
      state.acount = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setDonatur: (state, action) => {
      state.donatur = action.payload;
    },
    setPs: (state, action) => {
      if (action.payload) {
        const encryptedPs = CryptoJS.AES.encrypt(
          action.payload,
          key
        ).toString();
        localStorage.setItem("ps", encryptedPs);
      } else {
        localStorage.removeItem("ps");
      }
      state.ps = action.payload;
    },
  },
});

export const {
  setTokenAdmin,
  setModalResetPassword,
  setEmail,
  setPhoneNumber,
  setAcount,
  setUser,
  setPs,
  setDonatur,
} = authSlice.actions;

export default authSlice.reducer;
