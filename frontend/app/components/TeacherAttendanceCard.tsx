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
  teacher,
  mode,
  attendanceRecord,
  setAttendanceRecord,
}) => {
  return (
    <>
      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex items-center">
          {teacher.name.includes(teacher.displayName) ? (
            <h3>
              {teacher.name.slice(0, teacher.name.indexOf(teacher.displayName))}
              <span className="font-bold">
                {teacher.name.slice(
                  teacher.name.indexOf(teacher.displayName),
                  teacher.name.indexOf(teacher.displayName) +
                    teacher.displayName.length
                )}
              </span>
              {teacher.name.slice(
                teacher.name.indexOf(teacher.displayName) +
                  teacher.displayName.length
              )}
            </h3>
          ) : (
            <h3>{teacher.name}</h3>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className={`text-white px-4 py-1 rounded-full transition ${
              mode == "saved"
                ? "cursor-default"
                : "hover:bg-green-600 cursor-pointer"
            } ${
              attendanceRecord[teacher.name] == true
                ? "bg-blue-800 hover:bg-blue-800"
                : mode == "editing"
                ? "bg-green-500"
                : attendanceRecord[teacher.name] == null
                ? "bg-gray-400"
                : "bg-green-300"
            }`}
            onClick={() => {
              console.log(teacher, {
                ...attendanceRecord,
                [teacher.name]: true,
              });
              setAttendanceRecord((oar) => ({ ...oar, [teacher.name]: true }));
            }}
          >
            Present
          </button>
          <button
            className={` text-white px-4 py-1 rounded-full transition ${
              mode == "saved"
                ? "cursor-default"
                : "hover:bg-red-600 cursor-pointer"
            } ${
              attendanceRecord[teacher.name] == false
                ? "bg-blue-800 hover:bg-blue-800"
                : mode == "editing"
                ? "bg-red-500"
                : attendanceRecord[teacher.name] == null
                ? "bg-gray-400"
                : "bg-red-300"
            }`}
          >
            Absent
          </button>
        </div>
      </div>
    </>
  );
};
export default TeacherAttendanceCard;
