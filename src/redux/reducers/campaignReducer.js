import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  totalPageNumberMessage: 0,
  allCampaign: [],
  campaignBySearch: [],
  allCampaignEmergency: [],
  detailCampaign: [],
  allCampaignCategory: [],
  searchCampaign: "",
  amilCampaign: [],
  // modal
  modalCreateActive: false,
  modalEditActive: false,
  modalCreateCategory: false,
  modalEditCategory: false,
  // operator
  campaignPending: [],
  campaignHistory: [],
  kategoricampaign: [],
  idCategoryCampaign: "",
  chart1: [],
  chart2: [],
};
const authSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setTotalPageNumberMessage: (state, action) => {
      state.totalPageNumberMessage = action.payload;
    },
    setAllCampaign: (state, action) => {
      state.allCampaign = action.payload;
    },
    setCampaignBySearch: (state, action) => {
      state.campaignBySearch = action.payload;
    },
    setAllCampaignEmergency: (state, action) => {
      state.allCampaignEmergency = action.payload;
    },
    setDetailCampaign: (state, action) => {
      state.detailCampaign = action.payload;
    },
    setAllCampaignCategory: (state, action) => {
      state.allCampaignCategory = action.payload;
    },
    setSearchCampaign: (state, action) => {
      state.searchCampaign = action.payload;
    },
    setAmilCampaign: (state, action) => {
      state.amilCampaign = action.payload;
    },
    setModalCreateActive: (state, action) => {
      state.modalCreateActive = action.payload;
    },
    setModalEditActive: (state, action) => {
      state.modalEditActive = action.payload;
    },
    setModalCreateCategory: (state, action) => {
      state.modalCreateCategory = action.payload;
    },
    setModalEditCategory: (state, action) => {
      state.modalEditCategory = action.payload;
    },
    setCampaignPending: (state, action) => {
      state.campaignPending = action.payload;
    },
    setCampaignHistory: (state, action) => {
      state.campaignHistory = action.payload;
    },
    setKategoriCampaign: (state, action) => {
      state.kategoriCampaign = action.payload;
    },
    setIdCategoryCampaign: (state, action) => {
      state.idCategoryCampaign = action.payload;
    },
    setChart1: (state, action) => {
      state.chart1 = action.payload;
    },
    setChart2: (state, action) => {
      state.chart2 = action.payload;
    },
  },
});

export const {
  setTotalPageNumberMessage,
  setAllCampaign,
  setCampaignBySearch,
  setAllCampaignEmergency,
  setDetailCampaign,
  setAllCampaignCategory,
  setSearchCampaign,
  setModalCreateActive,
  setModalCreateCategory,
  setModalEditActive,
  setAmilCampaign,
  setCampaignPending,
  setCampaignHistory,
  setKategoriCampaign,
  setIdCategoryCampaign,
  setModalEditCategory,
  setChart1,
  setChart2,
} = authSlice.actions;

export default authSlice.reducer;
