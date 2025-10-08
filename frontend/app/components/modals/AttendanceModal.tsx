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
        Object.entries(parsedTrFilteredTimetable).forEach(([className, classObj]: [string, any]) => {
          Object.entries(classObj).forEach(([periodKey, periodValue]: [string, any]) => {
            const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
            if (periodKey.toLowerCase().startsWith(currentDay.toLowerCase())) {
              if (!todaySubjects[className]) todaySubjects[className] = {};
              todaySubjects[className][periodKey] = periodValue;
            }
          });
        });
        // Transform todaySubjects into desired format: {7C: Wednesday-7: "ATL/WE"}
        const formattedSubjects: Record<string, Record<string, string>> = {};
        Object.entries(todaySubjects).forEach(([className, periods]) => {
          formattedSubjects[className] = {};
          Object.entries(periods).forEach(([periodKey, periodValue]: [string, any]) => {
            const subjectObj = periodValue.subject;
            // Join all subject values with "/"
            const subjectStr = Object.values(subjectObj).join("/");
            formattedSubjects[className][periodKey] = subjectStr;
          });
        });
        // You can now use formattedSubjects as needed
        const oldTrTimetables = absentTeacherTimetables.current;
        console.log(teacher, formattedSubjects, absentTeacherTimetables.current);
        absentTeacherTimetables.current = [
          ...oldTrTimetables,
          formattedSubjects,
        ];
      }
      console.log(74, absentTeacherTimetables.current.filter(tt => Object.keys(tt).length))
      absentTeacherTimetables.current = absentTeacherTimetables.current.filter(tt => Object.keys(tt).length > 0)
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
            {absentTeachers.map((tr) => (
              <>
                <p>{tr} is absent</p>
                <p>{JSON.stringify(absentTeacherTimetables.current)}</p>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceModal;
