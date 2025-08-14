"use client";

import { useState, useEffect } from "react";

interface Period {
  name: string;
  time: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface TimetableEntry {
  subject: string;
  class: string;
}

export default function CurrentPeriodBanner({ classTimetables }) {
  // Using the demo time of 9:45 AM on Tuesday
  const demoTime = new Date(); // Tuesday
  const currentDay = demoTime.toLocaleDateString("en-IN", { weekday: "long" });

  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [currentSubject, setCurrentSubject] = useState<TimetableEntry | null>(
    null
  );
  const [isBreak, setIsBreak] = useState(false);

  // Sample timetable data - what's being taught when
  const timetableData: { [key: string]: TimetableEntry } = {
    "Monday-1": { subject: "Mathematics", class: "9A" },
    "Monday-2": { subject: "Physics", class: "10B" },
    "Monday-3": { subject: "Chemistry", class: "11A" },
    "Monday-4": { subject: "Biology", class: "12A" },
    "Tuesday-1": { subject: "Physics", class: "9C" },
    "Tuesday-2": { subject: "Mathematics", class: "10A" },
    "Tuesday-3": { subject: "Chemistry", class: "11B" },
    "Tuesday-4": { subject: "English", class: "7A" }, // This is the current period at 9:45
    "Tuesday-5": { subject: "Biology", class: "12B" },
    "Wednesday-1": { subject: "Mathematics", class: "9A" },
    "Wednesday-2": { subject: "Physics", class: "10A" },
    // Add more as needed...
  };

  const periods: Period[] = [
    {
      name: "1",
      time: "8:30-9:20",
      startHour: 8,
      startMinute: 30,
      endHour: 9,
      endMinute: 20,
    },
    {
      name: "2",
      time: "9:20-10:10",
      startHour: 9,
      startMinute: 20,
      endHour: 10,
      endMinute: 10,
    },
    {
      name: "3",
      time: "10:10-11:00",
      startHour: 10,
      startMinute: 10,
      endHour: 11,
      endMinute: 0,
    },
    {
      name: "Break",
      time: "11:00-11:20",
      startHour: 11,
      startMinute: 0,
      endHour: 11,
      endMinute: 20,
    },
    {
      name: "4",
      time: "11:20-12:10",
      startHour: 11,
      startMinute: 20,
      endHour: 12,
      endMinute: 10,
    },
    {
      name: "5",
      time: "12:10-1:00",
      startHour: 12,
      startMinute: 10,
      endHour: 13,
      endMinute: 0,
    },
  ];

  useEffect(() => {
    // Find current period based on demo time
    const hour = demoTime.getHours();
    const minute = demoTime.getMinutes();

    const currentPeriod =
      periods.find((period) => {
        const isAfterStart =
          hour > period.startHour ||
          (hour === period.startHour && minute >= period.startMinute);
        const isBeforeEnd =
          hour < period.endHour ||
          (hour === period.endHour && minute < period.endMinute);
        return isAfterStart && isBeforeEnd;
      }) || null;

    setCurrentPeriod(currentPeriod);
    setIsBreak(currentPeriod?.name === "Break");

    // Get the subject for current period
    if (currentPeriod && currentPeriod.name !== "Break") {
      const timetableKey = `${demoTime.getDay()}-${currentPeriod.name}`;
      const subject = classTimetables[timetableKey] || null;
      setCurrentSubject(subject);
    } else {
      setCurrentSubject(null);
    }
  }, [currentDay]);

  if (!currentPeriod) {
    return (
      <div className="bg-gray-300 border-y border-gray-200 rounded-md">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-gray-600">No active period</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isBreak ? "bg-blue-50 border-blue-100" : "bg-green-200 border-green-100"
      } border-y`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isBreak ? "bg-primary text-black" : "bg-green-500"
            } animate-pulse`}
          ></div>
          <p
            className={`font-medium ${
              isBreak ? "text-blue-800" : "text-green-800"
            }`}
          >
            {isBreak ? (
              "Break Time"
            ) : currentSubject ? (
              <>{currentSubject}</>
            ) : (
              `Period ${currentPeriod.name}`
            )}
            <span
              className={`ml-2 ${isBreak ? "text-blue-600" : "text-green-600"}`}
            >
              ({currentPeriod.time})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
