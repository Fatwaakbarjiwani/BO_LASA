import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listEvents: [],
  detailEvent: null,
  modalCreateEvent: false,
  modalEditEvent: false,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setListEvents: (state, action) => {
      state.listEvents = action.payload;
    },
    setDetailEvent: (state, action) => {
      state.detailEvent = action.payload;
    },
    setModalCreateEvent: (state, action) => {
      state.modalCreateEvent = action.payload;
    },
    setModalEditEvent: (state, action) => {
      state.modalEditEvent = action.payload;
    },
  },
});

export const {
  setListEvents,
  setDetailEvent,
  setModalCreateEvent,
  setModalEditEvent,
} = eventSlice.actions;

export default eventSlice.reducer;
