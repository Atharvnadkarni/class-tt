import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: { user: null },
  reducers: {
    login: (state, { payload }) => {
      return { user: payload };
    },
    logout: () => {
      return { user: null };
    },
  },
});

export const {login, logout} = userSlice.actions

export default userSlice.reducer
