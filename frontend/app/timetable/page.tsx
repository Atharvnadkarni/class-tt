"use client";

import TimetableHeader from "../components/Header";
import WeeklyTimetable from "../../weekly-timetable";
import CurrentPeriodBanner from "../../current-period-banner";
import TeacherDetails from "../../teacher-details";
import { Clock, Shield, Plus, ArrowRightLeft, Save } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import AdminTeacherDetails from "../components/AdminTeacherDetails";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SubstituteButton from "../substitute";
import TimeSystem from "../components/TimeSystem";
import Tabs from "@/tabs";
import { classes } from "@/subjects";
import { useSelector } from "react-redux";

export default function AdminPage(props) {
  return (
    <Suspense>
      <AdminPagee {...props} />
    </Suspense>
  );
}
function AdminPagee() {
  const [selectedClass, setSelectedClass] = useState("1A");
  const [classTimetables, setClassTimetables] = useState<{
    [key: string]: any;
  }>({});
  const [activeTab, setActiveTab] = useState<"schedule" | "teachers">(
    "schedule"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    if (!localStorage.getItem("currentClass")) {
      localStorage.setItem("currentClass", "1A");
    }
    const lastClass = localStorage.getItem("currentClass");
    history.pushState(null, "", "?class=" + lastClass);
    const savedTimetables = localStorage.getItem("classTimetables");
    if (savedTimetables) {
      setClassTimetables(JSON.parse(savedTimetables));
    }
  }, []);
  useEffect(() => {
    if (JSON.stringify(classTimetables) != "{}") {
      localStorage.setItem("classTimetables", JSON.stringify(classTimetables));
    }
  }, [classTimetables]);

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    localStorage.setItem("currentClass", newClass);
    history.pushState(null, "", "?class=" + newClass);
  };
  const params = useSearchParams();
  const classe = params.get("class");
  const router = useRouter();
  const user = useSelector((state) => state.user);

  return !user ? (
    router.push("/login")
  ) : (
    <div className="min-h-screen bg-gray-50">
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
            <SubstituteButton
              currentClass={localStorage.getItem("currentClass")}
            />
            <div className="flex items-center gap-2">
              <label
                htmlFor="classSelect"
                className="text-sm font-medium text-gray-700"
              >
                Select Class:
              </label>
              <select
                id="classSelect"
                value={classe}
                onChange={(e) => handleClassChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {classes.map((classe) => (
                  <option value={classe.join("")}>{classe.join("")}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {}
        <CurrentPeriodBanner classTimetables={classTimetables} />
        <WeeklyTimetable
          isReadOnly={false}
          selectedClass={params.get("class") || "1A"}
          classTimetables={classTimetables}
          setClassTimetables={setClassTimetables}
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
