import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  allBerita: [],
  topBerita: [],
  detailBerita: [],
  categoryBerita: [],
  searchBerita: "",
  modalCreateBerita: false,
  modalCreateTopicBerita: false,
  modalEditBerita: false,
  modalEditTopicBerita: false,
  idTopic: 0,
};
const authSlice = createSlice({
  name: "berita",
  initialState,
  reducers: {
    setAllBerita: (state, action) => {
      state.allBerita = action.payload;
    },
    setTopBerita: (state, action) => {
      state.topBerita = action.payload;
    },
    setDetailBerita: (state, action) => {
      state.detailBerita = action.payload;
    },
    setCategoryBerita: (state, action) => {
      state.categoryBerita = action.payload;
    },
    setModalCreateBerita: (state, action) => {
      state.modalCreateBerita = action.payload;
    },
    setModalCreateTopicBerita: (state, action) => {
      state.modalCreateTopicBerita = action.payload;
    },
    setModalEditBerita: (state, action) => {
      state.modalEditBerita = action.payload;
    },
    setSearchBerita: (state, action) => {
      state.searchBerita = action.payload;
    },
    setModalEditTopicBerita: (state, action) => {
      state.modalEditTopicBerita = action.payload;
    },
    setIdTopic: (state, action) => {
      state.idTopic = action.payload;
    },
  },
});

export const {
  setAllBerita,
  setTopBerita,
  setDetailBerita,
  setCategoryBerita,
  setModalCreateBerita,
  setModalEditBerita,
  setModalCreateTopicBerita,
  setModalEditTopicBerita,
  setIdTopic,
  setSearchBerita,
} = authSlice.actions;

export default authSlice.reducer;
