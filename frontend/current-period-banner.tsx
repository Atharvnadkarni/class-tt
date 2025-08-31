"use client";

import { useState, useEffect } from "react";

interface Period {
  name: string;
  time: string;
  startHour?: number;
  startMinute?: number;
  endHour?: number;
  endMinute?: number;
}

interface TimetableEntry {
  subject: string;
  class: string;
}

interface CurrentPeriodBannerProps {
  classTimetables?: { [key: string]: TimetableEntry };
  selectedClass?: string;
}

export default function CurrentPeriodBanner({
  classTimetables = {},
  selectedClass = "1A",
}: CurrentPeriodBannerProps) {
  // Using the demo time of 9:45 AM on Tuesday
  const demoTime = new Date(); // Tuesday
  const currentDay = demoTime.toLocaleDateString("en-IN", { weekday: "long" });

  // Use classSplit logic from weekly-timetable
  const classSplit = [
    parseInt(selectedClass.slice(0, -1)),
    selectedClass.slice(-1),
  ];

  // Periods for classes 1-4
  const periods1to4: Period[] = [
    {
      name: "1",
      time: "7:35-8:15",
      startHour: 7,
      startMinute: 35,
      endHour: 8,
      endMinute: 15,
    },
    {
      name: "2",
      time: "8:15-8:55",
      startHour: 8,
      startMinute: 15,
      endHour: 8,
      endMinute: 55,
    },
    {
      name: "3",
      time: "8:55-9:35",
      startHour: 8,
      startMinute: 55,
      endHour: 9,
      endMinute: 35,
    },
    {
      name: "4",
      time: "9:35-10:10",
      startHour: 9,
      startMinute: 35,
      endHour: 10,
      endMinute: 10,
    },
    {
      name: "Break",
      time: "10:10-10:30",
      startHour: 10,
      startMinute: 10,
      endHour: 10,
      endMinute: 30,
    },
    {
      name: "5",
      time: "10:30-11:05",
      startHour: 10,
      startMinute: 30,
      endHour: 11,
      endMinute: 5,
    },
    {
      name: "6",
      time: "11:05-11:45",
      startHour: 11,
      startMinute: 5,
      endHour: 11,
      endMinute: 45,
    },
    {
      name: "7",
      time: "11:45-12:25",
      startHour: 11,
      startMinute: 45,
      endHour: 12,
      endMinute: 25,
    },
    {
      name: "8",
      time: "12:25-1:05",
      startHour: 12,
      startMinute: 25,
      endHour: 13,
      endMinute: 5,
    },
    {
      name: "9",
      time: "1:05-1:30",
      startHour: 13,
      startMinute: 5,
      endHour: 13,
      endMinute: 30,
    },
  ];
  // Periods for classes 5-10
  const periods5to10: Period[] = [
    {
      name: "1",
      time: "7:35-8:15",
      startHour: 7,
      startMinute: 35,
      endHour: 8,
      endMinute: 15,
    },
    {
      name: "2",
      time: "8:15-8:55",
      startHour: 8,
      startMinute: 15,
      endHour: 8,
      endMinute: 55,
    },
    {
      name: "3",
      time: "8:55-9:35",
      startHour: 8,
      startMinute: 55,
      endHour: 9,
      endMinute: 35,
    },
    {
      name: "4",
      time: "9:35-10:10",
      startHour: 9,
      startMinute: 35,
      endHour: 10,
      endMinute: 10,
    },
    {
      name: "5",
      time: "10:10-10:45",
      startHour: 10,
      startMinute: 10,
      endHour: 10,
      endMinute: 45,
    },
    {
      name: "Break",
      time: "10:45-11:05",
      startHour: 10,
      startMinute: 45,
      endHour: 11,
      endMinute: 5,
    },
    {
      name: "6",
      time: "11:05-11:45",
      startHour: 11,
      startMinute: 5,
      endHour: 11,
      endMinute: 45,
    },
    {
      name: "7",
      time: "11:45-12:25",
      startHour: 11,
      startMinute: 45,
      endHour: 12,
      endMinute: 25,
    },
    {
      name: "8",
      time: "12:25-1:05",
      startHour: 12,
      startMinute: 25,
      endHour: 13,
      endMinute: 5,
    },
    {
      name: "9",
      time: "1:05-1:30",
      startHour: 13,
      startMinute: 5,
      endHour: 13,
      endMinute: 30,
    },
  ];
  // Use correct periods array
  const periods: Period[] =
    Number(classSplit[0]) < 5 ? periods1to4 : periods5to10;

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

  useEffect(() => {
    // Find current period based on demo time
    const hour = demoTime.getHours();
    const minute = demoTime.getMinutes();

    if (demoTime.getDay() == 0) setCurrentPeriod(null);
    if (Number(classSplit[0]) < 6 && demoTime.getDay() == 6)
      setCurrentPeriod(null);

    const currentPeriod =
      periods.find((period) => {
        if (period.name === "Break") {
          return (
            (hour > (period.startHour ?? 0) ||
              (hour === (period.startHour ?? 0) &&
                minute >= (period.startMinute ?? 0))) &&
            (hour < (period.endHour ?? 0) ||
              (hour === (period.endHour ?? 0) &&
                minute < (period.endMinute ?? 0)))
          );
        }
        return (
          (hour > (period.startHour ?? 0) ||
            (hour === (period.startHour ?? 0) &&
              minute >= (period.startMinute ?? 0))) &&
          (hour < (period.endHour ?? 0) ||
            (hour === (period.endHour ?? 0) &&
              minute < (period.endMinute ?? 0)))
        );
      }) || null;

    setCurrentPeriod(currentPeriod);
    setIsBreak(currentPeriod?.name === "Break");

    // Get the subject for current period
    if (currentPeriod && currentPeriod.name !== "Break") {
      const timetableKey = `${currentDay}-${currentPeriod.name}`;
      const subject = classTimetables
        ? (classTimetables as { [key: string]: TimetableEntry })[timetableKey]
        : null;
      setCurrentSubject(subject);
    } else {
      setCurrentSubject(null);
    }
  }, [currentDay, classTimetables]);

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
