import { configureStore, createSlice } from "@reduxjs/toolkit";

export const teachersSlice = createSlice({
  name: "teachersSlice",
  initialState: {
    teachers: [],
  },
  reducers: {
    addTeacher: (state, { payload: teacher }) => {
      return { ...state, teachers: [...state.teachers, teacher] };
    },
    setTeachers: (state, { payload: teachers }) => {
      return { ...state, teachers };
    },
    deleteTeacher: (state, { payload: _id }) => {
      return {
        ...state,
        teachers: state.teachers.filter((teacher) => teacher._id != _id),
      };
    },
  },
});
export const timeTableSlice = createSlice({
  name: "timeTableSlice",
  initialState: {
    timeTable: {},
  },
  reducers: {
    setTimeTables: (state, { payload }) => {
      console.log(payload);
      return payload;
    },
  },
});

export const classSlice = createSlice({
  name: "classSlice",
  initialState: {
    class: "",
  },
  reducers: {
    setClass: (state, { payload }) => {
      return { class: payload };
    },
  },
});

export const { addTeacher, setTeachers, deleteTeacher } = teachersSlice.actions;
export const { setTimeTables } = timeTableSlice.actions;
export const { setClass } = classSlice.actions;

export default configureStore({
  reducer: {
    teachers: teachersSlice.reducer,
    timetable: timeTableSlice.reducer,
    class: classSlice.reducer,
  },
});
