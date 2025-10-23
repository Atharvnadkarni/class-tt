import Tabs from "@/tabs";
import AttendanceAlert from "./AttendanceAlert";

const Dashboard = (props) => {
  return (
    <div>
      <Tabs activeTab={props.activeTab} />
      <AttendanceAlert />
    </div>
  );
};
export default Dashboard;
