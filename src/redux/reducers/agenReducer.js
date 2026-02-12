import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listAgen: [],
  detailAgen: null,
  modalCreateAgen: false,
  modalEditAgen: false,
};

const agenSlice = createSlice({
  name: "agen",
  initialState,
  reducers: {
    setListAgen: (state, action) => {
      state.listAgen = action.payload;
    },
    setDetailAgen: (state, action) => {
      state.detailAgen = action.payload;
    },
    setModalCreateAgen: (state, action) => {
      state.modalCreateAgen = action.payload;
    },
    setModalEditAgen: (state, action) => {
      state.modalEditAgen = action.payload;
    },
  },
});

export const {
  setListAgen,
  setDetailAgen,
  setModalCreateAgen,
  setModalEditAgen,
} = agenSlice.actions;

export default agenSlice.reducer;
