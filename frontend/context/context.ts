import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import attendanceReducer from "./attendanceSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    attendance: attendanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
