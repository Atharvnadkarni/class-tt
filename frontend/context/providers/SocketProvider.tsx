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
    const onConnect = () => {
        console.log("[Socket] connected");
    };

    const onAnyEvent = (event: string, ...args: any[]) => {
        console.log(`[Socket] event: ${event}`, ...args);
    };

    socket.on("connect", onConnect);
    socket.onAny(onAnyEvent);

    return () => {
        socket.off("connect", onConnect);
        socket.offAny(onAnyEvent);
    };
}, []);

  return <>{children}</>; // render children normally
}
