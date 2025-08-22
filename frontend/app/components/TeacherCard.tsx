import { subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { BookCopy, Pencil, Trash2, User } from "lucide-react";
import { useSelector } from "react-redux";
import DeleteModal from "./modals/DeleteModal";
import { useState } from "react";
import { Tier } from "@/types";

const TeacherCard = ({ teacher, setMode, setAllTeachers, tier }) => {
  const user = useSelector((state) => state.user);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const deleteTeacher = async (_id: string) => {
    if (!user) return;
    await axios.delete(`http://localhost:4000/api/teacher/${_id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const newTeachers = await (
      await axios.get(`http://localhost:4000/api/teacher/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
    ).data.teacher;
    setAllTeachers(newTeachers);
  };
  return (
    <div
      key={teacher.name}
      className="flex items-center justify-between p-4 border border-gray-200 bg-[#b8defc] rounded-lg hover:bg-[#a6d7ff] transition-colors relative"
    >
      {(tier == Tier.ADMIN || tier == Tier.COORDINATOR) && (
        <div className="flex absolute top-2 right-2 gap-2">
          <BookCopy className="w-4 h-4" style={{ cursor: "pointer" }} />
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
          <h4 className="text-lg/[23px] font-semibold text-gray-800">
            {teacher.name}
          </h4>
          <p className="text-sm/[18px] text-gray-600">
            {teacher.subjects
              .map(
                (subject) =>
                  `${
                    subjectToDisplayName[subject.subject] || subject.subject
                  } ${subject.classes
                    .map((classe) => (classe == 0 ? "" : classe))
                    .join(", ")}`
              )
              .reduce((previous, current) => {
                return [previous, <br key={previous} />, current].flat();
              })}
          </p>
          <p className="text-sm/[18px] text-gray-600">
            {teacher.tier ?? Tier.TEACHER}
          </p>
        </div>
      </div>
      {deleteModalId && (
        <DeleteModal
          setIsModalOpen={setDeleteModalId}
          deleteAction={() => deleteTeacher(deleteModalId)}
        />
      )}
    </div>
  );
};
export default TeacherCard;
