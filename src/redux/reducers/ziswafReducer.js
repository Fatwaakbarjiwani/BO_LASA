import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  categoryZiswaf: [],
  zakat: [],
  infak: [],
  wakaf: [],
  dskl: [],
  coaCategory: [],
  detailZiswaf: [],
  modalCreateZiswaf: false,
  modalEditZiswaf: false,
};
const authSlice = createSlice({
  name: "ziswaf",
  initialState,
  reducers: {
    setCategoryZiswaf: (state, action) => {
      state.categoryZiswaf = action.payload;
    },
    setZakat: (state, action) => {
      state.zakat = action.payload;
    },
    setInfak: (state, action) => {
      state.infak = action.payload;
    },
    setWakaf: (state, action) => {
      state.wakaf = action.payload;
    },
    setDskl: (state, action) => {
      state.dskl = action.payload;
    },
    setCoaCategory: (state, action) => {
      state.coaCategory = action.payload;
    },
    setDetailZiswaf: (state, action) => {
      state.detailZiswaf = action.payload;
    },
    setModalCreateZiswaf: (state, action) => {
      state.modalCreateZiswaf = action.payload;
    },
    setModalEditZiswaf: (state, action) => {
      state.modalEditZiswaf = action.payload;
    },
  },
});

export const {
  setCategoryZiswaf,
  setZakat,
  setDskl,
  setInfak,
  setWakaf,
  setModalCreateZiswaf,
  setModalEditZiswaf,
  setCoaCategory,
  setDetailZiswaf,
} = authSlice.actions;

export default authSlice.reducer;
