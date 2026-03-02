import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import socket from "../socket";
import EnterPlayersModal from "../components/ui/EnterPlayersModal";
import Settings from "../components/ui/Settings";

function OneDeviceLobby() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { name, isLeader, newRoomName } = location.state || {};

  const [players, setPlayers] = useState([
    name,
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
  ]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [fadeOut, setFadeOut] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);

  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  const roomSessionKey = sessionStorage.getItem("roomSessionKey");
  const isCurrentLeader = lobbyLeaderId === playerSessionKey;
  const canStart = players.length >= 1;

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
      const leave = window.confirm(t("oneDevice.leaveRoomConfirm"));
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
    socket.on(
      "game_started_one_device",
      ({ characters, players, missionTeamSizes, roleBalance }) => {
        setFadeOut(true);
        setTimeout(() => {
          navigate(`/onedevicegame?${roomSessionKey}`, {
            state: {
              characters,
              players,
              missionteamSizes: missionTeamSizes,
              roleBalance,
              name,
              isLeader,
              newRoomName,
            },
          });
        }, 800);
      },
    );

    return () => {
      socket.off("game_started_one_device");
    };
  }, [name, navigate, playerSessionKey, roomSessionKey]);

  const handleExitClick = () => {
    socket.emit("exit", { roomSessionKey, playerSessionKey });
    sessionStorage.removeItem("roomSessionKey");
    navigate(`/`);
  };

  const handleStartGame = () => {
    socket.emit("start_game_one_device", {
      roomSessionKey,
      selectedRoles: Array.from(selectedRoles),
      players,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
      }}
    >
      <div className="absolute inset-0 bg-black/80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-purple-950/20"></div>

      <div className="relative z-10 bg-black/95 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] p-8 w-[90%] max-w-md text-white">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

        <div className="flex justify-center mb-6">
          <img
            src="/images/Sabotage3.png"
            alt="Logo"
            className="w-[60%] drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6"></div>

        <h2
          className="text-2xl text-center mb-2 text-cyan-300"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {t("lobby.welcome")}
        </h2>

        <div
          className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {name}
        </div>

        <div className="text-center bg-black/60 border border-cyan-500/30 rounded py-3 mb-6">
          <div
            className="text-cyan-400/70 text-xs uppercase tracking-widest"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("lobby.room")}
          </div>
          <div
            className="text-xl font-bold text-cyan-400 mt-1"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {newRoomName}
          </div>
        </div>

        <div className="space-y-3">
          {!(isLeader && players?.includes(playerSessionKey)) && (
            <button
              onClick={() => setIsPlayersModalOpen(true)}
              onMouseDown={() => setPressedButton("players")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              className={`w-full py-4 bg-gradient-to-r from-purple-900/80 to-purple-800/80 hover:from-purple-800/80 hover:to-purple-700/80 rounded border border-purple-500/50 font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all ${pressedButton === "players" ? "scale-95" : ""}`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              ⚔️ {t("oneDevice.knightsAssembled")}{" "}
              <span className="bg-cyan-500 text-black px-2 py-0.5 rounded-full text-sm ml-2 font-bold">
                {players?.length || 0}
              </span>
            </button>
          )}

          {isLeader && (
            <button
              onClick={() => setShowSettings(true)}
              onMouseDown={() => setPressedButton("settings")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              className={`w-full py-4 bg-gradient-to-r from-slate-900/80 to-slate-800/80 hover:from-slate-800/80 hover:to-slate-700/80 rounded border border-cyan-500/50 font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all ${pressedButton === "settings" ? "scale-95" : ""}`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              ⚙️ {t("oneDevice.questSettings")}
            </button>
          )}

          {isLeader && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              onMouseDown={() => setPressedButton("start")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              className={`w-full py-4 rounded border font-bold text-lg shadow-lg transition-all ${
                canStart
                  ? "bg-gradient-to-r from-cyan-900/80 to-cyan-800/80 hover:from-cyan-800/80 hover:to-cyan-700/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "bg-zinc-900/50 border-zinc-700/50 text-zinc-600 cursor-not-allowed"
              } ${pressedButton === "start" && canStart ? "scale-95" : ""}`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              🗡️ {t("lobby.startGame")} 🗡️
            </button>
          )}

          <button
            onClick={handleExitClick}
            onMouseDown={() => setPressedButton("exit")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            className={`w-full py-4 bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800/80 hover:to-red-700/80 rounded border border-red-500/50 font-bold text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all ${pressedButton === "exit" ? "scale-95" : ""}`}
            style={{ fontFamily: "MedievalSharp" }}
          >
            🚪 {t("lobby.exit")}
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-6"></div>
      </div>

      {isPlayersModalOpen && (
        <EnterPlayersModal
          isOpen={isPlayersModalOpen}
          onClose={() => setIsPlayersModalOpen(false)}
          players={players}
          setPlayers={setPlayers}
        />
      )}

      {showSettings && (
        <Settings
          isLeader={isCurrentLeader}
          readyPlayers={players}
          selectedRoles={selectedRoles}
          toggleRole={toggleRole}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          isMobile={true}
        />
      )}
    </motion.div>
  );
}

export default OneDeviceLobby;
