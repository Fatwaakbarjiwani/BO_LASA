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
  pNOperator: localStorage.getItem("pNO")
    ? parseInt(localStorage.getItem("pNO"), 10)
    : 1,
  pN1: localStorage.getItem("pN1")
    ? parseInt(localStorage.getItem("pN1"), 10)
    : 1,
  pN2: localStorage.getItem("pN2")
    ? parseInt(localStorage.getItem("pN2"), 10)
    : 1,
  pN3: localStorage.getItem("pN3")
    ? parseInt(localStorage.getItem("pN3"), 10)
    : 1,
  pN4: localStorage.getItem("pN4")
    ? parseInt(localStorage.getItem("pN4"), 10)
    : 1,
  pN: localStorage.getItem("pN") ? parseInt(localStorage.getItem("pN"), 10) : 1,
  totalPNActiveCampaign: 0,
  totalPNTransaksi: 0,
  totalPNBerita: 0,
  totalPNAmilCampaign: 0,
  totalPNDonatur: 0,
  totalPNOperator: 0,
  totalPN: 0,
  totalPN1: 0,
  totalPN2: 0,
  totalPN3: 0,
  totalPN4: 0,
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
    setPNOperator: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pNO", pageNumber);
      } else {
        localStorage.removeItem("pNO");
      }
      state.pNOperator = action.payload ? parseInt(action.payload, 10) : null;
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
    setPN1: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pN1", pageNumber);
      } else {
        localStorage.removeItem("pN1");
      }
      state.pN1 = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPN2: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pN2", pageNumber);
      } else {
        localStorage.removeItem("pN2");
      }
      state.pN2 = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPN3: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pN3", pageNumber);
      } else {
        localStorage.removeItem("pN3");
      }
      state.pN3 = action.payload ? parseInt(action.payload, 10) : null;
    },
    setPN4: (state, action) => {
      if (action.payload) {
        const pageNumber = parseInt(action.payload, 10);
        localStorage.setItem("pN4", pageNumber);
      } else {
        localStorage.removeItem("pN4");
      }
      state.pN4 = action.payload ? parseInt(action.payload, 10) : null;
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
    setTotalPNOperator: (state, action) => {
      state.totalPNOperator = action.payload;
    },
    setTotalPN: (state, action) => {
      state.totalPN = action.payload;
    },
    setTotalPN1: (state, action) => {
      state.totalPN1 = action.payload;
    },
    setTotalPN2: (state, action) => {
      state.totalPN2 = action.payload;
    },
    setTotalPN3: (state, action) => {
      state.totalPN3 = action.payload;
    },
    setTotalPN4: (state, action) => {
      state.totalPN4 = action.payload;
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
  setPNOperator,
  setTotalPNOperator,
  setPN,
  setPN1,
  setPN2,
  setPN3,
  setPN4,
  setTotalPN,
  setTotalPN1,
  setTotalPN2,
  setTotalPN3,
  setTotalPN4,
} = authSlice.actions;

export default authSlice.reducer;
