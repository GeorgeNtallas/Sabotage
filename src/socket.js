import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://192.168.1.85:4000');
export default socket;