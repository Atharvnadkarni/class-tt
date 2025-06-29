"use client";

import { BookOpen, GraduationCap } from "lucide-react";

interface TeacherDetailsProps {
  classTimetables?: { [key: string]: any };
}

export default function TeacherDetails({
  classTimetables = {},
}: TeacherDetailsProps) {
  const teacherName = "Michelle";

  // Calculate teacher's subjects and classes from timetable data
  const getTeacherData = () => {
    const subjects = new Set<string>();
    const classes = new Set<string>();
    const subjectClasses: { [key: string]: Set<string> } = {};
    let totalPeriods = 0;

    // Always show Grade 7B as the teacher's primary class
    classes.add("7B");

    Object.keys(classTimetables).forEach((className) => {
      const classTimetable = classTimetables[className];
      Object.keys(classTimetable).forEach((periodKey) => {
        const entry = classTimetable[periodKey];
        if (entry.class === teacherName) {
          subjects.add(entry.subject);
          totalPeriods++;

          // Track which classes this subject is taught in
          if (!subjectClasses[entry.subject]) {
            subjectClasses[entry.subject] = new Set();
          }
          subjectClasses[entry.subject].add(className);
        }
      });
    });

    return {
      subjects: Array.from(subjects),
      classes: Array.from(classes),
      totalPeriods,
      subjectClasses: Object.fromEntries(
        Object.entries(subjectClasses).map(([subject, classSet]) => [
          subject,
          Array.from(classSet).sort(),
        ])
      ),
    };
  };

  const teacherData = getTeacherData();

  // Sample data for subjects with colors
  const subjectColors: { [key: string]: string } = {
    Mathematics: "bg-primary text-black text-blue-800",
    Physics: "bg-green-100 text-green-800",
    Chemistry: "bg-purple-100 text-purple-800",
    Biology: "bg-orange-100 text-orange-800",
    English: "bg-red-100 text-red-800",
    Hindi: "bg-yellow-100 text-yellow-800",
    Konkani: "bg-indigo-100 text-indigo-800",
    French: "bg-pink-100 text-pink-800",
    History: "bg-gray-100 text-gray-800",
    Geography: "bg-teal-100 text-teal-800",
    "Political Science": "bg-cyan-100 text-cyan-800",
    Math: "bg-primary text-black text-blue-800",
    Science: "bg-green-100 text-green-800",
  };

  const stats = {
    totalSubjects: teacherData.subjects.length,
    totalClasses: teacherData.classes.length,
    totalPeriods: teacherData.totalPeriods,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Teaching Overview
        </h3>
        <p className="text-gray-600">Michelle's Schedule</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalSubjects}
          </div>
          <div className="text-sm text-gray-600 mt-1">Subjects</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {stats.totalClasses}
          </div>
          <div className="text-sm text-gray-600 mt-1">Classes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Subjects Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-800">
              Subjects I Teach
            </h4>
          </div>
          <div className="space-y-3">
            {teacherData.subjects.length > 0 ? (
              teacherData.subjects.map((subject) => (
                <div
                  key={subject}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    subjectColors[subject] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="font-medium">{subject}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {teacherData.subjectClasses[subject]?.join(", ") ||
                      "No classes assigned"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">
                No subjects assigned yet
              </div>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-800">My Classes</h4>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-800 mb-1 text-sm">
                Grade 7B
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
