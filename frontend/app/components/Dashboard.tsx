import Tabs from "@/tabs";
import AttendanceAlert from "./AttendanceAlert";

const Dashboard = (props) => {
  return (
    <div className="w-full -mx-4">
      <Tabs activeTab={props.activeTab} />
      <AttendanceAlert />
    </div>
  );
};
export default Dashboard;
