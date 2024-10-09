import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  allBerita: [],
  topBerita: [],
  detailBerita: [],
  categoryBerita: [],
  modalCreateBerita: false,
  modalEditBerita: false,
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
    setModalEditBerita: (state, action) => {
      state.modalEditBerita = action.payload;
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
} = authSlice.actions;

export default authSlice.reducer;
