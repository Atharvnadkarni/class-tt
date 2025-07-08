"use client";

import { useState, useRef, useEffect } from "react";
import { Book, User, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function TimetableHeader() {
  const [currentTime] = useState(new Date(2024, 0, 1, 9, 45, 0)); // Demo time: 9:45 AM
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const isSchoolDay = (date: Date) => {
    const day = date.getDay();
    // Monday = 1, Tuesday = 2, ..., Saturday = 6, Sunday = 0
    return day >= 1 && day <= 6;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    window.location.href = "/login";
  };

  const today = new Date();
  const dayName = getDayName(today);
  const showTodayIndicator = isSchoolDay(today);
  const user = useSelector(state => state.user);

  return (
    <header className="bg-[#F0AF91]  shadow-lg relative">
      <div className="container mx-0 px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* App Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Book className="h-6 w-6 text-black" />
            </div>
            {!user ? (
              <Link href="/login">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                  Schedulr{" "}
                  <span className="text-md sm:text-lg font-bold tracking-tight text-black">
                    Vidya Vikas Academy
                  </span>
                </h1>
              </Link>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                Schedulr{" "}
                <span className="text-md sm:text-lg font-bold tracking-tight text-black">
                  Class Time Table
                </span>
              </h1>
            )}
          </div>

          {/* Teacher Greeting with Menu */}
          {user && (
            <div
              className="absolute top-1/2 right-4 transform -translate-y-1/2"
              ref={menuRef}
            >
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-1 text-sm font-medium  transition-colors focus:outline-none"
              >
                <span>Hello, Michelle</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      Michelle Mascarenhas
                    </p>
                    <p className="text-xs text-gray-500">Teacher ID: 24</p>
                  </div>

                  <div className=" border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
