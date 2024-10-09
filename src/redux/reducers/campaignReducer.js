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
  setModalEditActive,
  setAmilCampaign,
} = authSlice.actions;

export default authSlice.reducer;
