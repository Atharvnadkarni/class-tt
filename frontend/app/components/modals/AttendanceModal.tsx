import { useRequest } from "@/app/hooks/useRequest";
import { ArrowLeftRight, X } from "lucide-react";
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
  periodValues,
}: {
  setVisibility: (v: boolean) => void;
  attendanceRecord: any;
  periodValues: any;
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
  const absentTeacherTimetables = useRef(periodValues || []);
  const [currentTab, setCurrentTab] = useState(0);
  const [workload] = useState<WorkloadItem[]>([]);
  const determinePeriodValues = async () => {
    for (const teacher of absentTeachers) {
      const pvMatch =
        Array.isArray(periodValues) &&
        periodValues.find((pv) => {
          if (!pv || pv.teacher !== teacher) return false;
          const s = pv.subjects;
          if (!s) return false;
          return Array.isArray(s) ? s.length > 0 : Object.keys(s).length > 0;
        });
      console.log(pvMatch, 99);
      if (!pvMatch) {
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
                let currentDay = new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                });
                currentDay = currentDay == "Sunday" ? "Saturday" : currentDay;
                // const currentDay = "Friday";
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
        console.log(74, teacher, todaySubjects);

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

        const classPeriods: Record<string, number[]> = {};
        Object.entries(formattedSubjects).forEach(([className, periods]) => {
          classPeriods[className] = Object.keys(periods).map((periodKey) => {
            const periodNum = parseInt(periodKey.split("-")[1], 10);
            return periodNum;
          });
        });
        let filteredFormattedSubjects = formattedSubjects;
        console.log(74, "Class periods:", classPeriods);
        for (
          let index = 0;
          index < Object.entries(classPeriods).length;
          index++
        ) {
          const [classe, periods] = Object.entries(classPeriods)[index];
          for (const period of periods) {
            const substitutionRes = await request(
              "get",
              `/substitution?class=${classe}&period=${period}`
            );
            // Use local date (YYYY-MM-DD) to match local weekday calculations and avoid UTC offset issues
            const today = new Date();
            const todayDateStr = `${today.getFullYear()}-${String(
              today.getMonth() + 1
            ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            const substitution = substitutionRes.data.substitutions.filter(
              (t) => t.date && t.date.slice(0, 10) === todayDateStr
            );
            // Find the periodKey for this period
            const periodKey = Object.keys(formattedSubjects[classe]).find(
              (pk) => parseInt(pk.split("-")[1], 10) === period
            );
            console.log(74, periodKey, substitution);
            if (substitution.length > 0 && periodKey) {
              // No substitution, set subject to null
              filteredFormattedSubjects[classe][periodKey] = null;
            }
          }
        }
        // You can now use formattedSubjects as needed
        if (
          !absentTeacherTimetables.current.some((t) => t.teacher == teacher)
        ) {
          const oldTrTimetables = absentTeacherTimetables.current;
          absentTeacherTimetables.current = [
            ...oldTrTimetables,
            { teacher, subjects: filteredFormattedSubjects },
          ];
        }
        console.log(
          teacher,
          formattedSubjects,
          absentTeacherTimetables.current
        );
      }
    }
    console.log(74, absentTeacherTimetables.current);
    // absentTeacherTimetables.current = absentTeacherTimetables.current.filter(
    //   (tt) => Object.keys(tt).length > 0
    // );
    // absentTeacherTimetables.current = 0;
  };
  useEffect(() => {
    console.log(currentTab, 126)
  }, [currentTab])
  useEffect(() => {
    console.log(periodValues, 977);
    determinePeriodValues();
  }, [periodValues]);
  const handleSubstitute = async (classe, period, teacher) => {
    const today = new Date();
    // Use local date (YYYY-MM-DD) to avoid JSON.stringify converting it to UTC midnight
    const localDateStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    await request(
      "post",
      "/substitution",
      {
        class: classe,
        period,
        teacher,
        date: localDateStr,
      },
      {
        headers: {
          "X-Request-Origin": "Modal",
          "X-Period-Values": JSON.stringify(absentTeacherTimetables.current),
        },
      }
    );
  };

  const [teacherSubs, setTeacherSubs] = useState({ 0: { 0: "" } });
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-3/4 relative">
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

          {/* Modal Body */}
          <div
            className="p-6 space-y-4 overflow-y-auto"
            style={{ height: "calc(100% - 60px)" }}
          >
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
              <div className="overflow-y-auto">
                <h2 style={{ fontSize: 20 }}>
                  <b>{absentTeachers[currentTab]}</b> is absent
                </h2>
                {console.log(absentTeacherTimetables.current, currentTab)}
                <p>
                  {
                    // Get the current absent teacher's timetable object
                    reqLoading ? (
                      <span>Loading...</span>
                    ) : Object.keys(
                        absentTeacherTimetables.current[currentTab]?.subjects ??
                          {}
                      ).length == 0 ? (
                      <span>
                        Does not have any periods today in your classes.
                      </span>
                    ) : Object.values(
                        absentTeacherTimetables.current[currentTab]?.subjects ??
                          {}
                      )
                        .map((sub) =>
                          Object.values(sub ?? {}).filter((a) => a)
                        )[0]
                        .filter((a) => a).length == 0 ? (
                      <span>All periods are substituted.</span>
                    ) : (
                      <ul>
                        {Object.entries(
                          absentTeacherTimetables.current[currentTab].subjects
                        ).map(([className, periods]) =>
                          Object.entries(periods).map(
                            ([periodKey, subject], currentTabPeriod) => {
                              // Extract period number from "Friday-1" etc.
                              const periodNum = periodKey.split("-")[1];
                              if (subject) {
                                return (
                                  <li
                                    key={`${className}-${periodKey}`}
                                    className="my-2"
                                    style={{ fontSize: 17 }}
                                  >
                                    <span>
                                      {className} - Period {periodNum} (
                                      {subject})
                                    </span>
                                    <div className="flex gap-2 p-1">
                                      <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={
                                          (teacherSubs[currentTab] ?? [])[
                                            currentTabPeriod
                                          ] ??
                                          Object.keys(attendanceRecord).filter(
                                            (tr) => !absentTeachers.includes(tr)
                                          )[0]
                                        }
                                        onChange={(e) => {
                                          console.log(
                                            teacherSubs,
                                            currentTab,
                                            currentTabPeriod
                                          );
                                          setTeacherSubs((ots) => ({
                                            ...ots,
                                            [currentTab]: {
                                              ...ots[currentTab],
                                              [currentTabPeriod]:
                                                e.target.value,
                                            },
                                          }));
                                        }}
                                      >
                                        {Object.keys(attendanceRecord)
                                          .filter(
                                            (tr) => !absentTeachers.includes(tr)
                                          )
                                          .map((tr, i) => (
                                            <>
                                              <option value={tr}>{tr}</option>
                                            </>
                                          ))}
                                      </select>
                                      <button
                                        className="px-4 py-2 text-sm font-medium  bg-secondary text-black hover:bg-secondary text-black rounded-lg transition-colors flex items-center gap-2"
                                        onClick={() => {
                                          let todayDay =
                                            new Date().toLocaleDateString(
                                              "en-IN",
                                              {
                                                weekday: "long",
                                                timeZone: "Asia/Kolkata",
                                              }
                                            );
                                          todayDay =
                                            todayDay == "Sunday"
                                              ? "Saturday"
                                              : "Sunday";
                                          console.log(295);

                                          absentTeacherTimetables.current[
                                            currentTab
                                          ].subjects[className][
                                            `${todayDay}-${periodNum}`
                                          ] = null;
                                          console.log(
                                            absentTeacherTimetables.current,
                                            977
                                          );
                                          handleSubstitute(
                                            className,
                                            periodNum,
                                            teacherSubs[currentTab] &&
                                              teacherSubs[currentTab][
                                                currentTabPeriod
                                              ]
                                              ? teacherSubs[currentTab][
                                                  currentTabPeriod
                                                ]
                                              : Object.keys(
                                                  attendanceRecord
                                                ).filter(
                                                  (tr) =>
                                                    !absentTeachers.includes(tr)
                                                )[0]
                                          );
                                        }}
                                      >
                                        <ArrowLeftRight /> Substitute
                                      </button>
                                    </div>
                                  </li>
                                );
                              }
                            }
                          )
                        )}
                      </ul>
                    )
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          {/* <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 absolute bottom-0 w-full">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => setVisibility(false)}
            >
              Cancel
            </button>
            
          </div> */}
        </div>
      </div>
    </>
  );
};
export default AttendanceModal;
