"use client";

import TimetableHeader from "../components/Header";
import WeeklyTimetable from "../../weekly-timetable";
import CurrentPeriodBanner from "../../current-period-banner";
import TeacherDetails from "../../teacher-details";
import {
  Clock,
  Shield,
  Plus,
  ArrowRightLeft,
  Save,
  User,
  Calendar,
  CalendarCheck,
  ClockIcon,
} from "lucide-react";
import { useState, useEffect, Suspense, useRef } from "react";
import AdminTeacherDetails from "../components/AdminTeacherDetails";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SubstituteButton from "../substitute";
import TimeSystem from "../components/TimeSystem";
import Tabs from "@/tabs";
import { classes } from "@/subjects";
import { useSelector } from "react-redux";
import AddEditSubstitution from "../components/modals/AddEditSubstitution";
import axios from "axios";
import { useRequest } from "../hooks/useRequest";
import { Tier } from "@/types";
import { useAppSelector } from "@/context/contextHooks";

export default function TimetablePage(props) {
  return (
    <Suspense>
      <_TimetablePage {...props} />
    </Suspense>
  );
}
function _TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("1A");
  const [classTimetables, setClassTimetables] = useState<{
    [key: string]: any;
  }>({});
  const [activeTab, setActiveTab] = useState<"schedule" | "teachers">(
    "schedule"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOwnTt, setViewingOwnTt] = useState(false);
  const handleSave = () => {
    if (!selectedCell) return;

    const cellKey = `${selectedCell.day}-${selectedCell.period.name}`;
    if (formData.subject.trim()) {
      setClassTimetables((prev) => ({
        ...prev,
        [selectedClass]: {
          ...prev[selectedClass],
          [cellKey]: {
            subject: formData.subject,
            class: getTeacherForSubject(formData.subject),
          },
        },
      }));
    } else {
      // Remove entry if subject is empty
      setClassTimetables((prev) => {
        const newClassTimetables = { ...prev };
        if (newClassTimetables[selectedClass]) {
          const newData = { ...newClassTimetables[selectedClass] };
          delete newData[cellKey];
          newClassTimetables[selectedClass] = newData;
        }
        return newClassTimetables;
      });
    }

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Load data from localStorage on component mount
  // Save to localStorage whenever classTimetables changes
  const { request, isLoading, error } = useRequest();
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.localStorage.getItem("currentClass")) {
        window.localStorage.setItem("currentClass", "1A");
      }
      const lastClass = window.localStorage.getItem("currentClass");
      window.history.pushState(null, "", "?class=" + lastClass);
    }
    (async () => {
      const savedTimetables = await request("get", "/timetable");
      if (savedTimetables) {
        setClassTimetables(JSON.parse(savedTimetables.data.timetable));
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      if (JSON.stringify(classTimetables) != "{}") {
        await request("patch", "/timetable", classTimetables);
      }
    })();
  }, [classTimetables]);

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("currentClass", newClass);
      window.history.pushState(null, "", "?class=" + newClass);
    }
  };
  const teacherTier = useRef(Tier.TEACHER);
  const params = useSearchParams();
  const classe = params.get("class");
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const [mode, setMode] = useState<{
    mode: null | "add" | "edit";
    sub: null;
  }>({ mode: null, sub: null });
  const [teachers, setTeachers] = useState();
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await (
        await request("get", "/teacher", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ).data.teacher;
      setTeachers(teachers);
    };
    const teacher = JSON.parse(localStorage.getItem("user"));
    teacherTier.current = teacher.tier;
    setViewingOwnTt(teacher.tier == Tier.TEACHER)
    fetchTeachers();
  }, []);
  console.log(teachers);

  return !user ? (
    router.push("/login")
  ) : (
    <div className="min-h-screen bg-neutral">
      <TimetableHeader loggedIn={true} />
      {/* Admin Banner */}
      {/* <div className="bg-red-50 border-y border-red-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-red-600" />
            <p className="text-red-800 font-medium text-sm">
              Administrator Mode - Full Edit Access
            </p>
          </div>
        </div>
      </div> */}
      <main className="px-4 py-8">
        <Tabs activeTab="schedule" />
        <div className="flex items-center justify-between mb-4">
          <TimeSystem />
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="px-4 py-2 bg-highlight text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setViewingOwnTt((oldvot) => !oldvot)}
              >
                <ClockIcon className="h-4 w-4" />
                {viewingOwnTt
                  ? "View Complete Timetable"
                  : "View Own Timetable"}
              </button>
              <button
                className="px-4 py-2 bg-secondary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMode({ mode: "add", sub: null })}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Substitute
              </button>
            </div>
            {!viewingOwnTt && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="classSelect"
                  className="text-sm font-medium text-gray-700"
                >
                  <span className="sm:inline hidden">Select </span>Class:
                </label>
                <select
                  id="classSelect"
                  value={classe}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {classes
                    .map((classe) => classe.join(""))
                    .map((classe) => (
                      <option value={classe}>{classe}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
        {}
        <CurrentPeriodBanner classTimetables={classTimetables} selectedClass={params.get("class") || "1A"} />
        <WeeklyTimetable
          selectedClass={params.get("class") || "1A"}
          classTimetables={classTimetables}
          setClassTimetables={setClassTimetables}
          viewingOwnTt={viewingOwnTt}
        />
        <AddEditSubstitution
          {...{
            mode,
            setMode,
            teachers,
          }}
        />
        {/* <TeacherDetails /> */}
        {/* 
            {activeTab === "teachers" && (
              <AdminTeacherDetails classTimetables={classTimetables} />
            )} */}
      </main>
    </div>
  );
}
