import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isSidebarOpen: true ,
};
const authSlice = createSlice({
  name: "nav&side",
  initialState,
  reducers: {
    setIsSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setIsSidebarOpen } = authSlice.actions;

export default authSlice.reducer;
