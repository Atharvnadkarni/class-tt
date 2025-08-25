"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  X,
  Save,
  Plus,
  Egg,
  EggFried,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { subjectList, subjects, subjectToDisplayName } from "./subjects";
import { useSelector } from "react-redux";
import { Tier } from "./types";

interface TimetableEntry {
  subject: string[];
  class: string;
  batchwise: boolean;
}

interface TimetableData {
  [key: string]: TimetableEntry;
}

interface FormData {
  subject: {
    [key: number]: { subject: string; teacher: string };
  };
}

interface WeeklyTimetableProps {
  isReadOnly?: boolean;
  selectedClass?: string;
  classTimetables?: { [key: string]: TimetableData };
  setClassTimetables?: (timetables: { [key: string]: TimetableData }) => void;
  teacherMode?: boolean;
}

export default function WeeklyTimetable(props) {
  return (
    <Suspense>
      <_WeeklyTimetable {...props} />
    </Suspense>
  );
}

function _WeeklyTimetable({
  selectedClass = "1A",
  classTimetables = {},
  setClassTimetables = () => {},
}: WeeklyTimetableProps) {
  const classSplit = [parseInt(selectedClass.slice(0, -1)), selectedClass[-1]];
  const teacherTier = useRef(Tier.TEACHER);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  useEffect(() => {
    const { tier } = JSON.parse(
      localStorage.getItem("user") ?? JSON.stringify({ tier: Tier.TEACHER })
    );
    teacherTier.current = tier;
  }, [localStorage]);
  useEffect(() => {
    switch (teacherTier.current) {
      case Tier.ADMIN:
        setIsReadOnly(true);
        setTeacherMode(false);
        break;
      case Tier.COORDINATOR:
        setIsReadOnly(false);
        setTeacherMode(false);
        break;
      case Tier.TEACHER:
        setIsReadOnly(true);
        setTeacherMode(true);
        break;
      default:
        setIsReadOnly(true);
        setTeacherMode(true);
    }
  }, [teacherTier]);
  const periods = [
    { name: "1", time: "8:30-9:20" },
    { name: "2", time: "9:20-10:10" },
    { name: "3", time: "10:10-11:00" },
    { name: "Break", time: "11:00-11:20" },
    { name: "4", time: "11:20-12:10" },
    { name: "5", time: "12:10-1:00" },
  ];

  const classes = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

  // Get current class timetable data or teacher's schedule
  const timetableData = teacherMode
    ? getTeacherSchedule()
    : classTimetables[selectedClass] || {};
  //   const teachersFilter
  // const englishTeachers = allTeachers.filter((teacher: any) =>
  //   teacher.subjects.some((subj: any) =>
  //     typeof subj.subject === "string" &&
  //     subj.subject.toLowerCase().includes("eng")
  //   )
  // );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    period: { name: string; time: string };
  } | null>(null);
  const [teachers, setTeachers] = useState<{ [key: number]: string[] }>({
    1: [],
  });
  const [formData, setFormData] = useState<FormData>({
    subject: { 1: "" },
    teachers: { 1: "" },
    batchwise: false,
  });
  const [isClash, setIsClash] = useState({ class: null, subject: null });
  const [areBatchwise, setAreBatchwise] = useState({
    mon: [false, false, false, false, false, false, false, false, false],
    tue: [false, false, false, false, false, false, false, false, false],
    wed: [false, false, false, false, false, false, false, false, false],
    thu: [false, false, false, false, false, false, false, false, false],
    fri: [false, false, false, false, false, false, false, false, false],
    sat: [false, false, false, false, false, false, false, false, false],
  });

  function getTeacherSchedule() {
    const teacherSchedule: TimetableData = {};
    const teacherName = "Shrni Faldessai"; // Current logged-in teacher

    // Go through all classes and find periods where this teacher is assigned
    Object.keys(classTimetables).forEach((className) => {
      const classTimetable = classTimetables[className];
      Object.keys(classTimetable).forEach((periodKey, index) => {
        const entry = classTimetable[periodKey];
        console.log(entry, index);
        if (
          entry?.subject[0]?.teacher == teacherName ||
          entry?.subject[1]?.teacher == teacherName
        ) {
          teacherSchedule[periodKey] = {
            subject: entry.subject,
            class: className, // Show the class name instead of teacher name
          };
        }
      });
    });

    return teacherSchedule;
  }

  const params = useSearchParams();
  // const subjectToTeacher = {
  //   Math: "Sushma",
  //   "Mental Math": "Sushma",
  //   Eng: "Melifa",
  //   CE: "Melifa",
  //   Hindi: "Archana V",
  //   CH: "Archana V",
  //   "K/F": "Reshma/Shwetambari",
  //   "CK/CF": "Reshma/Shwetambari",
  //   Konkani: "Reshma",
  //   CK: "Reshma",
  //   French: "Shwetambari",
  //   CF: "Shwetambari",
  //   Science: "Sushma",
  //   "Science Lab": "Sushma/Clara/Poonam/Damodar",
  //   History: "Rona",
  //   Geography: "Rona",
  //   "Political Science": "Rona",
  //   PE: "Sonia/Sidharth",
  //   Games: "Sonia",
  //   Yoga: "Ashutosh",
  //   MA: "Bharati",
  //   Art: "Radha",
  //   Music: "Gladson",
  //   Comp: "Prajakta/Levendra",
  //   Library: "Archana P/Valancy",
  //   SD: "Kimberly/Melifa",
  //   Dance: "Mamta",
  //   ATL: "Sayed",
  //   WE: "Sushma",
  //   GK: "Sushma",
  //   LS: "Beverly",
  //   "H&W": "Beverly",
  // };
  // const subjectToDisplayName = {
  //   "K/F": "Konkani/French",
  //   CK: "Communicative Konkani",
  //   CF: "Communicative French",
  //   Konk: "Konkani",
  //   ATL: "ATL Lab",
  //   WE: "Work Education (WE)",
  //   MA: "Martial Arts (MA)",
  //   LS: "Life Studies (LS)",
  //   Comp: "Computers",
  //   Eng: "English",
  //   SD: "Speech & Drama",
  //   "H&W": "Health & Wellness",
  //   CH: "Communicative Hindi",
  //   "CK/CF": "Communicative Konkani/French",
  //   GK: "General Knowledge (GK)",
  //   PE: "Physical Education (PE)",
  //   CE: "Communicative English",
  // };

  // const getTeacherForSubject = (subject: string) => {
  //   switch (subject) {
  //     case "Hindi":
  //     case "C.Hindi":
  //       return "Archana";
  //     case "Konkani/French":
  //     case "C.K/C.F":
  //       return "Reshma/Shwetambari";
  //     case "French":
  //     case "C.French":
  //       return "Shwetambari";
  //     case "History":
  //     case "Geography":
  //     case "Political Science":
  //       return "Rona";
  //     case "Math":
  //       return "Sushma"; // Default for Math, can be overridden for specific classes
  //     case "Science":
  //       return "Sushma";
  //     case "English":
  //     case "C.English":
  //       return "Melifa";
  //     case "PE":
  //       return "Sonia";
  //     case "Music":
  //       return "Gladson"; // Default for Science, can be overridden for specific classes
  //     default:
  //       return "Sushma"; // Default teacher (changed from Marianna)
  //   }
  // };

  const handleCellClick = (
    day: string,
    period: { name: string; time: string }
  ) => {
    if (period.name === "Break" || isReadOnly) return;

    setSelectedCell({ day, period });
    const cellKey = `${day}-${period.name}`;
    const existingData = timetableData[cellKey];
    setFormData({
      subject: existingData?.subject || {
        1: "",
      },
      teacher: existingData?.teachers || {
        1: "",
      },
    });
    setCurrentBatch(1);
    setBatches(
      Math.max(
        ...Object.keys(existingData?.subject || { 1: "" }).map((key) =>
          parseInt(key)
        )
      )
    );
    setTeachers(existingData?.teachers || { [currentBatch]: [] });
    setIsModalOpen(true);
  };

  const getCellContent = (
    day: string,
    period: { name: string; time: string }
  ) => {
    if (period.name === "Break") {
      return (
        <span className="text-primary text-xs font-medium text-black">
          Break Time
        </span>
      );
    }

    const cellKey = `${day}-${period.name}`;
    const data = timetableData[cellKey];
    if (data?.subject && data?.teachers) {
      return (
        <div className="text-xs">
          <div className="font-medium text-gray-800">
            {Object.values(data.subject)
              .map((batch) => subjectToDisplayName[batch] || batch)
              .join("/")}
          </div>

          <div className="text-gray-500">
            {Object.values(data.teachers)
              .map((teacherList) => teacherList.join("/"))
              .join(" | ")
              .replaceAll(/\/$/g, "")}
          </div>
        </div>
      );
    }

    return isReadOnly ? (
      <span className="text-gray-400 text-xs">No class</span>
    ) : (
      <span className="text-gray-400 text-xs">Click to edit</span>
    );
  };

  const handleSave = () => {
    if (!selectedCell) return;

    const cellKey = `${selectedCell.day}-${selectedCell.period.name}`;
    if (Object.values(formData.subject).join("/").trim()) {
      setClassTimetables((prev) => ({
        ...prev,
        [selectedClass]: {
          ...prev[selectedClass],
          [cellKey]: {
            subject: formData.subject,
            teachers: teachers,
            batchwise: formData.batchwise,
          },
        },
      }));
    } else {
      // Remove entry if subject is empty
      setClassTimetables((prev) => {
        const newClassTimetables = { ...prev };
        if (newClassTimetables[selectedClass]) {
          const newData = { ...newClassTimetables[selectedClass] };
          newData[cellKey] = null;
          newClassTimetables[selectedClass] = newData;
        }
        return newClassTimetables;
      });
    }

    setIsModalOpen(false);
    setSelectedCell(null);
    setFormData({ subject: null, class: null });
    setIsClash({ class: null, subject: null });
    setTeachers({ [currentBatch]: [] });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedCell(null);
    setFormData({ subject: null, class: null });
    setIsClash({ class: null, subject: null });
    setTeachers({ [currentBatch]: [] });
  };

  const [teacherList, setTeacherList] = useState([]);
  const user = useSelector((state) => state.user);
  const [batches, setBatches] = useState(1);
  const [currentBatch, setCurrentBatch] = useState(1);
  const incrementBatches = () => {
    setBatches((oldBatches) => (oldBatches += 1));
  };
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await (
        await axios.get("http://localhost:4000/api/teacher", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ).data.teacher;
      setTeacherList(teachers);
    };
    fetchTeachers();
  }, []);
  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table container with horizontal scroll on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            {/* Table Header - Periods across the top */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 w-24 sticky left-0 bg-[#efd584] z-10">
                  Class/Period
                </th>
                {periods.map((period) => (
                  <th
                    key={period.name}
                    className={`px-3 py-3 text-center text-sm font-semibold border-r border-gray-200 last:border-r-0 min-w-[100px] !bg-highlight ${
                      period.name === "Break"
                        ? "!bg-gray-300 text-black"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{period.name}</span>
                      <span
                        className={`text-xs font-normal mt-1 ${
                          period.name === "Break"
                            ? "text-black"
                            : "text-gray-700"
                        }`}
                      >
                        {period.time}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body - Days as rows */}
            <tbody>
              {days.map((day, dayIndex) => (
                <tr
                  key={day}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors bg-white"
                >
                  {/* Day Name */}
                  <td className="px-4 py-4 text-sm font-medium text-white border-r border-gray-200 sticky left-0 bg-contrast z-10">
                    {day}
                  </td>

                  {/* Period Columns */}
                  {periods.map((period) => (
                    <td
                      key={`${day}-${period.name}`}
                      className={`px-3 py-4 text-sm text-center last:border-r-0 transition-colors min-h-[60px] ${
                        period.name === "Break"
                          ? "bg-gray-200 border-gray-300 border-b cursor-pointer"
                          : isReadOnly
                          ? "border-r cursor-default"
                          : "hover:bg-blue-50 cursor-pointer border-gray-200 border-r"
                      }`}
                      onClick={() => handleCellClick(day, period)}
                    >
                      <div
                        className={`min-h-[32px] flex items-center justify-center `}
                      >
                        {getCellContent(day, period)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile scroll indicator */}
        <div className="sm:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Scroll horizontally to view all periods →
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Class
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Period and Time Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedCell.day}</span> -
                  Period {selectedCell.period.name}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedCell.period.time}
                </div>
              </div>

              {!formData.batchwise && (
                <>
                  {/* Subject Input */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject[currentBatch] ?? ""}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          subject: {
                            ...prev.subject,
                            [currentBatch]: e.target.value,
                          },
                        }));
                      }}
                      disabled={formData.batchwise}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No subject</option>
                      {subjectList.map((subject) => (
                        <option value={subject}>
                          {subjectToDisplayName[subject] || subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label
                      htmlFor="teacher"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Teacher
                    </label>
                    <div className="flex w-full">
                      <select
                        id="teacher"
                        value={formData.teacher[currentBatch] ?? ""}
                        onChange={(e) => {
                          const classKey = `${selectedCell.day}-${selectedCell.period.name}`;
                          let isBatch1Clash = false;
                          let isBatch2Clash = false;
                          let isClash = false;

                          for (const classe in classTimetables) {
                            if (
                              classTimetables[classe].hasOwnProperty(classKey)
                            ) {
                              if (
                                classTimetables[classe][classKey].subject[0]
                              ) {
                                if (!e.target.value) {
                                  console.log(
                                    e.target.value,
                                    classTimetables[classe][classKey].subject[0]
                                      .teacher,
                                    classTimetables[classe][classKey].subject[1]
                                      .teacher,
                                    classe,
                                    "is clash unset"
                                  );
                                  setIsClash({
                                    class: null,
                                    subject: null,
                                  });
                                } else if (
                                  (classTimetables[classe][classKey].subject[0]
                                    .teacher == e.target.value ||
                                    classTimetables[classe][classKey].subject[1]
                                      .teacher == e.target.value) &&
                                  classe != selectedClass
                                ) {
                                  console.log(
                                    e.target.value,
                                    classTimetables[classe][classKey].subject[0]
                                      .teacher,
                                    classTimetables[classe][classKey].subject[1]
                                      .teacher,
                                    classe,
                                    (classTimetables[classe][classKey]
                                      .subject[0].teacher == e.target.value ||
                                      classTimetables[classe][classKey]
                                        .subject[1].teacher ==
                                        e.target.value) &&
                                      classe != selectedClass,
                                    "is clash set"
                                  );
                                  setIsClash({
                                    class: classe,
                                    subject: classTimetables[classe][classKey]
                                      .subject[1].subject
                                      ? classTimetables[classe][
                                          classKey
                                        ].subject
                                          .map((sub) => sub.subject)
                                          .join("/")
                                      : classTimetables[classe][classKey]
                                          .subject[0].subject,
                                  });
                                } else if (classe != selectedClass) {
                                  console.log(
                                    e.target.value,
                                    classTimetables[classe][classKey].subject[0]
                                      .teacher,
                                    classTimetables[classe][classKey].subject[1]
                                      .teacher,
                                    classe,
                                    "is clash unset"
                                  );
                                  setIsClash({ class: null, subject: null });
                                }
                              }
                            }
                          }
                          setFormData((prev) => ({
                            ...prev,
                            teacher: {
                              ...prev.teacher,
                              [currentBatch]: e.target.value,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select teacher</option>
                        {teacherList.map((teacher) => (
                          <option value={teacher.displayName}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => {
                          console.log();
                          const lastTeacher = formData.teacher[currentBatch];
                          setTeachers((prevtrlist) => {
                            const currentTrList =
                              prevtrlist[currentBatch] || [];
                            const newTrList = [...currentTrList, lastTeacher];
                            const filteredNewTrList = newTrList.filter(
                              (item, index) => {
                                return newTrList.indexOf(item) == index;
                              }
                            );
                            return {
                              ...prevtrlist,
                              [currentBatch]: filteredNewTrList,
                            };
                          });
                          setFormData((oldFormdata) => ({
                            ...oldFormdata,
                            teacher: {
                              [currentBatch]: "",
                            },
                          }));
                        }}
                        className="px-2 h-[45px] ml-5 text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus className="" />
                      </button>
                    </div>
                    <div>
                      {teachers[currentBatch]
                        ?.join(", ")
                        .replace(/,\s*$/g, "") ?? ""}
                    </div>
                  </div>

                  {/* Pagination for batches (nonfunctional) */}
                  <div className="flex items-center justify-center mt-4">
                    <button
                      className="px-3 py-1 rounded-l bg-gray-200 text-gray-600 cursor-pointer"
                      onClick={() => {
                        setCurrentBatch((oldBatch) =>
                          oldBatch <= 1 ? oldBatch : oldBatch - 1
                        );
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <span className="px-4 py-1 bg-gray-100 text-gray-700 font-medium">
                      Batch {currentBatch}
                    </span>
                    <button
                      className="px-3 py-1 rounded-r bg-gray-200 text-gray-600 cursor-pointer"
                      onClick={() => {
                        setCurrentBatch((oldBatch) =>
                          oldBatch >= batches ? oldBatch : oldBatch + 1
                        );
                      }}
                    >
                      <ChevronRight />
                    </button>
                    <button
                      onClick={() => {
                        incrementBatches();
                        setCurrentBatch(batches + 1);
                      }}
                      className="px-3 py-1 rounded-r bg-gray-200 text-gray-600 cursor-pointer"
                    >
                      <Plus />
                    </button>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  className={`px-4 py-2 ${
                    formData.subject[currentBatch]
                      ? "bg-primary text-white"
                      : "bg-neutral  text-gray-500"
                  } text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer`}
                  onClick={() => {
                    setTeachers(oldTeachers => ({
                      ...oldTeachers,
                      [currentBatch]: []
                    }))
                    setFormData(oldFormData => ({
                      ...oldFormData,
                      subject: {
                        ...oldFormData.subject,
                        [currentBatch]: ""
                      },teacher: {
                        ...oldFormData.teacher,
                        [currentBatch]: ""
                      }
                    }))
                  }}
                >
                  <label htmlFor="batchwise" className="">
                    Clear Period
                  </label>
                </button>
              </div>
            </div>

            {isClash.class && (
              <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded m-2">
                <CircleAlert className="h-5 w-5 text-red-500" />
                <span>
                  Teacher is already assigned to {isClash.subject} in{" "}
                  {isClash.class} for this period!
                </span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isClash.class}
                className="px-4 py-2 text-sm font-medium  bg-secondary text-black text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
