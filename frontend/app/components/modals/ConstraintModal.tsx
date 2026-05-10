import { subjectList, subjectToDisplayName } from "@/subjects";
import { ReportRange } from "@/types";
import { useRequest } from "@/app/hooks/useRequest";
import { formatDate, setWeek } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

const formatDate = (date: Date) => date && date.toISOString().slice(0, 10);

interface GenerateItem {
  subject: string;
  class?: string;
  allotted?: number;
  taken?: number;
}

const TableConstraints = ({
  thingToDisplay,
  setConstraints,
  constraints,
  title,
  description,
  inputRefs: [firstInputRefs, secondInputRefs]
}) => {
  return (
    <div>
      {/* <form> */}
      <label className="flex flex-col gap-2 mb-2">
        <h3 className="text-2xl font-semibold text-gray-800">Batchwise</h3>
        <p className="text-sm font-regular text-gray-400">
          All the pairs that are made here will always be batchwise! For
          example, you can put WE and ATL or WE and MM and they will always be
          batchwise, that is WE will always be with ATL or MM!
        </p>
      </label>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-2 rounded-l-lg border-gray-200 w-[25%]">
              First Period
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-2 rounded-r-lg border-gray-200 w-[25%]">
              Second Period
            </th>
          </tr>
        </thead>
        <tbody>
          {console.log(
            constraints?.[thingToDisplay]?.filter(
              ([firstPart, secondPart]) => firstPart || secondPart,
            ),
          )}
          {constraints?.[thingToDisplay]
            ?.filter((batch) => batch.flat().length > 0)
            .map(([firstPart, secondPart], i) => (
              <tr className="border-b border-gray-100 min-h-7">
                <td className="px-4 py-3   min-h-7 text-left text-sm gap-2 font-semibold text-gray-700 border-2 rounded-l-lg border-gray-200 w-[25%]">
                  <div className="flex gap-2">
                    {firstPart.map((elem, j) => (
                      <div className="bg-blue-300 p-2 gap-2 min-w-2 flex flex-row items-center">
                        {elem}{" "}
                        <a
                          href="#"
                          onClick={() => {
                            setConstraints((c) => {
                              const newThingo = c[thingToDisplay].map(
                                (batch, ind) =>
                                  ind == i
                                    ? [
                                        batch[0].filter(
                                          (_elem, jnd) => jnd != j,
                                        ),
                                        batch[1],
                                      ]
                                    : batch,
                              );
                              // console.log(j, i, newBatchwise)
                              return { ...c, [thingToDisplay]: newThingo };
                            });
                          }}
                        >
                          <X className="w-[15px]" />
                        </a>
                      </div>
                    ))}
                    <input
                      type="text"
                      list="listian"
                      className="flex-1"
                      placeholder=""
                      ref={(el) => {
                        firstInputRefs.current[i] = el;
                      }}
                      onChange={(e) => {
                        console.log("Heahahoom", e);
                        if (e.target.value.slice(-1) == " ") {
                          console.log("Heahahoomie!");
                          setConstraints((c) => {
                            // console.log(c.batchwise)
                            const batchwise = c[thingToDisplay].map(
                              (batch, index) => {
                                if (index !== i) return batch;

                                return [
                                  [...batch[0], e.target.value], // new array instead of push
                                  [...batch[1]],
                                ];
                              },
                            );

                            return { ...c, [thingToDisplay]: batchwise };
                            // return { ...c, batchwise: newBatchwise };
                          });
                          setTimeout(() => {
                            e.target.blur();
                            e.target.value = "";
                            const lastFirstInputRef =
                              firstInputRefs.current?.[i];
                            console.log(firstInputRefs);
                            lastFirstInputRef?.focus();
                          }, 0);
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3   min-h-7 text-left text-sm font-semibold text-gray-700 border-2 rounded-r-lg border-gray-200 w-[25%]">
                  <div className="flex gap-2 ">
                    {secondPart.map((elem, j) => (
                      <div className="bg-blue-300 p-2 gap-2 min-w-2 flex flex-row items-center">
                        {elem}{" "}
                        <a
                          href="#"
                          onClick={() => {
                            setConstraints((c) => {
                              const newBatchwise = c[thingToDisplay].map(
                                (batch, ind) =>
                                  ind == i
                                    ? [
                                        batch[0],
                                        batch[1].filter(
                                          (_elem, jnd) => jnd != j,
                                        ),
                                      ]
                                    : batch,
                              );

                              // const newBatchwise =                                   const newBatchwise = c.batchwise.map((batch, ind) => ind == i ? [batch[0].filter((_elem, jnd) => jnd != j), batch[1]] : batch)

                              return { ...c, [thingToDisplay]: newBatchwise };
                            });
                          }}
                        >
                          <X className="w-[15px]" />
                        </a>
                      </div>
                    ))}
                    <input
                      type="text"
                      list="listian"
                      className="flex-1"
                      placeholder=""
                      ref={(el) => {
                        secondInputRefs.current[i] = el;
                      }}
                      onChange={(e) => {
                        console.log("Heahahoom", e);
                        if (e.target.value.slice(-1) == " ") {
                          console.log("Heahahoomie!");
                          setConstraints((c) => {
                            // console.log(c.batchwise)
                            const batchwise = c[thingToDisplay].map(
                              (batch, index) => {
                                if (index !== i) return batch;

                                return [
                                  [...batch[0]], // new array instead of push
                                  [...batch[1], e.target.value],
                                ];
                              },
                            );

                            return { ...c, [thingToDisplay]: batchwise };
                            // return { ...c, batchwise: newBatchwise };
                          });
                          setTimeout(() => {
                            e.target.blur();
                            e.target.value = "";
                            const lastSecondInputRef =
                              secondInputRefs.current?.[i];
                            console.log(secondInputRefs);
                            lastSecondInputRef?.focus();
                          }, 0);
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          {/* <button><Plus className="w-2" /></button> */}
          <tr className="border-b border-gray-100 min-h-7">
            <td className="px-4 py-3   min-h-7 text-left text-sm gap-2 font-semibold text-gray-700 border-2 rounded-l-lg border-gray-200 w-[25%]">
              <div className="flex gap-2">
                <input
                  type="text"
                  list="listian"
                  className="w-full"
                  placeholder="Indesign"
                  onChange={(e) => {
                    console.log("Heahahoom", e);
                    if (e.target.value.slice(-1) == " ") {
                      console.log("Heahahoomie!");
                      setConstraints((c) => {
                        // console.log(c.batchwise)
                        const batchwise = [...c[thingToDisplay]];
                        batchwise.push([[e.target.value], []]);

                        return { ...c, thingToDisplay: batchwise };
                        // return { ...c, batchwise: newBatchwise };
                      });
                      setTimeout(() => {
                        e.target.blur();
                        e.target.value = "";
                        const lastFirstInputRef =
                          firstInputRefs.current?.[
                            firstInputRefs.current?.length - 1
                          ];
                        console.log(firstInputRefs);
                        lastFirstInputRef?.focus();
                      }, 0);
                    }
                  }}
                />
              </div>
            </td>
            <datalist
              id="listian"
              onSelect={(e) => {
                alert("HEAHEHAHEA HE CHANGED!!");
              }}
            >
              {subjectList.map((sub) => (
                <option value={sub}>{sub}</option>
              ))}
            </datalist>
            <td className="px-4 py-3   min-h-7 text-left text-sm font-semibold text-gray-700 border-2 rounded-r-lg border-gray-200 w-[25%]">
              <div className="flex gap-2 ">
                <input
                  type="text"
                  className="w-full"
                  placeholder="Indesign"
                  onChange={(e) => {
                    console.log("Heahahoom", e);
                    if (e.target.value.slice(-1) == " ") {
                      console.log("Heahahoomie!");
                      setConstraints((c) => {
                        // console.log(c.batchwise)
                        const batchwise = [...c[thingToDisplay]];
                        batchwise.push([[], [e.target.value]]);

                        return { ...c, [thingToDisplay]: batchwise };
                        // return { ...c, batchwise: newBatchwise };
                      });
                      setTimeout(() => {
                        e.target.blur();
                        e.target.value = "";
                        const lastFirstInputRef =
                          firstInputRefs.current?.[
                            firstInputRefs.current?.length - 1
                          ];
                        console.log(firstInputRefs);
                        lastFirstInputRef?.focus();
                      }, 0);
                    }
                  }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {/* <table className="w-full min-w-[1200px]">
            {/* Table Header - Periods across the top 
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 w-24 sticky left-0 bg-[#efd584] z-10">
                  Day/Period
                </th>
                {periods.map((period) => (
                  <th
                    key={period.name}
                    className={`px-3 py-3 text-center text-sm font-semibold border-r border-gray-200 last:border-r-0 min-w-[100px] !bg-highlight ${
                      period.name === "Break"
                        ? "!bg-gray-300 text-black"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{period.name}</span>
                      <span
                        className={`text-xs font-normal mt-1 ${
                          period.name === "Break"
                            ? "text-black"
                            : "text-gray-700"
                        }`}
                      >
                        {period.time}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body - Days as rows 
            <tbody>
              {days.map((day, dayIndex) => (
                <tr
                  key={day}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors bg-white"
                >
                  {/* Day Name 
                  <td className="px-4 py-4 text-sm font-medium text-white border-r border-gray-200 sticky left-0 bg-contrast z-10">
                    {day}
                  </td>

                  {/* Period Columns 
                  {periods.map((period) => (
                    <td
                      key={`${day}-${period.name}`}
                      className={`px-3 py-4 text-sm text-center last:border-r-0 transition-colors min-h-[60px] ${
                        period.name === "Break"
                          ? "bg-gray-200 border-gray-300 border-b"
                          : isReadOnly
                          ? "border-r cursor-default"
                          : "hover:bg-blue-50 cursor-pointer border-gray-200 border-r"
                      }`}
                      onClick={() => handleCellClick(day, period)}
                    >
                      <div
                        className={`min-h-[32px] flex items-center justify-center `}
                      >
                        {getCellContent(day, period)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table> */}
      {/* <input
              type="text"
              // defaultValue={formatDate(new Date())}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  date: new Date(e.target.value),
                }));
              }}
              className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            /> */}
      {/* </form> */}
    </div>
  );
};

const ConstraintModal = ({
  open,
  setOpen,
  // teacher,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  // teacher: any;
}) => {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const handleClick = () => {
    inputFile.current?.click();
  };

  const [constraints, setConstraints] = useState({
    batchwise: [
      [["ATL"], ["WE", "MA"]],
      [["Art"], ["CH", "HW"]],
      [["Music"], ["LS", "GK"]],
    ],
    consecutive: [
      [["ATL"], ["ATL"]],
      [["Art"], ["Art"]],
      [["Comp"], ["Comp"]],
    ],
    notSameDay: [
      [["Music", "GK"], ["Music", "LS"]],

    ],
  });
  const batchwiseFir = useRef<HTMLInputElement[] | null>([]);
  const consecutiveFir = useRef<HTMLInputElement[] | null>([]);
  const batchwiseSir = useRef<HTMLInputElement[] | null>([]);
  const consecutiveSir = useRef<HTMLInputElement[] | null>([]);
  // const [batchwiseSir, consecutiveSir] = useRef<HTMLInputElement[][] | null>([[], []]);
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

  if (open) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-l-lg shadow-xl w-3/5 h-3/4 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 pb-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {/* {teacher.name} */}Constraints
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mx-auto flex overflow-x-auto flex-1 flex-col gap-2 w-full px-10">
            <TableConstraints
              constraints={constraints}
              description="A"
              title="B"
              setConstraints={setConstraints}
              thingToDisplay={"batchwise"}
              inputRefs={[batchwiseFir, batchwiseSir]}
            />
            <TableConstraints
              constraints={constraints}
              description="A"
              title="B"
              setConstraints={setConstraints}
              thingToDisplay={"consecutive"}
              inputRefs={[consecutiveFir, consecutiveSir]}
            />
            <TableConstraints
              constraints={constraints}
              description="A"
              title="B"
              setConstraints={setConstraints}
              thingToDisplay={"consecutive"}
              inputRefs={[consecutiveFir, consecutiveSir]}
            />
            <TableConstraints
              constraints={constraints}
              description="A"
              title="B"
              setConstraints={setConstraints}
              thingToDisplay={"notSameDay"}
              inputRefs={[consecutiveFir, consecutiveSir]}
            />
          </div>
        </div>
      </div>
    );
  }
};
export default ConstraintModal;
