import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import Settings from "../components/ui/Settings";

function Lobby() {
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  // Loc, roomId
  const location = useLocation();
  const { name, isLeader, password } = location.state || {};

  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  const roomSessionKey = sessionStorage.getItem("roomSessionKey");

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      newSet.has(role) ? newSet.delete(role) : newSet.add(role);
      return newSet;
    });
  };

  useEffect(() => {
    socket.emit(
      "getRoomPlayers",
      { roomSessionKey },
      ({ roomPlayers, roomLeader }) => {
        setPlayers(roomPlayers);
        setLobbyLeaderId(roomLeader);
      }
    );
  }, [roomSessionKey, players]);

  useEffect(() => {
    // Update ready players list
    socket.on("ready_update", (readyList) => {
      setReadyPlayers(readyList);
      setTimeout(() => {
        socket.emit("start_game", {
          roomSessionKey,
          selectedRoles: Array.from(selectedRoles),
        });
      }, 2000);
    });
    return () => {
      socket.off("ready_update");
    };
  }, [roomSessionKey, selectedRoles]);

  useEffect(() => {
    // Update player list
    socket.on("password_update", ({ roomPlayers, roomLeader }) => {
      setPlayers(roomPlayers);
      setLobbyLeaderId(roomLeader);

      if (!readyPlayers.includes(playerSessionKey)) {
        setTimeout(() => {
          socket.emit("player_ready", playerSessionKey, roomSessionKey);
        }, 2000);
      }
    });

    return () => {
      socket.off("password_update");
    };
  }, [name, navigate, playerSessionKey, readyPlayers, roomSessionKey]);

  useEffect(() => {
    // Update ready status
    socket.on("player_informReady", (playerSessionKey) => {
      setReadyPlayers((prev) => [...new Set([...prev, playerSessionKey])]);
    });

    return () => {
      socket.off("player_ready");
    };
  }, [name, playerSessionKey, readyPlayers, roomSessionKey, selectedRoles]);

  useEffect(() => {
    socket.on("game_started", () => {
      navigate("/game", { state: { name } });
    });

    return () => {
      socket.off("game_started");
    };
  }, [name, navigate, playerSessionKey]);

  const handleReadyClick = () => {
    if (!readyPlayers.includes(playerSessionKey)) {
      socket.emit("player_pressReady", playerSessionKey, roomSessionKey);
    }
  };

  const handleExitClick = () => {
    socket.emit("exit", { roomSessionKey, playerSessionKey });
    sessionStorage.removeItem("playerSessionKey");
    if (players.length === 1) sessionStorage.removeItem("roomSessionKey");
    navigate(`/`);
  };

  const canStart = readyPlayers.length >= 1;
  // --------------------------------------
  // 👇 Lobby UI
  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen bg-gray-900 text-white"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="bg-white/1 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 w-full max-w-sm text-white">
        <h2 className="text-3xl font-extrabold text-center mb-8">
          Welcome &nbsp;
          <span className="text-indigo-300">{name}</span>
        </h2>
        <p className="mb-5 text-xl font-extrabold text-center">
          Room: <span className="font-mono">{password}</span>
        </p>

        <div className="max-w-sm mx-auto px-4 text-black backdrop-blur-md border-white/20 rounded-2xl p-6 shadow-2xl w-80 text">
          <div className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/20 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
            <h3 className="font-semibold mb-2 text-lg">Players:</h3>
            <ul className="list-disc ml-5 text-sm">
              {players.map((player) => (
                <li key={player.playerSessionKey}>
                  {player.name}{" "}
                  {player.playerSessionKey === lobbyLeaderId && "(Leader)"}
                  {readyPlayers.includes(player.playerSessionKey) && (
                    <span className="text-green-600 ml-2">✓ Ready</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col text-center">
            <div>
              <button
                onClick={handleReadyClick}
                disabled={readyPlayers.includes(playerSessionKey)}
                className={`text-md px-10 py-3 mb-4 bg-red-500 hover:bg-red-600 rounded-md font-bold transition ${
                  readyPlayers.includes(playerSessionKey)
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {readyPlayers.includes(playerSessionKey)
                  ? "Waiting..."
                  : "Ready"}
              </button>
            </div>
            <div>
              <button
                onClick={handleExitClick}
                className={`px-6 py-3  bg-gradient-to-r bg-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition rounded-md font-bold`}
              >
                Exit
              </button>
            </div>
            <div>
              {isLeader && (
                <button
                  className={`mt-4 px-6 py-3 rounded-md ${
                    canStart
                      ? "bg-gradient-to-r bg-green-600 to-green-700 hover:bg-green-700 transition"
                      : "bg-green-500/10 backdrop-blur-md border-green-400/20 cursor-not-allowed"
                  } text-black font-semibold`}
                  disabled={!canStart}
                  onClick={() => {
                    socket.emit("start_game", {
                      roomSessionKey,
                      selectedRoles: Array.from(selectedRoles),
                    });
                  }}
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
          <Settings
            isLeader={isLeader}
            readyPlayers={readyPlayers}
            selectedRoles={selectedRoles}
            toggleRole={toggleRole}
          />
        </div>
      </div>
    </div>
  );
}

export default Lobby;
