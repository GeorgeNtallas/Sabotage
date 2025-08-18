import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function Home() {
  const [name, setName] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();
  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }

    socket.emit(
      "create_room",
      name,
      ({ password, roomSessionKey, playerSessionKey, isLeader, error }) => {
        if (error) {
          alert(error);
          return;
        } else {
          sessionStorage.setItem("roomSessionKey", roomSessionKey);
          sessionStorage.setItem("playerSessionKey", playerSessionKey);
        }

        navigate(`/lobby?${roomSessionKey}`, {
          state: { name, isLeader, password },
        });
      }
    );
  };

  const handleJoin = () => {
    socket.emit(
      "join_room",
      { name: name, password: password },
      ({ roomSessionKey, playerSessionKey, isLeader, error }) => {
        if (error) {
          alert(error);
          return;
        }
        sessionStorage.setItem("roomSessionKey", roomSessionKey);
        sessionStorage.setItem("playerSessionKey", playerSessionKey);
        navigate(`/lobby?${roomSessionKey}`, {
          state: { name, isLeader, password },
        });
      }
    );
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
        <div className="flex justify-center">
          <img
            src="/images/Sabotage3.png"
            alt="Leader"
            className="w-[45%] mb-2"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

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
            value={password}
            onChange={(e) => setpassword(e.target.value)}
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
