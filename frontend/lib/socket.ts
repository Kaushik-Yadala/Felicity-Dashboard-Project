// lib/socket.ts
import { io } from "socket.io-client";

// autoConnect: false is best practice so you have control over when it starts
export const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999", {
  autoConnect: false,
});