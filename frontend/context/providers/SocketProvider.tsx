// components/SocketProvider.tsx
"use client";

import AttendanceModal from "@/app/components/modals/AttendanceModal";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../contextHooks";
import { setAttendance } from "../attendanceSlice";

const socket = io("http://localhost:4000");

const AttendanceContext = createContext<{
  setModalVisible?: (val: boolean | undefined) => void;
}>({});

export const useAttendanceContext = () => useContext(AttendanceContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attendanceRecord, setAttendanceRecord] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [periodValues, setPeriodValues] = useState([]);
  const [modalKey, setModalKey] = useState(0);
  const dispatch = useAppDispatch();
  useEffect(() => {
    socket.on("connect", () => {
      console.log("[Socket] connected");
    });
    socket.on("attendance", (attendanceRecord) => {
      console.log(`[Socket] Attendance ${attendanceRecord}`);
      setAttendanceRecord(JSON.parse(attendanceRecord));
      setModalVisible(true);
      dispatch(setAttendance(JSON.parse(attendanceRecord)));
      setModalKey((k) => k + 1);
    });
    socket.on("update_periods", (periodValues) => {
      console.log("[Socket] Period Values sent");
      setPeriodValues(JSON.parse(periodValues));
    });

    return () => {
      socket.off("connect", () => {
        console.log("[Socket] disconnected");
      });
    };
  }, []);

  return (
    <AttendanceContext.Provider value={{ setModalVisible }}>
      {children}
      {modalVisible && (
        <AttendanceModal
          key={modalKey}
          setVisibility={setModalVisible}
          attendanceRecord={attendanceRecord}
          periodValues={periodValues}
        />
      )}
    </AttendanceContext.Provider>
  ); // render children normally
}
