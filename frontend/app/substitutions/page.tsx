"use client";

import Tabs from "@/tabs";
import TimetableHeader from "@/app/components/Header";
import SubstituteButton from "../substitute";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowDownWideNarrow,
  ArrowRightLeft,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import AddEditSubstitution from "../components/modals/AddEditSubstitution";
import { classes } from "@/subjects";
import DeleteModal from "../components/modals/DeleteModal";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

interface Sub {
  class: string;
  period: string;
  date: Date;
  teacher: any;
}
const getLocalStorageItem = (key: string, defaultValue: string): string => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
};

const SubstitutionPage = () => {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [teachers, setTeachers] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    class: null,
    date: null,
  });
  const user = useSelector((state) => state.user);
  const [deleteModalId, setDeleteModalId] = useState(null);
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
    const fetchSubs = async () => {
      const subs = await (
        await axios.get(
          "https://class-tt-backend.onrender.com/api/substitution",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        )
      ).data.substitutions;
      setSubs(subs);
    };
    const fetchTeachers = async () => {
      const teachers = await (
        await axios.get("http://localhost:4000/api/teacher", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
      ).data.teacher;
      setTeachers(teachers);
    };
    fetchTeachers();
    fetchSubs();
  }, []);
  const [mode, setMode] = useState<{
    mode: null | "add" | "edit";
    sub: null;
  }>({ mode: null, sub: null });
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  return !user ? (
    router.push("/login")
  ) : (
    <div className="min-h-screen bg-gray-50">
      <TimetableHeader loggedIn={true} />
      <main className="px-4 py-8">
        <Tabs activeTab="subs" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Substitutions
            </h1>
            <div className="flex gap-2 items-center">
              <div>
                <button
                  className="px-4 py-2 bg-primary text-black hover:bg-primary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setMode({ mode: "add", sub: null })}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Substitute
                </button>
              </div>
              <div className="flex flex-col justify-start">
                <button
                  className="px-4 py-2 text-sm font-semibold text-black bg-gray-300 text-black text-black  text-sm font-small rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setDropdownOpen(true)}
                >
                  <ArrowDownWideNarrow />
                  Filter
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 z-10 mt-10 bg-white border border-gray-200 rounded shadow-lg p-4 w-48">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        By class:
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        value={
                          dropdownData.class ??
                          localStorage.getItem("currentClass")
                        }
                        onChange={(e) => {
                          setDropdownData((prev) => ({
                            ...prev,
                            class: e.target.value,
                          }));
                        }}
                      >
                        <option value="">All Classes</option>
                        {classes.map(([num, sec]) => (
                          <option key={`${num}${sec}`} value={`${num}${sec}`}>
                            {num}
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        By date:
                      </label>
                      <input
                        type="date"
                        value={formatDate(dropdownData.date || new Date())}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        onChange={(e) => {
                          setDropdownData((prev) => ({
                            ...prev,
                            date: new Date(e.target.value),
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <AddEditSubstitution
            {...{
              mode,
              setMode,
              teachers,
            }}
          />
          <ul>
            {subs
              .filter((sub) => {
                console.log(
                  sub,
                  dropdownData,
                  new Date(sub.date),
                  dropdownData?.date
                );
                let dateCorrect = true;
                let classCorrect = true;
                if (dropdownData.date) {
                  const fixedSubDate = new Date(sub.date).setHours(0, 0, 0, 0);
                  const fixedDropdownDate = new Date(
                    dropdownData.date
                  ).setHours(0, 0, 0, 0);
                  dateCorrect =
                    fixedSubDate.valueOf() == fixedDropdownDate.valueOf();
                }
                if (dropdownData.class) {
                  classCorrect = sub.class == dropdownData.class;
                }

                if (!dropdownData.date && !dropdownData.class) return true;
                if (!dropdownData.date) return classCorrect;
                if (!dropdownData.class) return dateCorrect;
                return dateCorrect && classCorrect;
              })
              .map((sub) => (
                <li className="flex items-center gap-2">
                  <div className="flex">
                    <Pencil
                      onClick={() => {
                        setMode({ mode: "edit", sub });
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <Trash2
                      onClick={() => setDeleteModalId(sub._id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {new Date(sub.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  - {sub.teacher} in {sub.class} during period {sub.period}
                </li>
              ))}
          </ul>
        </div>
      </main>
      {deleteModalId && (
        <DeleteModal
          setIsModalOpen={setDeleteModalId}
          deleteAction={async () => {
            await axios.delete(
              "https://class-tt-backend.onrender.com/api/substitution/" +
                deleteModalId +
                "/",
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );
            const newSubs = await (
              await axios.get(
                "https://class-tt-backend.onrender.com/api/substitution",
                {
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                  },
                }
              )
            ).data.substitutions;
            setDeleteModalId(false);
            setSubs(newSubs);
          }}
        />
      )}
    </div>
  );
};
export default SubstitutionPage;
