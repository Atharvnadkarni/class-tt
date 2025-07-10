"use client";

import TimetableHeader from "../components/Header";
import { useEffect, useState } from "react";
import Tabs from "@/tabs";
import axios from "axios";
import { Plus } from "lucide-react";
import AddEditTeacher from "../components/modals/AddEditTeacher";
import TeacherCard from "../components/TeacherCard";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<{
    mode: null | "add" | "edit";
    teacher: null;
  }>({ mode: null, teacher: null });

  const [subs, setSubs] = useState([]);

  const [allTeachers, setAllTeachers] = useState([]);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      const teachers = await (
        await axios.get("https://class-tt-backend.onrender.com/api/teacher", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ).data.teacher;
      setAllTeachers(teachers);
      setIsLoading(false);
    };
    fetchTeachers();
  }, [user]);
  const router = useRouter();

  return !user ? (
    router.push("/login")
  ) : (
    <div className="min-h-screen bg-gray-50">
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
              <button
                className="px-4 py-2 bg-primary text-black hover:bg-primary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMode({ mode: "add", teacher: null })}
              >
                <Plus className="h-4 w-4" />
                Add Teacher
              </button>
            </div>

            {/* Modal */}
            <AddEditTeacher
              {...{ mode, setMode, allTeachers, setAllTeachers, subs, setSubs }}
            />
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></span>
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
            <div className="grid grid-cols-4 gap-2">
              {/* {} */}
              {JSON.stringify(allTeachers) != "[]" &&
                allTeachers.map((teacher) => (
                  <TeacherCard {...{ teacher, setMode, setAllTeachers }} />
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
