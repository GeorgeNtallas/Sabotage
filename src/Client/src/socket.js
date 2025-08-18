import { io } from "socket.io-client";

// Use environment variable first, fallback only for local dev
const socket = io(
  process.env.REACT_APP_SERVER_URL || "http://localhost:10000",
  {
    transports: ["websocket"], // ensures WS is used
    withCredentials: true,
  }
);

export default socket;
