import { subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { Pencil, Trash2, User } from "lucide-react";
import { useSelector } from "react-redux";

const TeacherCard = ({ teacher, setMode, setAllTeachers }) => {
  const user = useSelector((state) => state.user);
  const deleteTeacher = async (_id: string) => {
    if (!user) return;
    await axios.delete(
      `https://class-tt-backend.onrender.com/api/teacher/${_id}`
    );
    const newTeachers = await (
      await axios.get(`https://class-tt-backend.onrender.com/api/teacher/`)
    ).data.teacher;
    setAllTeachers(newTeachers);
  };
  return (
    <div
      key={teacher.name}
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
    >
      <div className="flex absolute top-2 right-2 gap-2">
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
            deleteTeacher(teacher._id);
          }}
        />
      </div>
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
                    .map((classe) => classe.join(""))
                    .join(", ")}`
              )
              .reduce((previous, current) => {
                return [previous, <br key={previous} />, current].flat();
              })}
          </p>
        </div>
      </div>
    </div>
  );
};
export default TeacherCard;
