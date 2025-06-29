// "use client";

// import TimetableHeader from "../../timetable-header";
// import WeeklyTimetable from "../../weekly-timetable";
// import CurrentPeriodBanner from "../../current-period-banner";
// import TeacherDetails from "../../teacher-details";
// import { Clock } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function TimetablePage() {
//   const [classTimetables, setClassTimetables] = useState<{
//     [key: string]: any;
//   }>({});
//   const [viewMode, setViewMode] = useState<"teacher" | "class">("teacher");

//   // Load data from localStorage on component mount
//   useEffect(() => {
//     const savedTimetables = localStorage.getItem("classTimetables");
//     if (savedTimetables) {
//       setClassTimetables(JSON.parse(savedTimetables));
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <TimetableHeader loggedIn={true} /> <CurrentPeriodBanner />
//       <main className="px-4 py-8">
//         <div className="max-w-full">
//           <div className="mb-6">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">
//               Weekly Schedule
//             </h2>
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <span className="font-medium">Today: Tuesday</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <Clock className="h-4 w-4" />
//                   <span className="font-mono">9:45:00 AM</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <label
//                   htmlFor="viewSelect"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   View:
//                 </label>
//                 <select
//                   id="viewSelect"
//                   value={viewMode}
//                   onChange={(e) =>
//                     setViewMode(e.target.value as "teacher" | "class")
//                   }
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 >
//                   <option value="teacher">My Schedule</option>
//                   <option value="class">Class 7B Schedule</option>
//                 </select>
//               </div>
//             </div>
//             <p className="text-gray-600">
//               {viewMode === "teacher"
//                 ? "Your weekly teaching schedule"
//                 : "Class 7B's weekly schedule"}
//             </p>
//           </div>

//           <WeeklyTimetable
//             isReadOnly={true}
//             classTimetables={classTimetables}
//             teacherMode={viewMode === "teacher"}
//             selectedClass="7B"
//           />
//           <TeacherDetails classTimetables={classTimetables} />
//         </div>
//       </main>
//     </div>
//   );
// }
