import { subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { BookCopy, Pencil, Trash2, User } from "lucide-react";
import { useSelector } from "react-redux";
import DeleteModal from "./modals/DeleteModal";
import { useState } from "react";
import { Tier } from "@/types";
import WorkloadModal from "./modals/WorkloadModal";
import { useRequest } from "../hooks/useRequest";

const TeacherAttendanceCard = ({
  children,
  mode,
  attendanceRecord,
  setAttendanceRecord,
}) => {
  return (
    <>
      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex items-center">{children}</div>
        <div className="flex gap-2">
          <button
            className={`bg-green-500 text-white px-4 py-1 rounded-full transition ${
              mode == "saved"
                ? "cursor-default"
                : "hover:bg-green-600 cursor-pointer"
            }`}
          >
            Present
          </button>
          <button className={`bg-red-500 text-white px-4 py-1 rounded-full transition ${
              mode == "saved"
                ? "cursor-default"
                : "hover:bg-red-600 cursor-pointer"
            }`}>
            Absent
          </button>
        </div>
      </div>
    </>
  );
};
export default TeacherAttendanceCard;
