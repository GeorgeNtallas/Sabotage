import { io } from "socket.io-client";

const socket = io(
  process.env.REACT_APP_SERVER_URL || "http://localhost:10000",
  {
    transports: ["websocket"], // helps with CORS
  }
);

export default socket;
