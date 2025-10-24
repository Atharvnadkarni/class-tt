import Tabs from "@/tabs";
import AttendanceAlert from "./AttendanceAlert";
import { useAppSelector } from "@/context/contextHooks";

interface AttendanceRecord {
  [key: string]: boolean;
}

const Dashboard = (props) => {
  const attendanceRecord: AttendanceRecord = useAppSelector(
    (state) => state.attendance.record
  );
  const allPresent = Object.values(attendanceRecord).every((a) => a);
  return (
    <div className="w-full -mx-4">
      <Tabs activeTab={props.activeTab} />
      {allPresent && <AttendanceAlert />}
    </div>
  );
};
export default Dashboard;
