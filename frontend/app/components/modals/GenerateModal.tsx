import { classes, subjectList, subjectToDisplayName } from "@/subjects";
import { ReportRange } from "@/types";
import { useRequest } from "@/app/hooks/useRequest";
import { formatDate, setWeek } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import ConstraintModal from "./ConstraintModal";
import { useAppSelector } from "@/context/contextHooks";

const formatDate = (date: Date) => date && date.toISOString().slice(0, 10);

interface GenerateItem {
  subject: string;
  class?: string;
  allotted?: number;
  taken?: number;
}

const GenerateModal = ({
  open,
  setOpen,
  // teacher,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  // teacher: any;
}) => {
  const teachers = useAppSelector((state) => state.teacher.teachers);
  const inputFile = useRef<HTMLInputElement | null>(null);
  const handleClick = () => {
    inputFile.current?.click();
  };
  const handleDLClick = () => {
    const wb = XLSX.utils.book_new();

    const data = [];
    // Template data
    const headerData = ["No", "Name"];
    for (const subject of subjectList) {
      headerData.push(subject);
    }
    data.push(headerData);
    // const [no, name, ...smth] = headerData;
    teachers.forEach((teacher, index) => {
      data.push([index + 1, teacher?.name ?? teacher]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const getCellWidth = (text, min = 10, max = 50) => {
      const length = text?.toString().length || 0;

      return Math.max(min, Math.min(length + 2, max));
    };

    // Column widths
    ws["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      ...subjectList.map((sub) => ({ wch: 10 })),
    ];

    // Add worksheet to workbook
    for (const classe of classes) {
      XLSX.utils.book_append_sheet(wb, ws, classe.join(""));
    }

    // Download file
    XLSX.writeFile(wb, "teacher_template.xlsx");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);

      const workbook = XLSX.read(data, { type: "array" });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const [constraintsOpen, setConstraintsOpen] = useState(false);

  if (open) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-l-lg shadow-xl w-3/4 h-3/4 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {/* {teacher.name} */}Auto-Generate Timetable
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-2 border-gray-200">
              {/* <div>
<button
onClick={() => setReportRange(ReportRange.WEEKLY)}
className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
reportRange === ReportRange.WEEKLY
  ? "bg-white text-blue-600 shadow-sm"
  : "text-gray-600 hover:text-gray-800"
}`}
>
Weekly Report
</button>
<button
onClick={() => setReportRange(ReportRange.MONPLY)}
className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
reportRange === ReportRange.MONPLY
  ? "bg-white text-blue-600 shadow-sm"
  : "text-gray-600 hover:text-gray-800"
}`}
>
Monply Report
</button>
</div> */}
            </div>
            {/* <div> */}
            <div className="mx-auto flex items-center justify-center overflow-x-auto flex-1 flex-col">
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={inputFile}
                style={{ display: "none" }}
                onChange={handleFile}
              />
              <div className="flex flex-row gap-2">
                <button
                  className="px-4 py-2 bg-purple-700 text-white  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={handleClick}
                >
                  <Upload className="h-4 w-4" />
                  Upload Workload File (*.xlsx, *.csv)
                </button>
                <button
                  className="px-4 py-2 bg-orange-700 text-white  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={handleDLClick}
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>
              <div className="spacer w-full flex-1" />
              <div className="flex items-center overflow-x-auto flex-row pb-4 px-4 gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {/* {teacher.name} */}Constraints:{" "}
                  <span
                    className="cursor-pointer text-blue"
                    onClick={() => setConstraintsOpen(true)}
                  >
                    Click to modify
                  </span>
                </h3>
              </div>
              <button
                className="px-4 py-2 bg-purple-700 text-white  text-sm font-medium rounded-lg transition-colors flex items-center mb-8"
                onClick={() => {}}
              >
                <Sparkles className="h-4 w-4" />
                &nbsp;Generate
              </button>
            </div>

            {/* {openConstraints && ( */}
            {/* <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Always be together, dont be on the same day
      </p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            className="border border-gray-300 rounded-md px-4 py-2 text-sm"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="" disabled>
              Select Subject
            </option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-11 right-0 flex items-center">
            {selectedSubject && (
              <button
                className="bg-white rounded-full p-1"
                onClick={() => addConstraint(selectedSubject)}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <ul className="list-disc list-inside pl-4">
          {constraints.map((constraint) => (
            <li key={constraint._id}>{constraint.subject.name}</li>
          ))}
        </ul>
      </div>
    </div>
  </div> */}
            {/* )} */}
          </div>
        </div>
        <ConstraintModal open={constraintsOpen} setOpen={setConstraintsOpen} />
      </>
    );
  }
};
export default GenerateModal;
