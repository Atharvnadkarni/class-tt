import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TeachersList {
  teachers: Teacher[];
}

export interface Teacher {
  name: string;
  subjects: {
    subject: string;
    classes: number[];
  }[];
  displayName: string;
  username: string;
  password: string;
  tier: string;
  editableClasses: number[];
  index: number;
}


// Define the initial state using that type
const initialState: TeachersList = {
  teachers: []
};

export const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setTeachersList: (
      state,
      { payload: teachers }: PayloadAction<AttendanceRecord>,
    ) => {
      state.teachers = teachers;
    },
  },
});

export const { setTeachersList } = teacherSlice.actions;

export default teacherSlice.reducer;
