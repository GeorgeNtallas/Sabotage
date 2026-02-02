import { io } from "socket.io-client";
import { API_CONFIG, SOCKET_EVENTS } from "./constants";

const socket = io(API_CONFIG.SOCKET_URL, {
  transports: API_CONFIG.SOCKET_TRANSPORTS,
  auth: {
    roomSessionKey: sessionStorage.getItem("roomSessionKey"),
    playerSessionKey: sessionStorage.getItem("playerSessionKey"),
  },
});

export default socket;
export { SOCKET_EVENTS };
