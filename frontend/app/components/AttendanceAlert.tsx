import { TriangleAlert } from "lucide-react";

const AttendanceAlert = () => {
  return (
    <div className="h-7 w-[100vw] bg-red-700 text-white  flex items-center justify-center -mt-6">
      <TriangleAlert className="mr-2" /> Absent teachers' periods have not been fully substituted.
    </div>
  );
};
export default AttendanceAlert;
