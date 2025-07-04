"use client";

import Link from "next/link";

const Tabs = ({ activeTab }) => {
  return (
    <div className="max-w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Admin - School Management
        </h2>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <Link href="/timetable">
            <button
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
              onClick={() => {}}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "teachers"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Teacher Details
            </button>
          </Link>
          <Link href="/substitutions">
            <button
              onClick={() => {}}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "subs"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Substitution History
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Tabs;
