import { io } from "socket.io-client";

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
//   auth: {
//     roomSessionKey: sessionStorage.getItem("roomSessionKey"),
//     playerSessionKey: sessionStorage.getItem("playerSessionKey"),
//   },
// });

// Use environment variable first, fallback only for local dev
const socket = io("https://sabotage.onrender.com", {
  transports: ["websocket"], // helps avoid CORS issues
  auth: {
    roomSessionKey: sessionStorage.getItem("roomSessionKey"),
    playerSessionKey: sessionStorage.getItem("playerSessionKey"),
  },
});

export default socket;
