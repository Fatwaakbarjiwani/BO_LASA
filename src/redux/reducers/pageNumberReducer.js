import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  pNActiveCampaign: localStorage.getItem("pNAC")
    ? parseInt(localStorage.getItem("pNAC"), 10)
    : 1,
  pNTransaksi: localStorage.getItem("pNT")
    ? parseInt(localStorage.getItem("pNT"), 10)
    : 1,
  pNBerita: localStorage.getItem("pNB")
    ? parseInt(localStorage.getItem("pNB"), 10)
    : 1,
  pNAmilCampaign: localStorage.getItem("pNAC")
    ? parseInt(localStorage.getItem("pNAC"), 10)
    : 1,
  pNDonatur: localStorage.getItem("pND")
    ? parseInt(localStorage.getItem("pND"), 10)
    : 1,
  pN: localStorage.getItem("pN") ? parseInt(localStorage.getItem("pN"), 10) : 1,
  totalPNActiveCampaign: 0,
  totalPNTransaksi: 0,
  totalPNBerita: 0,
  totalPNAmilCampaign: 0,
  totalPNDonatur: 0,
  totalPN: 0,
};
const authSlice = createSlice({
  name: "pageNumber",
  initialState,
  reducers: {
    setPNActiveCampaign: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pNAC", pageNumber);
      } else {
        localStorage.removeItem("pNAC");
      }
      state.pNActiveCampaign = action.payload
        ? parseInt(action.payload, 10)
        : null;
    },
    setPNTransaksi: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pNT", pageNumber);
      } else {
        localStorage.removeItem("pNT");
      }
      state.pNTransaksi = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPNBerita: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pNB", pageNumber);
      } else {
        localStorage.removeItem("pNB");
      }
      state.pNBerita = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPNAmilCampaign: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pNAC", pageNumber);
      } else {
        localStorage.removeItem("pNAC");
      }
      state.pNAmilCampaign = action.payload
        ? parseInt(action.payload, 10)
        : null;
    },
    setPNDonatur: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pND", pageNumber);
      } else {
        localStorage.removeItem("pND");
      }
      state.pNDonatur = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPN: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pN", pageNumber);
      } else {
        localStorage.removeItem("pN");
      }
      state.pN = action.payload ? parseInt(action.payload, 10) : null;
    },
    setTotalPNActiveCampaign: (state, action) => {
      state.totalPNActiveCampaign = action.payload;
    },
    setTotalPNTransaksi: (state, action) => {
      state.totalPNTransaksi = action.payload;
    },
    setTotalPNBerita: (state, action) => {
      state.totalPNBerita = action.payload;
    },
    setTotalPNAmilCampaign: (state, action) => {
      state.totalPNAmilCampaign = action.payload;
    },
    setTotalPNDonatur: (state, action) => {
      state.totalPNDonatur = action.payload;
    },
    setTotalPN: (state, action) => {
      state.totalPN = action.payload;
    },
  },
});

export const {
  setPNActiveCampaign,
  setTotalPNActiveCampaign,
  setPNTransaksi,
  setPNBerita,
  setTotalPNTransaksi,
  setTotalPNBerita,
  setPNAmilCampaign,
  setTotalPNAmilCampaign,
  setTotalPNDonatur,
  setPNDonatur,
  setPN,
  setTotalPN,
} = authSlice.actions;

export default authSlice.reducer;
