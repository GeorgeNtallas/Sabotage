import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
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
    const isAuto = urlParams.get('auto');
    
    // Join room
    socket.emit("join-room", { name, roomId, sessionKey });

    // Identify this player
    socket.on("your_id", (id) => {
      setPlayerId(id);
    });

    // Update ready players list
    socket.on("ready_update", (readyList) => {
      setReadyPlayers(readyList);
      
      // Auto-start game when all ready (Alice only)
      const urlParams = new URLSearchParams(window.location.search);
      const playerName = urlParams.get('player');
      const isAuto = urlParams.get('auto');
      
      if (isAuto && playerName === 'Alice' && readyList.length === players.length && players.length >= 6) {
        setTimeout(() => {
          socket.emit("start_game", { roomId, selectedRoles: Array.from(selectedRoles) });
        }, 3000);
      }
    });

    // Update player list
    socket.on("password_update", ({ players, lobbyLeaderId }) => {
      setPlayers(players);
      setLobbyLeaderId(lobbyLeaderId);
      
      // Auto-ready after joining
      const urlParams = new URLSearchParams(window.location.search);
      const isAuto = urlParams.get('auto');
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-4">
        Welcome &nbsp;
        <span className="text-indigo-300">{name}</span>
      </h2>
      <p className="mb-2 text-xl">
        Room: <span className="font-mono">{roomId}</span>
      </p>

      <div className="bg-white text-black rounded-lg p-4 shadow-md w-64 mb-4">
        <h3 className="font-semibold mb-2">Players:</h3>
        <ul className="list-disc ml-5">
          {players.map((player) => (
            <li key={player.socketId}>
              {player.name} {player.socketId === lobbyLeaderId && "(Leader)"}
              {readyPlayers.includes(player.socketId) && (
                <span className="text-green-600 ml-2">✓ Ready</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleReadyClick}
        disabled={readyPlayers.includes(playerId)}
        className={`px-4 py-2 rounded font-semibold transition ${
          readyPlayers.includes(playerId)
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {readyPlayers.includes(playerId) ? "Waiting..." : "Ready"}
      </button>

      <button
        onClick={handleExitClick}
        className={`px-4 py-2 rounded font-semibold`}
      >
        Exit
      </button>

      <div>
        {isLeader && (
          <button
            className={`mt-4 px-4 py-2 rounded ${
              canStart
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 cursor-not-allowed"
            } text-white font-semibold`}
            disabled={!canStart}
            onClick={() => {
              socket.emit("start_game", { roomId, selectedRoles: Array.from(selectedRoles) });
            }}
          >
            Start Game
          </button>
        )}
      </div>
      <Settings
        isLeader={isLeader}
        readyPlayers={readyPlayers}
        selectedRoles={selectedRoles}
        toggleRole={toggleRole}
      />
    </div>
  );
}

export default Lobby;
