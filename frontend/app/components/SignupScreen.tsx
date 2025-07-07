"use client";
import { LogIn, CircleUser, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TimetableHeader from "./Header";
import { subjectList, subjectToDisplayName } from "@/subjects";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentSubject, setCurrentSubject] = useState({
    classNo: 0,
    div: "",
    subject: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teacherNumber.trim()) {
      setError("Please enter your username");
      return;
    }

    // Simulate login process
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check for admin login
      if (teacherNumber.toLowerCase() === "admin") {
        router.push("/timetable");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TimetableHeader loggedIn={false} />
      {/* Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-[#F0AF917F] rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Teacher Signup</h2>
            <p className="text-gray-600 mt-2">
              Enter your username to access your timetable
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                autoComplete="off"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <label
                htmlFor="teacherNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="teacherNumber"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                autoComplete="off"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                autoComplete="off"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                    value={currentSubject.subject}
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
                      setCurrentSubject((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }));
                    }}
                  >
                    <option value="">Subject</option>

                    {subjectList.map((subject) => (
                      <option value={subject}>
                        {subjectToDisplayName[subject] &&
                        subjectToDisplayName[subject].length <= 10
                          ? subjectToDisplayName[subject]
                          : subject}
                      </option>
                    ))}
                  </select>
                  {/* {} */}
                  <input
                    type="number"
                    id="teacherName"
                    value={currentSubject.classNo ?? 0}
                    onChange={(e) => {
                      // setCurrentSubject((prev) => ({
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
                      setCurrentSubject((prev) => ({
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
                    value={currentSubject.div}
                    onChange={(e) => {
                      setCurrentSubject((prev) => ({
                        ...prev,
                        div: e.target.value,
                      }));
                      // setCurrentSubject((prev) => ({
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
                      const sub = JSON.parse(JSON.stringify(currentSubject));
                      //   setCurrentSubject((prev) => ({
                      //     teacherName: prev.teacherName,
                      //     subject: "",
                      //     div: "",
                      //     classNo: null,
                      //   }));

                      setSubjects((prev) => [...prev, sub]);
                    }}
                    className="px-2 h-[45px] ml-5 text-sm font-medium  bg-[lightgrey] text-black hover:bg-[darkgrey] text-black rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="" />
                  </button>
                </div>
              </div>
              <ul>
                {subjects.map((sub) => (
                  <li>
                    {sub.subject} {sub.classNo}
                    {sub.div}
                  </li>
                ))}
              </ul>
              {/* Subject Input */}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary-700 text-primary font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign up</span>
                </>
              )}
            </button>
          </form>

          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact your school administrator
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Admin access: Use "admin" as teacher number
            </p>
          </div> */}
        </div>
        <div className="mt-8">
          <div>
            <button
              className="px-4 py-2 bg-primary text-black hover:bg-primary text-black  text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              onClick={() => router.push("/about-the-dev")}
            >
              <CircleUser className="w-4 h-4" />
              About the developer
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            © 2025 Atharv Nadkarni. All rights reserved.{" "}
            <Link
              style={{ color: "red", textDecoration: "underline" }}
              href="/t-and-c"
            >
              <span className="bg-red">Terms & Conditions</span>
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
export default SignupScreen;
