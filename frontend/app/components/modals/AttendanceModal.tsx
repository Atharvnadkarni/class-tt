import { useRequest } from "@/app/hooks/useRequest";
import { useAppSelector } from "@/context/contextHooks";
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
  periodValues,
}: {
  setVisibility: (v: boolean) => void;
  attendanceRecord: any;
  periodValues: any;
}) => {
  const attendanceRecord = useAppSelector((state) => state.attendance.record);
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  // Dummy state for weekRange and workload to avoid errors
  const [weekRange, setWeekRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const absentTeachers = Object.keys(attendanceRecord).filter(
    (key) => attendanceRecord[key] == false
  );
  const [trTts, setTrTts] = useState(periodValues || []);
  const [currentTab, setCurrentTab] = useState(0);
  const [workload] = useState<WorkloadItem[]>([]);
  const timetable = useRef({});
  const user = useAppSelector((state) => state.user.user);
  const determinePeriodValues = async () => {
    let absentTeacherTimetables = [];
    console.log(timetable.current);
    for (const teacher of absentTeachers) {
      const teacherObject = await (
        await request("get", `/teacher?name=${teacher}`)
      ).data.teacher[0];
      const teacherDisplayName = teacherObject.displayName;
      let parsedTrFilteredTimetable = {};
      for (const className in timetable.current) {
        const classTimetable = timetable.current[className];
        // Loop through each period in the class
        for (const period in classTimetable) {
          const periodData = classTimetable[period];
          if (!periodData || !periodData.teachers) continue;
          // Check if any teacher matches
          const teacherLists = Object.values(periodData.teachers);
          if (teacherLists.some((list) => list.includes(teacherDisplayName))) {
            if (!parsedTrFilteredTimetable[className])
              parsedTrFilteredTimetable[className] = {};
            parsedTrFilteredTimetable[className][period] = periodData;
          }
        }
      }
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
      let filteredFormattedSubjects = structuredClone(formattedSubjects);
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
          const a = substitutionRes.data.substitutions;

          const substitution = a.filter(
            (t) => t.date && t.date.slice(0, 10) === todayDateStr
          );
          if (a.length > 0) {
            console.log(
              "90 → Substitution data (a):",
              a.map((s) => ({
                id: s._id,
                date: s.date,
                deleted: s.deleted, // or whatever your deletion flag is
              }))
            );
          }
          if (a.length > 0 && substitution.length === 0) {
            console.warn(
              "90 ⚠️ Non-today substitution(s) still exist, may cause unwanted nullification!"
            );
          }

          // Find the periodKey for this period
          const periodKey = Object.keys(formattedSubjects[classe]).find(
            (pk) => parseInt(pk.split("-")[1], 10) === period
          );

          if (substitution.length > 0 && periodKey) {
            // No substitution, set subject to null
            filteredFormattedSubjects[classe][periodKey] = null;
          }
        }
      }

      // You can now use formattedSubjects as needed
      if (!absentTeacherTimetables.some((t) => t.teacher == teacher)) {
        const oldTrTimetables = absentTeacherTimetables;
        absentTeacherTimetables = [
          ...oldTrTimetables,
          { teacher, subjects: filteredFormattedSubjects },
        ];
      }
    }
    setTrTts(absentTeacherTimetables);
    // trTts = trTts.filter(
    //   (tt) => Object.keys(tt).length > 0
    // );
    // trTts = 0;
  };
  useEffect(() => {
    determinePeriodValues();
  }, []);
  useEffect(() => {
    (async () => {
      const timetableData = (await request("get", "/timetable")).data.timetable;
      timetable.current = JSON.parse(timetableData);
    })();
  }, []);
  useEffect(() => {
    if (!Array.isArray(periodValues)) return; // invalid shape, ignore
    if (periodValues.length === 0) return;
    setTrTts(periodValues);
  }, [periodValues]);
  useEffect(() => {
    let oldTts = [];
    for (const { teacher, subjects } of trTts) {
      let oldSubs = {};
      const classes = Object.keys(subjects);
      for (const classe of classes) {
        const classNum = parseInt(classe.slice(0, -1));
        const {
          editableClasses: [lower, upper],
        } = user;
        if (lower <= classNum && classNum <= upper) {
          oldSubs[classe] = subjects[classe];
        }
      }
      oldTts.push({ teacher, subjects: oldSubs });
    }
    const same =
      oldTts.length === trTts.length &&
      oldTts.every((t, i) => {
        const old = trTts[i];
        console.log(
          i,
          t,
          old,
          t.teacher,
          old.teacher,
          t.subjects,
          old.subjects
        );
        return (
          t.teacher === old.teacher &&
          JSON.stringify(t.subjects) == JSON.stringify(old.subjects)
        );
      });
    console.log(oldTts, trTts, same);
    if (!same) {
      setTrTts(oldTts);
    }
  }, [trTts]);

  const teacherDropdowns = useRef({});

  useEffect(() => {
    (async () => {
      const teacherList = await (await request("get", "/teacher")).data.teacher;
      let subjectTeachers = {};
      trTts.forEach((tr, i) => {
        console.log(9997, tr, i);
        for (const [classe, subBreakdown] of Object.entries(tr.subjects)) {
          for (const [periodKey, period] of Object.entries(subBreakdown)) {
            if (period === null) continue;
            const filteredTeacherList = teacherList
              .filter((tr) => !absentTeachers.includes(tr.name))
              .filter((tr) => {
                for (const classeKey in timetable.current) {
                  if (!Object.hasOwn(timetable.current, classeKey)) continue;

                  const { [periodKey]: periodVal } =
                    timetable.current[classeKey];
                  const teacherPeriodList: { [key: number]: string } =
                    periodVal?.teachers;
                  // console.log(9997, 241, periodVal, classeKey)
                  if (typeof teacherPeriodList === "object") {
                    console.log(9997, "HaHa", teacherPeriodList, classeKey);
                    if (
                      Object.values(periodVal?.teachers)
                        .flat()
                        .includes(tr.displayName)
                    ) {
                      return false;
                    } else {
                      continue;
                    }
                  }
                }
                return true;
              });
            subjectTeachers = {
              ...subjectTeachers,
              [i]: {
                ...subjectTeachers[i],
                [classe]: {
                  ...subjectTeachers[i]?.[classe],
                  [periodKey]: filteredTeacherList,
                },
              },
            };
          }
        }
        console.log(9997, tr, subjectTeachers, subjectTeachers[i]);
      });
      teacherDropdowns.current = subjectTeachers;
    })();
  }, [trTts]);
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
          "X-Period-Values": JSON.stringify(trTts),
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
            <div className="w-full h-full">
              <div className="bottom-5 absolute left-[50%] -translate-x-[50%] w-full flex justify-center">
                <div className="sm:flex gap-2"><button
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
                </button></div>
              </div>
              <div className="overflow-y-auto h-[80%]">
                <h2 style={{ fontSize: 20 }}>
                  <b>{absentTeachers[currentTab]}</b> is absent
                </h2>
                {}
                <p>
                  {
                    // Get the current absent teacher's timetable object
                    reqLoading ? (
                      <span>Loading...</span>
                    ) : Object.keys(trTts[currentTab]?.subjects ?? {}).length ==
                      0 ? (
                      <span>
                        Does not have any periods today in your classes.
                      </span>
                    ) : Object.values(trTts[currentTab]?.subjects ?? {})
                        .map((sub) => Object.values(sub ?? {}).filter((a) => a))
                        .flat()
                        .filter((a) => a).length == 0 ? (
                      <span>All periods are substituted.</span>
                    ) : (
                      <ul>
                        {Object.entries(trTts[currentTab].subjects).map(
                          ([className, periods], classIndex) =>
                            Object.entries(periods).map(
                              ([periodKey, subject]) => {
                                const classesArray = Object.entries(
                                  trTts[currentTab]?.subjects ?? {}
                                );
                                const periodsInPrev = classesArray
                                  .slice(0, classIndex)
                                  .reduce(
                                    (acc, [, pr]) =>
                                      acc + Object.keys(pr ?? {}).length,
                                    0
                                  );
                                const indexInClass = Object.keys(
                                  periods ?? {}
                                ).indexOf(periodKey);
                                const currentTabPeriod =
                                  periodsInPrev + Math.max(0, indexInClass);
                                // Extract period number from "Friday-1" etc.
                                const periodNum = periodKey.split("-")[1];
                                if (subject) {
                                  console.log(
                                    667,
                                    Object.entries(trTts[currentTab].subjects)
                                  );
                                  console.log(
                                    776,
                                    teacherSubs,
                                    (teacherSubs[currentTab] ?? {
                                      [currentTabPeriod]: null,
                                    })[currentTabPeriod],
                                    currentTabPeriod,
                                    className,
                                    periodNum,
                                    subject
                                  );
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
                                            ] ?? teacherDropdowns.current?.[currentTab]?.[className]?.[periodKey]?.[0]?.name
                                          }
                                          onChange={(e) => {
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
                                          {teacherDropdowns.current?.[currentTab]?.[className]?.[periodKey].map(
                                            (tr, i) => {
                                              console.log(tr, periodNum);

                                              return (
                                                <>
                                                  <option value={tr.name}>
                                                    {tr.name}
                                                  </option>
                                                </>
                                              );
                                            }
                                          )}
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
                                                : todayDay;
                                            trTts[currentTab].subjects[
                                              className
                                            ][`${todayDay}-${periodNum}`] =
                                              null;
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
                                                      !absentTeachers.includes(
                                                        tr
                                                      )
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
