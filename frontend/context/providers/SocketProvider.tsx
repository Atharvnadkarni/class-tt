// components/SocketProvider.tsx
"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("CONNECTED");
    });
  }, []);

  return <>{children}</>; // render children normally
}
