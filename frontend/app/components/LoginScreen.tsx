"use client";

import type React from "react";

import { useState } from "react";
import { Book, CircleUser, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import TimetableHeader from "./Header";
import Link from "next/link";

export default function LoginScreen() {
  const [teacherNumber, setTeacherNumber] = useState("");
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
      {/* Header */}
      {/* <header className="bg-gradient-to-r from-blue-600 to-blue-700  shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Book className="h-6 w-6 " />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Weekly Timetable</h1>
          </div>
        </div>
      </header> */}
      <TimetableHeader loggedIn={false} />
      {/* Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-[#F0AF917F] rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Teacher Login</h2>
            <p className="text-gray-600 mt-2">
              Enter your username to access your timetable
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={teacherNumber}
                onChange={(e) => setTeacherNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                autoComplete="off"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
                  <span>Log in</span>
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
}
