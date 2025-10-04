import { X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
  // Dummy state for weekRange and workload to avoid errors
  const [weekRange, setWeekRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const absentTeachers = Object.keys(attendanceRecord).filter(key => attendanceRecord[key] == false)
  const [workload] = useState<WorkloadItem[]>([]);

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
            
            {absentTeachers.map(tr => <p>{tr} is absent</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceModal;
