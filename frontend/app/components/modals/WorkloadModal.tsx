import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const WorkloadModal = ({ setVisibility, teacher }) => {
  const [workload, setWorkload] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const teacherId = teacher._id;
      const res = await axios.get(
        "http://localhost:4000/api/teacher/workload/" + teacherId,
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user")).token
            }`,
          },
        }
      );
      const data = await res.data;
      setWorkload(data.workload);
    };
    fetchData();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {teacher.name}
          </h3>
          <button
            onClick={() => setVisibility(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between p-6 pt-2 border-gray-200">
          <table>
            <thead className="w-full">
              <tr className="w-full">
                <th className="w-24 text-left">Subject</th>
                <th className="w-24 text-left">Allotted</th>
              </tr>
            </thead>
            <tbody className="w-full">
              {console.log(workload)}
              {workload.map((subject) => (
                <tr className="w-full">
                  <td className="w-24">{subject.subject}</td>
                  <td className="w-24">{subject.allotted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default WorkloadModal;
