"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Tier } from "./types";

const Tabs = ({ activeTab }) => {
  const teacherTier = useRef(Tier.TEACHER);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { tier } = JSON.parse(
        window.localStorage.getItem("user") ??
          JSON.stringify({ tier: Tier.TEACHER })
      );
      teacherTier.current = tier;
    }
  }, []);

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Timetable Management
        </h2>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-neutral p-1 rounded-lg w-fit">
          <Link href="/timetable">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("currentTab", "timetable");
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "schedule"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Schedule Management
            </button>
          </Link>
          <Link href="/teachers">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("currentTab", "teachers");
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "teachers"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Teacher Details
            </button>
          </Link>
          {teacherTier.current == Tier.COORDINATOR && (
            <Link href="/substitutions">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("currentTab", "substitutions");
                  }
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "subs"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Substitution History
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default Tabs;
