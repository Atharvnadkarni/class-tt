import { TriangleAlert } from "lucide-react";

const AttendanceAlert = () => {
  return (
    <div className="h-7 w-full bg-red-700 text-white  flex items-center justify-center">
      <TriangleAlert className="mr-2" /> Absent teachers' periods have not been fully substituted.
    </div>
  );
};
export default AttendanceAlert;
