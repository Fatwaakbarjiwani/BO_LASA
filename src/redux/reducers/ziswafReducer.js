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
  pengelola: [],
  amilDskl: [],
  coaCategory: [],
  coaParent: [],
  allCoa: [],
  allCoaCategory: [],
  detailZiswaf: [],
  detailFitrah: [],
  nominalFitrah: [],
  modalCreateZiswaf: false,
  modalCreateFitrah: false,
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
    setPengelola: (state, action) => {
      state.pengelola = action.payload;
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
    setCoaParent: (state, action) => {
      state.coaParent = action.payload;
    },
    setAllCoa: (state, action) => {
      state.allCoa = action.payload;
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
    setModalCreateFitrah: (state, action) => {
      state.modalCreateFitrah = action.payload;
    },
    setModalEditZiswaf: (state, action) => {
      state.modalEditZiswaf = action.payload;
    },
    setDetailFitrah: (state, action) => {
      state.detailFitrah = action.payload;
    },
    setNominalFitrah: (state, action) => {
      state.nominalFitrah = action.payload;
    },
  },
});

export const {
  setCategoryZiswaf,
  setZakat,
  setDskl,
  setPengelola,
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
  setAllCoa,
  setModalCreateFitrah,
  setDetailFitrah,
  setNominalFitrah,
  setCoaParent,
} = authSlice.actions;

export default authSlice.reducer;
