const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-app-name.onrender.com"] 
      : ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-app-name.onrender.com"] 
    : ["http://localhost:3000", "http://localhost:3001"]
}));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  app.get("/", (req, res) => res.send("Server running..."));
}

// Your existing socket.io code goes here (copy from src/Server/index.js)
// ... (all the rooms, socket handlers, etc.)

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});