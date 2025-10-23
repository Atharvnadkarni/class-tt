import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  user: any | null;
}

const initialState: UserState = {
  user: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, { payload }) => {
      return { user: payload };
    },
    logout: () => {
      return { user: null };
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
