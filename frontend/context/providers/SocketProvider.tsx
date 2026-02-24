// components/SocketProvider.tsx
"use client";

import AttendanceModal from "@/app/components/modals/AttendanceModal";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../contextHooks";
import { setAttendance } from "../attendanceSlice";

const socket = io("https://class-tt-backend.onrender.com");

const ModalContext = createContext({});
export const useModalContext = () => useContext(ModalContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attendanceRecord, setAttendanceRecord] = useState();
  const [periodValues, setPeriodValues] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const dispatch = useAppDispatch();
  useEffect(() => {
    socket.on("connect", () => {});
    socket.on("attendance", (attendanceRecord) => {
      setAttendanceRecord(JSON.parse(attendanceRecord));
      dispatch(setAttendance(JSON.parse(attendanceRecord)));
      const allPresent = Object.values(JSON.parse(attendanceRecord)).every(
        (a) => a,
      );
      if (!allPresent) {
        setModalVisible(true);
        setModalKey((k) => k + 1);
      } else {
        setModalVisible(false);
      }
    });
    socket.on("update_periods", (periodValues) => {
      setPeriodValues(JSON.parse(periodValues));
    });

    return () => {
      socket.off("connect", () => {});
    };
  }, []);

  return (
    <ModalContext.Provider value={{ setModalVisible }}>
      {children}
      {modalVisible && (
        <AttendanceModal
          key={modalKey}
          setVisibility={setModalVisible}
          attendanceRecord={attendanceRecord}
          periodValues={periodValues}
        />
      )}
    </ModalContext.Provider>
  ); // render children normally
}
