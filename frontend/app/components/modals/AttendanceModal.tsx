import { useRequest } from "@/app/hooks/useRequest";
import { X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatDate = (date: Date) => date && date.toISOString().slice(0, 10);

interface WorkloadItem {
  subject: string;
  class?: string;
  allotted?: number;
  taken?: number;
}

const AttendanceModal = ({
  setVisibility,
  attendanceRecord,
}: {
  setVisibility: (v: boolean) => void;
  attendanceRecord: any;
}) => {
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  // Dummy state for weekRange and workload to avoid errors
  const [weekRange, setWeekRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const absentTeachers = Object.keys(attendanceRecord).filter(
    (key) => attendanceRecord[key] == false
  );
  const absentTeacherTimetables = useRef([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [workload] = useState<WorkloadItem[]>([]);
  useEffect(() => {
    (async () => {
      for (const teacher of absentTeachers) {
        const teacherObject = await (
          await request("get", `/teacher?name=${teacher}`)
        ).data.teacher[0];
        const teacherDisplayName = teacherObject.displayName;
        const trFilteredTimetable = await (
          await request("get", `/timetable?teacher=${teacherDisplayName}`)
        ).data.timetable;
        const parsedTrFilteredTimetable = JSON.parse(trFilteredTimetable);
        // parsedTrFilteredTimetable is an object like { "7B": { "Monday-3": {...}, ... } }
        const todaySubjects: Record<string, any> = {};
        Object.entries(parsedTrFilteredTimetable).forEach(
          ([className, classObj]: [string, any]) => {
            Object.entries(classObj).forEach(
              ([periodKey, periodValue]: [string, any]) => {
                const currentDay = new Date().toLocaleString("en-US", {
                  weekday: "long",
                });
                if (
                  periodKey.toLowerCase().startsWith(currentDay.toLowerCase())
                ) {
                  if (!todaySubjects[className]) todaySubjects[className] = {};
                  todaySubjects[className][periodKey] = periodValue;
                }
              }
            );
          }
        );
        // Transform todaySubjects into desired format: {7C: Wednesday-7: "ATL/WE"}
        const formattedSubjects: Record<string, Record<string, string>> = {};
        Object.entries(todaySubjects).forEach(([className, periods]) => {
          formattedSubjects[className] = {};
          Object.entries(periods).forEach(
            ([periodKey, periodValue]: [string, any]) => {
              const subjectObj = periodValue.subject;
              // Join all subject values with "/"
              const subjectStr = Object.values(subjectObj).join("/");
              formattedSubjects[className][periodKey] = subjectStr;
            }
          );
        });
        // You can now use formattedSubjects as needed
        const oldTrTimetables = absentTeacherTimetables.current;
        console.log(
          teacher,
          formattedSubjects,
          absentTeacherTimetables.current
        );
        if (
          !absentTeacherTimetables.current.some(
            (t) => JSON.stringify(t) == JSON.stringify(formattedSubjects)
          )
        ) {
          absentTeacherTimetables.current = [
            ...oldTrTimetables,
            formattedSubjects,
          ];
        }
      }
      console.log(
        74,
        absentTeacherTimetables.current.filter((tt) => Object.keys(tt).length)
      );
      absentTeacherTimetables.current = absentTeacherTimetables.current.filter(
        (tt) => Object.keys(tt).length > 0
      );
      // absentTeacherTimetables.current = 0;
    })();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {/* Removed teacher.name due to unfound variable */}
            Absentees
          </h3>
          <button
            onClick={() => setVisibility(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between p-6 pt-2 border-gray-200">
          <div className="w-full">
            <div className="sm:flex gap-2">
              <button
                className="px-2 h-[45px] text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  console.log(
                    Object.entries(attendanceRecord).filter(([a, b]) => !b)
                  );
                  setCurrentTab((oldct) => (oldct == 0 ? oldct : oldct - 1));
                }}
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() => {
                  setCurrentTab((oldct) =>
                    oldct ==
                    Object.entries(attendanceRecord).filter(([a, b]) => !b)
                      .length -
                      1
                      ? oldct
                      : oldct + 1
                  );
                }}
                className="px-2 h-[45px] text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronRight />
              </button>
            </div>
            <>
              <h2 style={{ fontSize: 20 }}>
                <b>{absentTeachers[currentTab]}</b> is absent
              </h2>

              <p>
                {
                  // Get the current absent teacher's timetable object
                  absentTeacherTimetables.current[currentTab] ? (
                    <ul>
                      {Object.entries(
                        absentTeacherTimetables.current[currentTab]
                      ).map(([className, periods]) =>
                        Object.entries(periods).map(([periodKey, subject]) => {
                          // Extract period number from "Friday-1" etc.
                          const periodNum = periodKey.split("-")[1];
                          return (
                            <li
                              key={`${className}-${periodKey}`}
                              style={{ fontSize: 17 }}
                            >
                              <span>
                                {className} - Period {periodNum} ({subject})
                              </span>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                {Object.keys(attendanceRecord)
                                  .filter(
                                    (tr) => !absentTeachers.includes(tr)
                                  )
                                  .map((tr) => (
                                    <option value={tr}>{tr}</option>
                                  ))}
                              </select>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  ) : (
                    <span>No timetable found.</span>
                  )
                }
              </p>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceModal;
