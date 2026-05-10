import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/context/providers/Providers";
import AttendanceAlert from "./components/AttendanceAlert";
import { useAppSelector } from "@/context/contextHooks";
import { setTeachersList } from "@/context/teacherSlice";
import { useEffect } from "react";
import Init from "./init";

export const metadata: Metadata = {
  title: "Schedulr Timetable Manager",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={null}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Init />
          {children}
        </Providers>
      </body>
    </html>
  );
}
