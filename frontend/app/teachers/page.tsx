"use client";

import TimetableHeader from "../components/Header";
import { useEffect, useRef, useState } from "react";
import Tabs from "@/tabs";
import axios from "axios";
import { Plus } from "lucide-react";
import AddEditTeacher from "../components/modals/AddEditTeacher";
import TeacherCard from "../components/TeacherCard";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Tier } from "@/types";
import { useRequest } from "../hooks/useRequest";
import { useAppSelector } from "@/context/contextHooks";

interface Teacher {
  name: String;
  class: String;
  subjects: [
    {
      _id: false;
      subject: string;
      classes: any;
    }
  ];
}

export default function TeacherPage() {
  const [mode, setMode] = useState<{
    mode: null | "add" | "edit";
    teacher: null;
  }>({ mode: null, teacher: null });

  const [subs, setSubs] = useState([]);
  const teacherTier = useRef(Tier.TEACHER);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { tier } = JSON.parse(
        window.localStorage.getItem("user") ??
          JSON.stringify({ tier: Tier.TEACHER })
      );
      teacherTier.current = tier;
    }
  }, []);

  const [allTeachers, setAllTeachers] = useState([]);
  const user = useAppSelector((state) => state.user.user);
  const { request, isLoading, error } = useRequest();

  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await request("get", "/teacher");
      setAllTeachers(teachers.data.teacher);
    };
    fetchTeachers();
  }, [user]);
  const router = useRouter();

  return !user ? (
    router.push("/login")
  ) : (
    <div className="min-h-screen bg-neutral">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <Tabs activeTab="teachers" />
        <div className="space-y-6">
          {/* Overview Stats */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">School Teachers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{allTeachers.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Teachers</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">9</div>
            <div className="text-sm text-gray-600 mt-1">Subjects</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">6</div>
            <div className="text-sm text-gray-600 mt-1">Classes</div>
          </div>
        </div>
      </div> */}

          {/* Teacher List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Available Teachers
              </h3>
              {teacherTier.current != Tier.TEACHER && (
                <button
                  className="px-4 py-2 bg-secondary text-black text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setMode({ mode: "add", teacher: null })}
                >
                  <Plus className="h-4 w-4" />
                  Add Teacher
                </button>
              )}
            </div>

            {/* Modal */}
            <AddEditTeacher
              {...{ mode, setMode, allTeachers, setAllTeachers, subs, setSubs }}
            />
            {/* {isLoading && (
              <div className="flex justify-center items-center py-10">
                <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></span>
                <span className="text-gray-600 text-sm">
                  Loading teachers...
                </span>
              </div>
            )} */}
            {isLoading && (
              <div className="flex justify-center items-center py-10 gap-2">
                <div className="h-8 w-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 text-sm">
                  Loading teachers...
                </span>
              </div>
            )}
            {!isLoading && allTeachers.length == 0 && (
              <div className="flex justify-center items-center py-10">
                <span className="text-gray-600 text-sm">No teachers found</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {/* {} */}
              {console.log(127, allTeachers)}
              {JSON.stringify(allTeachers) != "[]" &&
                allTeachers.map((teacher) => (
                  <TeacherCard
                    {...{
                      teacher,
                      setMode,
                      setAllTeachers,
                      tier: teacherTier.current,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
