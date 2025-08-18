import { io } from "socket.io-client";

// Use environment variable first, fallback only for local dev
const socket = io("https://sabotage.onrender.com", {
  transports: ["websocket"], // helps avoid CORS issues
});

export default socket;
