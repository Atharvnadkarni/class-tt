"use client";

import { useAppSelector, useAppDispatch } from "@/context/contextHooks";
import { setTeachersList } from "@/context/teacherSlice";
import { Fragment, useEffect } from "react";
import { useRequest } from "./hooks/useRequest";

const Init = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const { request, isLoading: reqLoading, error } = useRequest();
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await request("get", "/teacher");
      dispatch(setTeachersList(teachers.data.teacher));
    };
    fetchTeachers();
  }, [user]);
  return <></>;
};
export default Init;
