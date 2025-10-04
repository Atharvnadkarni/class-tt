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

const AttendanceModal = ({
  setVisibility,
  attendanceRecord,
}: {
  setVisibility: (v: boolean) => void;
  attendanceRecord: any;
}) => {
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-3/4 h-3/4">
        {/* Modal Header */}
        {JSON.stringify(attendanceRecord)}
      </div>
    </div>
  );
};
export default AttendanceModal;
