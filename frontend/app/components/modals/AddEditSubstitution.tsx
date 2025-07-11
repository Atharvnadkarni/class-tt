import { classes, subjects, subjectToDisplayName } from "@/subjects";
import axios from "axios";
import { Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AddEditSubstitution = ({ mode, setMode, teachers }) => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    class: "",
    period: "",
    date: null,
    teacher: "",
  });
  const handleCancel = () => {
    setMode({ mode: null, substitution: null });
    setFormData({
      class: "",
      period: "",
      date: null,
      teacher: "",
    });
  };
  console.log(mode);
  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
  useEffect(() => {
    if (mode && mode.mode == "edit") {
      setFormData(mode.sub);
    }
  }, [mode?.mode]);
  const handleAddSave = async (e) => {
    if (!user) {
      setError("Must be logged in");
      return;
    }
    await axios.post(
      "https://class-tt-backend.onrender.com/api/substitution",
      {
        ...formData,

        date: formData.date ?? new Date(),
      },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setMode({ mode: null, sub: null });
    location.reload();
  };
  const handleEditSave = async (_id) => {
    if (!user) {
      setError("Must be logged in");
      return;
    }
    await axios.patch(
      "https://class-tt-backend.onrender.com/api/substitution/" + _id,
      formData,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    const newSubstitutions = await (
      await axios.get(
        "https://class-tt-backend.onrender.com/api/substitution",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
    ).data.substitutions;
    console.log(newSubstitutions);
    setMode(null);
    location.reload();
  };

  if (mode && mode.mode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Substitute</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Period and Time Info */}

            {/* Subject Input */}
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Class
              </label>
              <select
                id="class"
                value={formData.class}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    class: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No class</option>
                {classes.map((classe) => (
                  <option value={classe.join("")}>{classe.join("")}</option>
                ))}
              </select>
            </div>

            {/* Subject Input */}
            <div>
              <div className="flex" id="periodselect">
                <div className="flex items-center">
                  <label htmlFor="class" className="mr-2 text-lg">
                    Day
                  </label>
                  <input
                    type="date"
                    defaultValue={formatDate(new Date())}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        date: new Date(e.target.value),
                      }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="class" className="mx-2 ml-4 text-lg">
                    Period
                  </label>
                  <input
                    type="number"
                    id="period"
                    value={formData.period}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        period: parseInt(e.target.value),
                      }))
                    }
                    min={1}
                    max={9}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {}
                  </input>
                </div>
              </div>
            </div>
            {/* Subject Input */}
            <div>
              <label
                htmlFor="teacher"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teacher
              </label>
              <select
                id="teacher"
                value={formData.teacher}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teacher: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No teacher</option>
                {teachers.map((teacher) => (
                  <option value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                mode?.mode == "add"
                  ? handleAddSave
                  : mode?.mode == "edit"
                  ? () => handleEditSave(mode?.sub?._id)
                  : null
              }
              className="px-4 py-2 text-sm font-medium  bg-primary text-black hover:bg-primary text-black rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
};
export default AddEditSubstitution;
