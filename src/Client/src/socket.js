import { io } from "socket.io-client";

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"],
//   auth: {
//     roomSessionKey: sessionStorage.getItem("roomSessionKey"),
//     playerSessionKey: sessionStorage.getItem("playerSessionKey"),
//   },
// });

const socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:4000", {
  transports: ["websocket"],
  auth: (cb) => {
    cb({
      roomSessionKey: sessionStorage.getItem("roomSessionKey"),
      playerSessionKey: sessionStorage.getItem("playerSessionKey"),
    });
  },
});

export default socket;
