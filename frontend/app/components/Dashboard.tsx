import Tabs from "@/tabs";
import AttendanceAlert from "./AttendanceAlert";
import { useAppSelector } from "@/context/contextHooks";
import { useEffect } from "react";
import { useRequest } from "../hooks/useRequest";
import { useDispatch } from "react-redux";
import { setAttendance } from "@/context/attendanceSlice";

interface AttendanceRecord {
  [key: string]: boolean;
}

const Dashboard = (props) => {
  const { request, error: reqError, isLoading: reqLoading } = useRequest();
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      const res = await request("get", "/attendance");
      const attendanceData = await JSON.parse(res.data.attendance).attendance;
      dispatch(setAttendance(attendanceData));
    })();
  }, []);
  const attendanceRecord: AttendanceRecord = useAppSelector(
    (state) => state.attendance.record
  );
  const allPresent = Object.values(attendanceRecord).every((a) => a);
  return (
    <div className="w-full -mx-4">
      <Tabs activeTab={props.activeTab} />
      {!allPresent && <AttendanceAlert />}
    </div>
  );
};
export default Dashboard;
