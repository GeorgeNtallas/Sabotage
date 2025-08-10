import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import Settings from "../components/Settings";

function Lobby() {
  const location = useLocation();
  const { name, roomId, sessionKey } = location.state || {};
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      newSet.has(role) ? newSet.delete(role) : newSet.add(role);
      return newSet;
    });
  };

  useEffect(() => {
    // Auto-ready for automation
    const urlParams = new URLSearchParams(window.location.search);
    const isAuto = urlParams.get("auto");

    // Join room
    socket.emit("join_room", { name, roomId, sessionKey });

    // Identify this player
    socket.on("your_id", (id) => {
      setPlayerId(id);
    });

    // Update ready players list
    socket.on("ready_update", (readyList) => {
      setReadyPlayers(readyList);

      // Auto-start game when all ready (Alice only)
      const urlParams = new URLSearchParams(window.location.search);
      const playerName = urlParams.get("player");
      const isAuto = urlParams.get("auto");

      if (
        isAuto &&
        playerName === "Alice" &&
        readyList.length === players.length &&
        players.length >= 6
      ) {
        alert(Array.from(selectedRoles));
        setTimeout(() => {
          socket.emit("start_game", {
            roomId,
            selectedRoles: Array.from(selectedRoles),
          });
        }, 2000);
      }
    });

    // Update player list
    socket.on("password_update", ({ players, lobbyLeaderId }) => {
      setPlayers(players);
      setLobbyLeaderId(lobbyLeaderId);

      // Auto-ready after joining
      const urlParams = new URLSearchParams(window.location.search);
      const isAuto = urlParams.get("auto");
      if (isAuto && !readyPlayers.includes(playerId)) {
        setTimeout(() => {
          socket.emit("player_ready", playerId);
        }, 2000);
      }
    });

    socket.on("room_update", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Update ready status
    socket.on("player_ready", (id) => {
      setReadyPlayers((prev) => [...new Set([...prev, id])]);
    });

    return () => {
      socket.off("your_id");
      socket.off("password_update");
      socket.off("player_ready");
      socket.off("ready_update");
      socket.off("room_update");
    };
  }, [name, roomId, sessionKey]);

  useEffect(() => {
    socket.on("game_started", () => {
      navigate("/game", { state: { name, roomId, playerId } });
    });

    return () => {
      socket.off("game_started");
    };
  }, [navigate, name, roomId, playerId]);

  const handleReadyClick = () => {
    if (!readyPlayers.includes(playerId)) {
      socket.emit("player_ready", playerId);
    }
  };

  const handleExitClick = () => {
    socket.emit("exit", { roomId });
    navigate(`/`);
  };

  const isLeader = playerId === lobbyLeaderId;
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
          Room: <span className="font-mono">{roomId}</span>
        </p>

        <div className="max-w-sm mx-auto px-4 text-black backdrop-blur-md border-white/20 rounded-2xl p-6 shadow-2xl w-80 text">
          <div className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/20 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
            <h3 className="font-semibold mb-2 text-lg">Players:</h3>
            <ul className="list-disc ml-5 text-sm">
              {players.map((player) => (
                <li key={player.socketId}>
                  {player.name}{" "}
                  {player.socketId === lobbyLeaderId && "(Leader)"}
                  {readyPlayers.includes(player.socketId) && (
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
                disabled={readyPlayers.includes(playerId)}
                className={`text-md px-10 py-3 mb-4 bg-red-500 hover:bg-red-600 rounded-md font-bold transition ${
                  readyPlayers.includes(playerId)
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {readyPlayers.includes(playerId) ? "Waiting..." : "Ready"}
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
                      roomId,
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
