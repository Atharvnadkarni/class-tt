// components/SocketProvider.tsx
"use client";

import AttendanceModal from "@/app/components/modals/AttendanceModal";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attendanceRecord, setAttendanceRecord] = useState();
  const [periodValues, setPeriodValues] = useState([]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("[Socket] connected");
    });
    socket.on("attendance", (attendanceRecord) => {
      console.log(`[Socket] Attendance ${attendanceRecord}`);
      setAttendanceRecord(JSON.parse(attendanceRecord));
    });
    socket.on("update_periods", (periodValues) => {
      console.log('[Socket] Period Values sent')
      setPeriodValues(JSON.parse(periodValues));
    });

    return () => {
      socket.off("connect", () => {
        console.log("[Socket] disconnected");
      });
    };
  }, []);

  return (
    <>
      {children}
      {attendanceRecord && (
        <AttendanceModal
          setVisibility={setAttendanceRecord}
          attendanceRecord={attendanceRecord}
          periodValues={periodValues}
        />
      )}
    </>
  ); // render children normally
}
