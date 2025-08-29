import { subjectToDisplayName } from "@/subjects";
import { ReportRange } from "@/types";
import { useRequest } from "@/app/hooks/useRequest";
import { formatDate, setWeek } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const formatDate = (date: Date) => date && date.toISOString().slice(0, 10);

interface WorkloadItem {
  subject: string;
  class?: string;
  allotted?: number;
  taken?: number;
}

const WorkloadModal = ({
  setVisibility,
  teacher,
}: {
  setVisibility: (v: boolean) => void;
  teacher: any;
}) => {
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);
  const [reportRange, setReportRange] = useState(ReportRange.WEEKLY);
  const [weekRange, setWeekRange] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const lastSaturday = new Date(today);
    lastSaturday.setDate(lastMonday.getDate() + 5);
    // If lastSaturday is after today, go another week before
    if (lastSaturday > today) {
      lastMonday.setDate(lastMonday.getDate() - 7);
      lastSaturday.setDate(lastSaturday.getDate() - 7);
    }

    setWeekRange([lastMonday, lastSaturday]);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const requestApi = useRequest({ token: user.token }) as Record<string, any>;
    const fetchData = async () => {
      const teacherId = teacher._id;
      const workload = await requestApi.getTeacherWorkload(
        teacherId,
        formatDate(weekRange[0]),
        formatDate(weekRange[1])
      );
      setWorkload(workload);
    };
    fetchData();
  }, [weekRange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {teacher.name}
          </h3>
          <button
            onClick={() => setVisibility(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between px-6 py-2 border-gray-200">
          {/* <div>
            <button
              onClick={() => setReportRange(ReportRange.WEEKLY)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                reportRange === ReportRange.WEEKLY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportRange(ReportRange.MONTHLY)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                reportRange === ReportRange.MONTHLY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly Report
            </button>
          </div> */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Week Range
            </label>
            <div className="grid gap-2">
              <button
                onClick={() => {
                  const [mon, sat] = weekRange;
                  const nextMonday = new Date(mon);
                  const nextSaturday = new Date(sat);
                  nextMonday.setDate(mon.getDate() - 7);
                  nextSaturday.setDate(sat.getDate() - 7);
                  setWeekRange([nextMonday, nextSaturday]);
                }}
                className="px-2 h-[45px] text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft />
              </button>
              <input
                type="date"
                value={formatDate(weekRange[0])}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                // onChange={...}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={formatDate(weekRange[1])}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                // onChange={...}
              />
              <button
                onClick={() => {
                  const [mon, sat] = weekRange;
                  const nextMonday = new Date(mon);
                  const nextSaturday = new Date(sat);
                  nextMonday.setDate(mon.getDate() + 7);
                  nextSaturday.setDate(sat.getDate() + 7);
                  if (nextSaturday <= new Date())
                    setWeekRange([nextMonday, nextSaturday]);
                }}
                className="px-2 h-[45px] text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 pt-2 border-gray-200">
          <div className="grid grid-cols-4 w-full">
            <div className="column">
              <th className="w-24 text-left">Subject</th>
              {workload.map((subject) => (
                <tr className="w-full">
                  <td
                    className={`w-24 ${
                      subject.subject == "Total" && "font-bold"
                    }`}
                  >
                    {subject.subject}
                  </td>
                </tr>
              ))}
            </div>
            <div className="column">
              <th className="w-24 text-left">Class</th>
              {workload.map((subject) => (
                <tr className="w-full">
                  <td
                    className={`w-24 ${
                      subject.subject == "Total" && "font-bold"
                    }`}
                  >
                    {subject.class}
                  </td>
                </tr>
              ))}
            </div>
            <div className="column">
              <th className="w-24 text-left">Allotted</th>
              {workload.map((subject) => (
                <tr className="w-full">
                  <td
                    className={`w-24 ${
                      subject.subject == "Total" && "font-bold"
                    }`}
                  >
                    {subject.allotted}
                  </td>
                </tr>
              ))}
            </div>
            <div className="column">
              <th className="w-24 text-left">Taken</th>
              {workload.map((subject) => (
                <tr className="w-full">
                  <td
                    className={`w-24 ${
                      subject.subject == "Total" && "font-bold"
                    }`}
                  >
                    {subject.taken}
                  </td>
                </tr>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WorkloadModal;
