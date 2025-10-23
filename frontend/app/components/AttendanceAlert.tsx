import { useAttendanceContext } from "@/context/providers/SocketProvider";
import { TriangleAlert } from "lucide-react";
import { useDispatch } from "react-redux";

const AttendanceAlert = () => {
  const { setModalVisible } = useAttendanceContext();
  return (
    <div
      className="h-7 w-[100vw] bg-red-700 text-white  flex items-center justify-center -mt-6 cursor-pointer"
      onClick={() => setModalVisible(true)}
    >
      <TriangleAlert className="mr-2" /> Absent teachers' periods have not been
      fully substituted.
    </div>
  );
};
export default AttendanceAlert;
