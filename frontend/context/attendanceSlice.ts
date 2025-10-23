import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AttendanceState {
  record: { [key: string]: boolean };
}

export interface AttendanceRecord {
  record: { [key: string]: boolean };
}

// Define the initial state using that type
const initialState: AttendanceState = {
  record: {},
};

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setAttendanceRecord: (
      state,
      { payload: { record } }: PayloadAction<AttendanceRecord>
    ) => {
      state.record = record;
    },
  },
});

export const { setAttendanceRecord } = attendanceSlice.actions;

export default attendanceSlice.reducer;
