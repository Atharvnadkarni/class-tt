"use client";

import Tabs from "@/tabs";
import TimetableHeader from "@/app/components/Header";
import { useEffect, useRef, useState } from "react";
import { useRequest } from "../hooks/useRequest";
import TeacherAttendanceCard from "../components/TeacherAttendanceCard";
import { Edit, Save, X } from "lucide-react";
import { Cancel } from "@radix-ui/react-alert-dialog";
import { io } from "socket.io-client";
import Dashboard from "../components/Dashboard";
import { useAppDispatch } from "@/context/contextHooks";
import { setAttendance } from "@/context/attendanceSlice";
import { useAttendanceContext } from "@/context/providers/SocketProvider";

const socket = io("http://localhost:4000");

const AttendancePage = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecord, setAttendanceRecord] = useState({});
  const oldAttendanceRecord = useRef({});
  const [currentMode, setCurrentMode] = useState("saved");
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  useEffect(() => {
    (async () => {
      const res = await request("get", "/teacher");
      const teacherData = res.data.teacher;
      setTeachers(teacherData);
      const attendanceObj = JSON.parse(
        (await request("get", "/attendance")).data.attendance
      ).attendance;
      console.log(attendanceObj);
      const allPresentRecord = {};
      teacherData.forEach((teacher: { name: string }) => {
        allPresentRecord[teacher.name] = true;
      });
      setAttendanceRecord(
        Object.assign({}, allPresentRecord, attendanceObj) ?? allPresentRecord
      );
      // allPresentRecord now contains every teacher's name as key and true as value
    })();
  }, []);

    const { setModalVisible } = useAttendanceContext();
  

  const saveAttendanceRecord = async () => {
    await request("patch", "/attendance", attendanceRecord);
    socket.emit("save_attendance", JSON.stringify(attendanceRecord));
    dispatch(setAttendance(attendanceRecord))
    setModalVisible(true)
  };
  const dispatch = useAppDispatch()
  return (
    <div className="min-h-screen bg-neutral">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <Dashboard activeTab="attendance" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 gap-2 mr-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Attendance List
            </h1>
            <div className="flex gap-2">
              {currentMode == "saved" && (
                <button
                  className="px-4 py-2 text-sm font-semibold text-black bg-gray-300 text-black text-black  text-sm font-small rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    setCurrentMode("editing");
                    oldAttendanceRecord.current = attendanceRecord;
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              )}
              {currentMode == "editing" && (
                <>
                  <button
                    className="px-4 py-2 bg-secondary text-black hover:bg-secondary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => {
                      setCurrentMode("saved");
                      setAttendanceRecord(oldAttendanceRecord.current);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-primary text-white hover:bg-primary text-white  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => {
                      saveAttendanceRecord();
                      setCurrentMode("saved");
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {teachers.map((teacher: { name: string }) => (
              <TeacherAttendanceCard
                {...{
                  teacher: teacher,
                  mode: currentMode,
                  attendanceRecord,
                  setAttendanceRecord,
                }}
              />
            ))}
          </div>
          <div className="flex justify-end items-center mt-4 gap-2 mr-4">
            {currentMode == "saved" && (
              <button
                className="px-4 py-2 bg-gray-300 text-black hover:bg-gray-300 text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  setCurrentMode("editing");
                }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
            {currentMode == "editing" && (
              <>
                <button
                  className="px-4 py-2 bg-secondary text-black hover:bg-secondary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    setCurrentMode("saved");
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-white hover:bg-primary text-white  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    saveAttendanceRecord();
                    setCurrentMode("saved");
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default AttendancePage;
