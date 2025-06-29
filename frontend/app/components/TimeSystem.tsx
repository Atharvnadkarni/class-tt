import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const TimeSystem = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const int = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  }, []);
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2 text-gray-600">
        <span className="font-medium">
          Today:{" "}
          {currentTime.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="h-4 w-4" />
        <span className="font-mono">
          {currentTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h12",
          })}
        </span>
      </div>
    </div>
  );
};
export default TimeSystem;
