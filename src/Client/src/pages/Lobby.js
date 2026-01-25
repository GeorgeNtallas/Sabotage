import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Settings from "../components/ui/Settings";

function Lobby() {
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const { t } = useTranslation();
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

  // Handle browser/tab close or back navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // best-effort notify server; browser may still close
      socket.emit("exit", { roomSessionKey, playerSessionKey });
      sessionStorage.removeItem("roomSessionKey");
      // show native confirmation (message ignored by modern browsers)
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      const leave = window.confirm(
        "Leave the room? This will remove you from the game.",
      );
      if (leave) {
        socket.emit("exit", { roomSessionKey, playerSessionKey });
        sessionStorage.removeItem("roomSessionKey");
        navigate("/", { replace: true });
      } else {
        // user cancelled — restore router location including state to prevent losing `location.state`
        navigate(location.pathname + location.search, {
          replace: true,
          state: location.state,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // ensure a history entry exists so popstate fires when back pressed
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [roomSessionKey, playerSessionKey]);

  useEffect(() => {
    socket.emit(
      "getRoomPlayers",
      { roomSessionKey },
      ({ roomPlayers, roomLeader, readyList }) => {
        setPlayers(roomPlayers);
        setLobbyLeaderId(roomLeader);
        setReadyPlayers(readyList);
      },
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
    socket.on("game_started", () => {
      navigate(`/game?${roomSessionKey}`, { state: { name } });
    });

    return () => {
      socket.off("game_started");
    };
  }, [name, navigate, playerSessionKey]);

  // If we rejoin an already-started game, server will emit character_assigned.
  // Cache it and navigate directly to Game to resume.
  useEffect(() => {
    const onRound = (payload) => {
      if (payload?.gameStarted) {
        navigate(`/game?${roomSessionKey}`, { state: { name } });
      }
    };
    socket.on("round_update", onRound);
    return () => socket.off("round_update", onRound);
  }, [navigate, roomSessionKey, name]);

  const handleReadyClick = () => {
    if (!readyPlayers.includes(playerSessionKey)) {
      socket.emit("player_pressReady", playerSessionKey, roomSessionKey);
    }
  };

  const handleExitClick = () => {
    socket.emit("exit", { roomSessionKey, playerSessionKey });
    sessionStorage.removeItem("roomSessionKey");
    navigate(`/`);
  };

  const canStart = readyPlayers.length >= 5;
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
          {t("lobby.welcome")} &nbsp;
          <span className="text-indigo-300">{name}</span>
        </h2>
        <p className="mb-5 text-xl font-extrabold text-center">
          {t("lobby.room")}: <span className="font-mono">{password}</span>
        </p>

        <div className="max-w-sm mx-auto px-4 text-black backdrop-blur-md border-white/20 rounded-2xl p-6 shadow-2xl w-80 text">
          <div className="w-full mb-4 p-3 rounded-md bg-white/10 border border-white/20 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
            <h3 className="font-semibold mb-2 text-lg">
              {t("lobby.players")}:
            </h3>
            <ul className="list-disc ml-5 text-sm">
              {players.map((player) => (
                <li key={player.playerSessionKey}>
                  {player.name}{" "}
                  {player.playerSessionKey === lobbyLeaderId &&
                    t("lobby.leader")}
                  {readyPlayers.includes(player.playerSessionKey) && (
                    <span className="text-green-600 ml-2">
                      ✓ {t("lobby.ready")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col text-center">
            {!(isLeader && readyPlayers.includes(playerSessionKey)) && (
              <div>
                <button
                  onClick={handleReadyClick}
                  disabled={readyPlayers.includes(playerSessionKey)}
                  className={`text-md px-10 py-3 mb-4 rounded-md font-bold transition ${
                    readyPlayers.includes(playerSessionKey)
                      ? "bg-red-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {readyPlayers.includes(playerSessionKey)
                    ? t("lobby.waiting")
                    : t("lobby.ready")}
                </button>
              </div>
            )}
            <div>
              <button
                onClick={handleExitClick}
                className={`px-6 py-3  bg-gradient-to-r bg-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition rounded-md font-bold`}
              >
                {t("lobby.exit")}
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
                      // TODO: Must be enabled when all players press ready
                      roomSessionKey,
                      selectedRoles: Array.from(selectedRoles),
                    });
                  }}
                >
                  {t("lobby.startGame")}
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
