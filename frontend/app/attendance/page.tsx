"use client";

import Tabs from "@/tabs";
import TimetableHeader from "@/app/components/Header";
import { useEffect, useState } from "react";
import { useRequest } from "../hooks/useRequest";
import TeacherAttendanceCard from "../components/TeacherAttendanceCard";
import { Edit, Save } from "lucide-react";

const SubstitutionPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecord, setAttendanceRecord] = useState({});
  const [currentMode, setCurrentMode] = useState("edit");
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  useEffect(() => {
    (async () => {
      const res = await request("get", "/teacher");
      const teacherData = res.data.teacher;
      setTeachers(teacherData);
      setAttendanceRecord(
        teacherData.map((teacher) => ({ [teacher.name]: null }))
      );
    })();
  }, []);
  return (
    <div className="min-h-screen bg-neutral">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <Tabs activeTab="attendance" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 gap-2 mr-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Attendance List
            </h1>
            <div className="flex gap-2">
              {currentMode == "edit" && (
                <button
                  className="px-4 py-2 text-sm font-semibold text-black bg-gray-300 text-black text-black  text-sm font-small rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    setCurrentMode("save");
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              )}
              {currentMode == "save" && (
                <button
                  className="px-4 py-2 bg-secondary text-black hover:bg-secondary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => {
                    setCurrentMode("save");
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {teachers.map((teacher: { name: string }) => (
              <TeacherAttendanceCard>
                {teacher.name.includes(teacher.displayName) ? (
                  <h3>
                    {teacher.name.slice(
                      0,
                      teacher.name.indexOf(teacher.displayName)
                    )}
                    <span className="font-bold">
                      {teacher.name.slice(
                        teacher.name.indexOf(teacher.displayName),
                        teacher.name.indexOf(teacher.displayName) +
                          teacher.displayName.length
                      )}
                    </span>
                    {teacher.name.slice(
                      teacher.name.indexOf(teacher.displayName) +
                        teacher.displayName.length
                    )}
                  </h3>
                ) : (
                  <h3>{teacher.name}</h3>
                )}
              </TeacherAttendanceCard>
            ))}
          </div>
          <div className="flex justify-end items-center mt-4 gap-2 mr-4">
            {currentMode == "edit" && (
              <button className="px-4 py-2 bg-gray-300 text-black hover:bg-gray-300 text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
            {currentMode == "save" && (
              <button className="px-4 py-2 bg-secondary text-black hover:bg-secondary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default SubstitutionPage;
