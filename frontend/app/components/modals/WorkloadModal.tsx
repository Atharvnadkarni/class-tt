import { ReportRange } from "@/types";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const WorkloadModal = ({ setVisibility, teacher }) => {
  const [workload, setWorkload] = useState([]);
  const [reportRange, setReportRange] = useState(ReportRange.WEEKLY);
  useEffect(() => {
    const fetchData = async () => {
      const teacherId = teacher._id;
      const res = await axios.get(
        "http://localhost:4000/api/teacher/workload/" + teacherId,
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).token
            }`,
          },
        }
      );
      const data = await res.data;
      setWorkload(data.workload);
    };
    fetchData();
  }, []);

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
          <div>
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
          </div>
            <div>
            <label className="block text-sm text-gray-600 mb-1">Week Range</label>
            <div className="flex gap-2">
              <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              // onChange={...}
              />
              <span className="self-center text-gray-500">to</span>
              <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              // onChange={...}
              />
            </div>
            </div>
        </div>
        <div className="flex items-center justify-between p-6 pt-2 border-gray-200">
          <table>
            <thead className="w-full">
              <tr className="w-full">
                <th className="w-24 text-left">Subject</th>
                <th className="w-24 text-left">Class</th>
                <th className="w-24 text-left">Allotted</th>
              </tr>
            </thead>
            <tbody className="w-full">
              {console.log(workload)}
              {workload.map((subject) => (
                <tr className="w-full">
                  <td className="w-24">{subject.subject}</td>
                  <td className="w-24">{subject.class}</td>
                  <td className="w-24">{subject.allotted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default WorkloadModal;
