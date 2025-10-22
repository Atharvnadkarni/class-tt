import { createSlice } from "@reduxjs/toolkit";

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState: { record: {} },
  reducers: {
    setAttendanceRecord: (state, { payload: record }) => {
      state.record = record;
    },
  },
});

export const { setAttendanceRecord } = attendanceSlice.actions;

export default attendanceSlice.reducer;
