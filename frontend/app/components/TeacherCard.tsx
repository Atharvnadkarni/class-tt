import { subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { BookCopy, Pencil, Trash2, User } from "lucide-react";
import { useSelector } from "react-redux";
import DeleteModal from "./modals/DeleteModal";
import { useState } from "react";
import { Tier } from "@/types";
import WorkloadModal from "./modals/WorkloadModal";
import { useRequest } from "../hooks/useRequest";

const TeacherCard = ({ teacher, setMode, setAllTeachers, tier }) => {
  const user = useSelector((state) => state.user);
  const [workloadVisible, setWorkloadVisible] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const { request, isLoading, error } = useRequest();
  const deleteTeacher = async (_id: string) => {
    if (!user) return;
    await request("delete", `/teacher/${_id}`);
    const newTeachers = await request("get", "/teacher").data.teacher;
    setAllTeachers(newTeachers);
  };
  return (
    <div
      key={teacher.name}
      className="flex items-center justify-between p-4 border border-gray-200 bg-[#b8defc] rounded-lg hover:bg-[#a6d7ff] transition-colors relative"
    >
      {(tier != Tier.TEACHER) && (
        <div className="flex absolute top-2 right-2 gap-2">
          <BookCopy
            className="w-4 h-4"
            style={{ cursor: "pointer" }}
            onClick={() => setWorkloadVisible(true)}
          />
          <Pencil
            className="w-4 h-4"
            style={{ cursor: "pointer" }}
            onClick={() =>
              setMode({
                mode: "edit",
                teacher,
              })
            }
          />
          <Trash2
            className="w-4 h-4"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setDeleteModalId(teacher._id);
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary text-black rounded-lg">
          <User className="h-5 w-5 text-secondary" />
        </div>
        <div className="mt-2">
          <h4 className="text-sm/[18px] md:text-lg/[23px] font-semibold text-gray-800">
            {teacher.name}
          </h4>
          <p className="text-xs/[15px] md:text-sm/[18px] text-gray-600 font-[550]">
            {teacher.subjects.length > 0 &&
              teacher.subjects
                .map((subject) => (
                  <>
                    <span>
                      <span className="hidden sm:inline">
                        {subjectToDisplayName[subject.subject] ||
                          subject.subject}
                      </span>
                      <span className="inline sm:hidden">
                        {subject.subject}
                      </span>{" "}
                      {subject.classes
                        .map((classe) => (classe == 0 ? "" : classe))
                        .join(", ")}
                    </span>
                  </>
                ))
                .reduce((previous, current) => {
                  return [previous, <br key={previous} />, current].flat();
                })}
          </p>
          <p className="text-xs/[15px] md:text-sm/[18px] text-gray-600">
            {teacher.tier ?? Tier.TEACHER}{" "}
            {teacher.editableClasses.length > 0 &&
              `for Classes ${teacher.editableClasses.join("-")}`}
          </p>
        </div>
      </div>
      {deleteModalId && (
        <DeleteModal
          setIsModalOpen={setDeleteModalId}
          deleteAction={() => deleteTeacher(deleteModalId)}
        />
      )}
      {workloadVisible && (
        <WorkloadModal setVisibility={setWorkloadVisible} teacher={teacher} />
      )}
    </div>
  );
};
export default TeacherCard;
