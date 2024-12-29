import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isSidebarOpen: true,
  pageImage: [],
};
const authSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setIsSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setPageImage: (state, action) => {
      state.pageImage = action.payload;
    },
  },
});

export const { setIsSidebarOpen, setPageImage } = authSlice.actions;

export default authSlice.reducer;
