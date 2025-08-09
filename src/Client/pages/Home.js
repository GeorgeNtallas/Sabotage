import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();
  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };

  // Auto-play functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get("player");
    const isAuto = urlParams.get("auto");

    if (playerName && isAuto) {
      setName(playerName);

      if (playerName === "Alice") {
        // Alice creates game after 2 seconds
        setTimeout(() => {
          handleCreate();
        }, 2000);
      } else {
        // Other players wait for room ID and join
        const checkForRoom = setInterval(() => {
          const storedRoomId = localStorage.getItem("avalon-room-id");
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
    socket.off("room_joined");
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
      socket.emit("join_room", { name, roomId: createdRoomId });

      socket.on("room_joined", ({ sessionKey }) => {
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
    socket.off("room_joined");
    socket.off("join-error");
    socket.off("room-exists");
    socket.off("check-room");

    socket.emit("check-room", roomId);
    socket.on("room-exists", (exist) => {
      if (!exist) {
        return;
      } else {
        socket.emit("join_room", { name, roomId, sessionKey });
      }
    });

    socket.on("room_joined", ({ sessionKey }) => {
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
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center "
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="bg-white/1 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 w-full max-w-sm text-white">
        <h1
          className="text-4xl font-extrabold text-center mb-8"
          style={medievalFontStyle}
        >
          Sabotage
        </h1>

        <div className="max-w-sm mx-auto px-4 text-black backdrop-blur-md border-white/20 rounded-2xl p-6 shadow-2xl w-80">
          <input
            type="text"
            placeholder="Your name"
            className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={medievalFontStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Password"
            className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={medievalFontStyle}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="w-full py-3 mb-4 bg-red-500 hover:bg-red-600 transition rounded-md font-bold"
            style={{
              marginTop: "10px",
              fontFamily: "MedievalSharp",
              fontWeight: 1000,
            }}
          >
            Join Game
          </button>

          <button
            onClick={handleCreate}
            className="w-full py-3 bg-gradient-to-r bg-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition rounded-md font-bold"
            style={{
              marginTop: "50px",
              fontFamily: "MedievalSharp",
              fontWeight: 1000,
            }}
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
