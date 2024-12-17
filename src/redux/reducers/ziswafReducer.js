import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  categoryZiswaf: [],
  zakat: [],
  amilZakat: [],
  infak: [],
  amilInfak: [],
  wakaf: [],
  amilWakaf: [],
  dskl: [],
  amilDskl: [],
  coaCategory: [],
  allCoaCategory: [],
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
    setAmilZakat: (state, action) => {
      state.amilZakat = action.payload;
    },
    setInfak: (state, action) => {
      state.infak = action.payload;
    },
    setAmilInfak: (state, action) => {
      state.amilInfak = action.payload;
    },
    setWakaf: (state, action) => {
      state.wakaf = action.payload;
    },
    setAmilWakaf: (state, action) => {
      state.amilWakaf = action.payload;
    },
    setDskl: (state, action) => {
      state.dskl = action.payload;
    },
    setAmilDskl: (state, action) => {
      state.amilDskl = action.payload;
    },
    setCoaCategory: (state, action) => {
      state.coaCategory = action.payload;
    },
    setAllCoaCategory: (state, action) => {
      state.allCoaCategory = action.payload;
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
  setAmilDskl,
  setAmilInfak,
  setAmilWakaf,
  setAmilZakat,
  setAllCoaCategory,
} = authSlice.actions;

export default authSlice.reducer;
