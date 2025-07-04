import { ArrowRightLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import axios from "axios";
import AddEditSubstitution from "./components/modals/AddEditSubstitution";
interface SelectedCell {
  day: string;
  period: {
    name: string;
    time: string;
  };
}

interface FormData {
  subject: string[];
  teacher?: string;
  batchwise: boolean;
}

const SubstituteButton = ({ currentClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    class: currentClass,
    day: new Date(),
    period: 1,
    teacher: "",
  });
  const [teachers, setTeachers] = useState([]);
  useEffect(() => {
    const fetchTeachers = async () => {
      const teachers = await (
        await axios.get("http://localhost:4000/api/teacher")
      ).data.teacher;
      setTeachers(teachers);
    };
    fetchTeachers();
  }, []);
  const handleSave = async () => {
    const newSub = await (
      await axios.post("http://localhost:4000/api/substitution", {
        class: formData.class,
        period: formData.period,
        teacher: formData.teacher,
        date: formData.day,
      })
    ).data;

    setIsModalOpen(false);
  };
  const [mode, setMode] = useState<{
    mode: null | "add" | "edit";
    sub: null;
  }>({ mode: null, sub: null });

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-primary text-black hover:bg-primary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <ArrowRightLeft className="h-4 w-4" />
        Substitute
      </button>
      <AddEditSubstitution {...{ mode, setMode, teachers }} />
    </div>
  );
};
export default SubstituteButton;
