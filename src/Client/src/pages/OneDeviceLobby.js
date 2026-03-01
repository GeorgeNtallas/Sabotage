import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import socket from "../socket";
import EnterPlayersModal from "../components/ui/EnterPlayersModal";
import Settings from "../components/ui/Settings";

function OneDeviceLobby() {
  const location = useLocation();
  const { name, isLeader, newRoomName } = location.state || {};
  const [players, setPlayers] = useState([
    name,
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
  ]);
  const [lobbyLeaderId, setLobbyLeaderId] = useState(null);
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [fadeOut, setFadeOut] = useState(false);
  const { t } = useTranslation();

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };
  // Loc, roomId

  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false); // isPlayersModalOpen
  const [closePlayersModal, setClosePlayersModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);

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
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handlePlayersClick = () => {
    setIsPlayersModalOpen(true);
  };

  const isCurrentLeader = lobbyLeaderId === playerSessionKey;
  const canStart = players.length >= 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 mb-10 bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-8 w-[80%] max-w-sm text-white flex flex-col">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/images/Sabotage3.png"
              alt="Leader"
              className="w-[55%] max-w-[200px]"
              onError={(e) => (e.target.src = "/images/default.jpg")}
            />
          </div>

          {/* Welcome */}
          <h2
            className="text-3xl font-extrabold text-center mb-3"
            style={medievalFontStyle}
          >
            {t("lobby.welcome")} <span className="text-indigo-400">{name}</span>
          </h2>

          {/* Room */}
          <div
            className="text-center text-slate-300 font-semibold mb-6"
            style={medievalFontStyle}
          >
            {t("lobby.room")}:{" "}
            <span className="text-indigo-400 font-mono">{newRoomName}</span>
          </div>

          {/* PLAYERS BUTTON */}
          {!(isLeader && players?.includes(playerSessionKey)) && (
            <button
              onClick={() => {
                handlePlayersClick();
              }}
              onMouseDown={() => setPressedButton("players")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("players")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 bg-gradient-to-r bg-rose-700 hover:from-rose-800 hover:via-rose-700 hover:to-rose-800 transition rounded-md font-bold border border-green-950 text-white mb-4 text-base ${
                pressedButton === "players" ? "scale-95 brightness-75" : ""
              }`}
              style={{
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              Players
              <span> {players?.length || 0}</span>
            </button>
          )}

          {/* SETTINGS BUTTON (Leader Only) */}
          {isLeader && (
            <button
              onClick={() => setShowSettings(true)}
              onMouseDown={() => setPressedButton("settings")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("settings")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 bg-gradient-to-r bg-gray-700 hover:bg-gray-800 transition-all rounded-md font-bold text-base mb-4 ${
                pressedButton === "settings" ? "scale-95 brightness-75" : ""
              }`}
              style={medievalFontStyle}
            >
              Settings
            </button>
          )}

          {/* START GAME BUTTON */}
          {isLeader && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              onMouseDown={() => setPressedButton("start")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("start")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 rounded-md font-bold text-base transition-all border ${
                canStart
                  ? "bg-gradient-to-r bg-green-700 hover:from-green-800 hover:via-green-700 hover:to-green-800 border-green-950 text-white"
                  : "bg-green-900/40 cursor-not-allowed border-green-900/40 text-gray-400"
              } ${pressedButton === "start" && canStart ? "scale-95 brightness-75" : ""}`}
              style={{
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("lobby.startGame")}
            </button>
          )}

          {/* EXIT BUTTON */}
          <button
            onClick={handleExitClick}
            onMouseDown={() => setPressedButton("exit")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("exit")}
            onTouchEnd={() => setPressedButton(null)}
            className={`w-full py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white mt-4 text-base ${
              pressedButton === "exit" ? "scale-95 brightness-75" : ""
            }`}
            style={{
              fontFamily: "MedievalSharp",
              fontWeight: 1000,
            }}
          >
            {t("lobby.exit")}
          </button>
        </div>

        {/* EnterPlayersModal */}
        <EnterPlayersModal
          isOpen={isPlayersModalOpen}
          onClose={() => setIsPlayersModalOpen(false)}
          players={players}
          setPlayers={setPlayers}
        />
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
    </>
  );
}

export default OneDeviceLobby;
