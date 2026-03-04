import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import socket from "../socket";
import EnterPlayersModal from "../components/ui/EnterPlayersModal";
import Settings from "../components/ui/Settings";
import FloatingEmbers from "../components/ui/FloatingEmbers";

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
      {/* Dark overlay with purple tint for medieval feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-950/20 to-black/60 z-0"></div>

      {/* Ambient fog effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(60, 20, 80, 0.4) 0%, transparent 100%)",
        }}
      ></div>

      {/* Floating Embers - Magical glowing orbs rising */}
      <FloatingEmbers />

      <div className="relative z-10 bg-black/95 backdrop-blur-lg border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.3)] p-6 sm:p-8 w-[90%] max-w-sm min-w-[320px] text-white">
        {/* Corner decorations - purple style */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

        <div className="flex justify-center mb-4 relative">
          {/* Purple glow behind logo */}
          <div
            className="absolute w-28 h-28 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(150, 50, 150, 0.4) 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          ></div>
          <img
            src="/images/Sabotage3.png"
            alt="Logo"
            className="w-[60%] max-w-[200px] drop-shadow-lg relative z-10"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-14"></div>
          <div className="text-purple-500 text-lg">⚔</div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-14"></div>
        </div>

        <h2
          className="text-xl text-center mb-2 text-purple-400"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {t("lobby.welcome")}
        </h2>

        <div
          className="text-2xl font-bold text-center mb-4 text-purple-300"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {name}
        </div>

        <div className="text-center bg-black/60 border border-purple-500/30 rounded py-3 mb-4">
          <div
            className="text-purple-400/70 text-xs uppercase tracking-widest"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("lobby.room")}
          </div>
          <div
            className="text-lg font-bold text-purple-400 mt-1"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {newRoomName}
          </div>
        </div>

        {/* Professional Players List */}
        <div className="bg-black/60 border border-purple-500/30 rounded-lg p-2 mb-3">
          <h3
            className="text-xs font-semibold text-purple-400 mb-2 flex items-center justify-center gap-1"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("lobby.players")} ({players?.length || 0})
          </h3>
          <div
            className={`${(players?.length || 0) >= 5 ? "grid grid-cols-2 gap-1.5" : "space-y-1.5"} max-h-[120px] overflow-y-auto pr-1`}
          >
            {(players || []).map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-1.5 rounded-lg border bg-zinc-900/50 border-purple-500/20"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-purple-900/50 border border-purple-600 text-purple-300">
                    {player.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-semibold text-purple-200 truncate"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {player}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {!(isLeader && players?.includes(playerSessionKey)) && (
            <button
              onClick={() => setIsPlayersModalOpen(true)}
              onMouseDown={() => setPressedButton("players")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("players")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 sm:py-4 bg-gradient-to-r from-purple-900 via-purple-800 to-violet-900 hover:from-purple-800 hover:via-purple-700 hover:to-violet-800 rounded-sm border border-purple-600/50 font-bold text-base shadow-[0_4px_15px_rgba(150,50,150,0.4)] transition-all relative overflow-hidden group ${
                pressedButton === "players" ? "scale-[0.98] brightness-75" : ""
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {t("oneDevice.knightsAssembled")}{" "}
              <span className="bg-purple-500 text-black px-2 py-0.5 rounded-full text-xs ml-2 font-bold">
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
              onTouchStart={() => setPressedButton("settings")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 sm:py-4 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:from-stone-700 hover:via-stone-800 hover:to-stone-700 rounded-sm border border-stone-600/50 font-bold text-base transition-all relative overflow-hidden group ${
                pressedButton === "settings" ? "scale-[0.98] brightness-75" : ""
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {t("oneDevice.questSettings")}
            </button>
          )}

          {isLeader && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              onMouseDown={() => setPressedButton("start")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              className={`w-full py-3 sm:py-4 rounded-sm border font-bold text-base shadow-lg transition-all relative overflow-hidden group ${
                canStart
                  ? "bg-gradient-to-r from-purple-900 via-purple-800 to-violet-900 hover:from-purple-800 hover:via-purple-700 hover:to-violet-800 border-purple-600/50 shadow-[0_4px_20px_rgba(150,50,150,0.5)] text-purple-200"
                  : "bg-stone-900/50 border-stone-700/50 text-stone-600 cursor-not-allowed"
              } ${pressedButton === "start" && canStart ? "scale-[0.98] brightness-75" : ""}`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {t("lobby.startGame")}
            </button>
          )}

          <button
            onClick={handleExitClick}
            onMouseDown={() => setPressedButton("exit")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("exit")}
            onTouchEnd={() => setPressedButton(null)}
            className={`w-full py-3 sm:py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 rounded-sm border border-red-700/50 font-bold text-base shadow-[0_4px_15px_rgba(150,50,50,0.4)] transition-all relative overflow-hidden group ${
              pressedButton === "exit" ? "scale-[0.98] brightness-75" : ""
            }`}
            style={{ fontFamily: "MedievalSharp" }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            {t("lobby.exit")}
          </button>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-14"></div>
          <div className="text-purple-500 text-lg">⚔</div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-14"></div>
        </div>
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

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default OneDeviceLobby;
