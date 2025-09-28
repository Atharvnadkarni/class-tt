"use client";

import Tabs from "@/tabs";
import TimetableHeader from "@/app/components/Header";
import { useEffect, useState } from "react";
import { useRequest } from "../hooks/useRequest";
import TeacherAttendanceCard from "../components/TeacherAttendanceCard";

const SubstitutionPage = () => {
  const [teachers, setTeachers] = useState([]);
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  useEffect(() => {
    (async () => {
      const res = await request("get", "/teacher");
      const teacherData = res.data.teacher;
      setTeachers(teacherData);
    })();
  }, []);
  return (
    <div className="min-h-screen bg-neutral">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <Tabs activeTab="attendance" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Attendance List
          </h1>
          {/* Content goes here */}
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
        </div>
      </main>
    </div>
  );
};
export default SubstitutionPage;
