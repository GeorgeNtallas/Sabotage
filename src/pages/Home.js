import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  
  // Auto-play functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    const isAuto = urlParams.get('auto');
    
    if (playerName && isAuto) {
      setName(playerName);
      
      if (playerName === 'Alice') {
        // Alice creates game after 2 seconds
        setTimeout(() => {
          handleCreate();
        }, 2000);
      } else {
        // Other players wait for room ID and join
        const checkForRoom = setInterval(() => {
          const storedRoomId = localStorage.getItem('avalon-room-id');
          if (storedRoomId) {
            clearInterval(checkForRoom);
            setRoomId(storedRoomId);
            setTimeout(() => {
              handleJoin();
            }, 1000);
          }
        }, 1000);
      }
    }
  }, []);

  const handleCreate = () => {
    // Clean up all existing listeners
    socket.off("room-created");
    socket.off("room-joined");
    socket.off("join-error");
    socket.off("room-exists");
    socket.off("check-room");

    if (!name) {
      alert("Please enter your name");
      return;
    }

    socket.emit("create-room");

    socket.on("room-created", (createdRoomId) => {
      setRoomId(createdRoomId);
      // Join the created room
      socket.emit("join-room", { name, roomId: createdRoomId });

      socket.on("room-joined", ({ sessionKey }) => {
        sessionStorage.setItem("sessionKey", sessionKey);
        navigate(`/lobby?session=${createdRoomId}`, {
          state: { name, roomId: createdRoomId, sessionKey },
        });
      });
    });
  };

  const handleJoin = () => {
    const sessionKey = sessionStorage.getItem("sessionKey");

    if (!name) {
      alert("Please enter your name");
      return;
    }
    // Clean up all existing listeners
    socket.off("room-created");
    socket.off("room-joined");
    socket.off("join-error");
    socket.off("room-exists");
    socket.off("check-room");

    socket.emit("check-room", roomId);
    socket.on("room-exists", (exist) => {
      if (!exist) {
        return;
      } else {
        socket.emit("join-room", { name, roomId, sessionKey });
      }
    });

    socket.on("room-joined", ({ sessionKey }) => {
      sessionStorage.setItem("sessionKey", sessionKey);
      navigate(`/lobby?session=${roomId}`, {
        state: { name, roomId, sessionKey },
      });
    });

    socket.on("join-error", ({ message }) => {
      alert(message);
      return;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
      <h1 className="text-4xl font-bold mb-8">Avalon</h1>

      <div className="bg-white text-black rounded-xl p-6 shadow-lg w-80">
        <input
          type="text"
          placeholder="Your name"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded"
          style={{ marginTop: "10px" }}
        >
          Join Game
        </button>

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded"
          style={{ marginTop: "50px" }}
        >
          Create Game
        </button>
      </div>
    </div>
  );
}

export default Home;
