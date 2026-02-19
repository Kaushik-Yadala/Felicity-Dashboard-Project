// lib/socket.ts
import { io } from "socket.io-client";

// autoConnect: false is best practice so you have control over when it starts
export const socket = io("http://localhost:9999", {
  autoConnect: false,
});