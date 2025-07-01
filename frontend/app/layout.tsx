import type { Metadata } from "next";
import "./globals.css";

import { Provider } from "react-redux";
import store from "../context/context";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "Class Timetable",
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
