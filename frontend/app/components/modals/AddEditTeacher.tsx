import { subjectList, subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import bcrypt from "bcrypt"

const AddEditTeacher = ({ mode, setMode, allTeachers, setAllTeachers }) => {
  const [formData, setFormData] = useState({
    subject: "",
    div: "",
    classNo: null,
  });
  const [teacherName, setTeacherName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  console.log(13, mode?.teacher?.subjects);
  const [subs, setSubs] = useState(
    mode?.mode == "edit" && (mode?.teacher?.subjects ?? [])
  );
  const handleCancel = () => {
    setMode({ mode: null, teacher: null });
    setFormData({ subject: "", div: "", classNo: null, teacherName: null });
    setSubs([]);
  };
  const handleAddSave = async (e) => {
    console.log(formData.classNo && formData.div && formData.subject);
    if (formData.classNo && formData.div && formData.subject) {
      const sub = JSON.parse(JSON.stringify(formData));
      delete sub.teacherName;
      setSubs((prev) => [...prev, sub]);
    }
    const subs2SubGroup = (subs) => {
      const grouped = subs.reduce((acc, curr) => {
        const key = curr.subject;
        const classEntry = [String(curr.classNo), curr.div];
        const existing = acc.find((item) => item.subject === key);
        if (existing) {
          existing.classes.push(classEntry);
        } else {
          acc.push({ subject: key, classes: [classEntry] });
        }
        return acc;
      }, []);
      return grouped;
    };
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await axios
      .post("http://localhost:4000/api/teacher", {
        name: teacherName,
        class: "",
        subjects: subs2SubGroup(subs),
        username,
        password: hashedPassword,
      })
      .catch((err) => console.error(err.message));
    const newTeachers = await (
      await axios.get("http://localhost:4000/api/teacher")
    ).data.teacher;
    setMode(null);
    setAllTeachers(newTeachers);
    setSubs([]);
  };
  const handleEditSave = async (_id) => {
    if (formData.classNo && formData.div && formData.subject) {
      const sub = JSON.parse(JSON.stringify(formData));
      delete sub.teacherName;
      setSubs((prev) => [...prev, sub]);
    }
    const subs2SubGroup = (subs) => {
      const grouped = subs.reduce((acc, curr) => {
        const key = curr.subject;
        const classEntry = [String(curr.classNo), curr.div];
        const existing = acc.find((item) => item.subject === key);
        if (existing) {
          existing.classes.push(classEntry);
        } else {
          acc.push({ subject: key, classes: [classEntry] });
        }
        return acc;
      }, []);
      return grouped;
    };
    await axios.patch("http://localhost:4000/api/teacher/" + _id, {
      name: teacherName,
      class: "",
      subjects: subs2SubGroup(subs),
      username,
      password,
    });
    const newTeachers = await (
      await axios.get("http://localhost:4000/api/teacher")
    ).data.teacher;
    setMode(null);
    setAllTeachers(newTeachers);
    setSubs([]);
  };
  useEffect(() => {
    const subs = mode?.teacher?.subjects;
    if (subs) {
      for (const sub of subs) {
        if (sub) {
          sub.classNo = sub?.classes[0];
          sub.div = sub?.classes[1];
        }
      }
    }

    setSubs(subs ?? []);
  }, [mode?.mode]);
  if (mode && mode.mode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {mode.mode == "add" ? "Add Teacher" : "Edit Teacher"}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Subject Input */}
            <div>
              <label
                htmlFor="teacherName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teacher
              </label>
              <input
                type="text"
                id="teacherName"
                value={teacherName || ""}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  setUsername(e.target.value.toLowerCase().split(" ")[0]);
                  setPassword(
                    e.target.value.toLowerCase().split(" ").map(part => part.slice(0,4)).toReversed().join('') +
                      // .split("")
                      // .map((char) => char.charCodeAt(0) - 96)
                      // .join("")
                      "123"
                  );
                }}
                placeholder="Enter teacher name"
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username || ""}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                placeholder="Enter teacher name"
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="text"
                id="password"
                value={password || ""}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                placeholder="Enter teacher name"
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="subjects">
              <div className="subject">
                <label
                  htmlFor="class-taught"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subjects
                </label>
                <div className="flex w-full">
                  <select
                    className="w px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.subject}
                    onChange={(e) => {
                      // setFormData((prev) => ({
                      //   ...formData,
                      //   subjects: [
                      //     { ...prev.subjects, subject: e.target.value },
                      //     ...formData.subjects.filter(
                      //       (elem, ind) => ind != i
                      //     ),
                      //   ],
                      // }));
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }));
                    }}
                  >
                    <option value="">Subject</option>

                    {subjectList.map((subject) => (
                      <option value={subject}>
                        {subjectToDisplayName[subject.subject] &&
                        subjectToDisplayName[subject.subject].length <= 10
                          ? subjectToDisplayName[subject.subject]
                          : subject}
                      </option>
                    ))}
                  </select>
                  {/* {} */}
                  <input
                    type="number"
                    id="teacherName"
                    value={formData.classNo ?? 0}
                    onChange={(e) => {
                      // setFormData((prev) => ({
                      //   ...prev,
                      //   subjects: [
                      //     {
                      //       ...prev,
                      //       classNo: parseInt(e.target.value),
                      //     },
                      //     ...prev.subjects.filter(
                      //       (elem, ind) => ind != i
                      //     ),
                      //   ],
                      // }));
                      setFormData((prev) => ({
                        ...prev,
                        classNo:
                          e.target.value == null
                            ? ""
                            : parseInt(e.target.value),
                      }));
                    }}
                    placeholder="Class"
                    className="w-[80px] px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    className="w px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.div}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        div: e.target.value,
                      }));
                      // setFormData((prev) => ({
                      //   ...prev,
                      //   subjects: [
                      //     {
                      //       ...prev.subjects[i],
                      //       div: e.target.value,
                      //     },
                      //     ...prev.subjects.filter(
                      //       (elem, ind) => ind != i
                      //     ),
                      //   ],
                      // }));
                    }}
                  >
                    <option value="">Division</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="AB">AB</option>
                    <option value="AC">AC</option>
                    <option value="BC">BC</option>
                    <option value="ABC">ABC</option>
                  </select>
                  <button
                    onClick={(e) => {
                      const sub = JSON.parse(JSON.stringify(formData));
                      setFormData((prev) => ({
                        subject: "",
                        div: "",
                        classNo: null,
                      }));

                      setSubs((prev) => [...prev, sub]);
                    }}
                    className="px-2 h-[45px] ml-5 text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="" />
                  </button>
                </div>
              </div>
              <ul>
                {subs.map((sub) => (
                  <li>
                    {sub.subject} {sub.classNo}
                    {sub.div}
                  </li>
                ))}
              </ul>
              {/* Subject Input */}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={
                mode.mode == "add"
                  ? handleAddSave
                  : mode.mode == "edit"
                  ? () => handleEditSave(mode.teacher._id)
                  : null
              }
              className="px-4 py-2 text-sm font-medium  bg-primary text-black hover:bg-primary text-black rounded-lg transition-colors flex items-center gap-2"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
};
export default AddEditTeacher;
