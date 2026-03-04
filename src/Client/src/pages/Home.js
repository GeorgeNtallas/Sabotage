import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Rules from "../components/ui/Rules";
import Notify from "../components/ui/Notify";
import EnterPasswordModal from "../components/ui/EnterPasswordModal";
import RoomsModal from "../components/ui/RoomsModal";
import SparkParticles from "../components/ui/SparkParticles";

function Home() {
  const [password, setPassword] = useState("");
  const [roomNamePassword, setroomNamePassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [gameAction, setGameAction] = useState("join");
  const [isPublic, setIsPublic] = useState(true);
  const [oneDevice, setOneDevice] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingRoomName, setPendingRoomName] = useState("");
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);
  const [flameGlow, setFlameGlow] = useState(0);
  sessionStorage.removeItem("roomSessionKey");

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };
  const { t, i18n } = useTranslation();

  // Animated flame glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFlameGlow((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleCreate = () => {
    if (!playerName.trim()) {
      alert("Please enter player name");
      return;
    }
    socket.emit(
      "create_room",
      playerName,
      roomName,
      isPublic,

      ({
        roomPassword,
        roomSessionKey,
        playerSessionKey,
        newRoomName,
        isLeader,
        error,
      }) => {
        if (error) {
          alert(error);
          return;
        } else {
          sessionStorage.setItem("roomSessionKey", roomSessionKey);
          sessionStorage.setItem("playerSessionKey", playerSessionKey);
        }

        if (oneDevice) {
          navigate(`/onedevice?${roomSessionKey}`, {
            state: {
              name: playerName,
              isLeader,
              newRoomName,
            },
          });
          return;
        }
        navigate(`/lobby?${roomSessionKey}`, {
          state: {
            name: playerName,
            isLeader,
            roomPassword,
            newRoomName,
            isPublic,
            readyList: [],
          },
        });
      },
    );
  };

  const handleJoin = () => {
    socket.emit(
      "join_room",
      { name: playerName, input: roomNamePassword },
      ({
        roomSessionKey,
        playerSessionKey,
        isLeader,
        gameStarted,
        requiresPassword,
        roomName,
        roomPassword,
        isPublic,
        error,
      }) => {
        if (error) {
          alert(error);
          return;
        }
        if (requiresPassword) {
          setPendingRoomName(roomName);
          setShowPasswordModal(true);
          return;
        }
        sessionStorage.setItem("roomSessionKey", roomSessionKey);
        sessionStorage.setItem("playerSessionKey", playerSessionKey);

        if (gameStarted) {
          navigate(`/game?${roomSessionKey}`, {
            state: {
              name: playerName,
              isLeader,
              roomPassword,
              newRoomName: roomName,
              isPublic,
            },
          });
        } else {
          navigate(`/lobby?${roomSessionKey}`, {
            state: {
              name: playerName,
              isLeader,
              roomPassword,
              newRoomName: roomName,
              isPublic,
              readyList: [],
            },
          });
        }
      },
    );
  };

  const handlePasswordSubmit = (password) => {
    socket.emit(
      "join_room",
      { name: playerName, input: pendingRoomName, password },
      ({
        roomSessionKey,
        playerSessionKey,
        isLeader,
        gameStarted,
        roomName,
        roomPassword,
        isPublic,
        error,
      }) => {
        setShowPasswordModal(false);
        if (error) {
          alert(error);
          return;
        }

        sessionStorage.setItem("roomSessionKey", roomSessionKey);
        sessionStorage.setItem("playerSessionKey", playerSessionKey);

        if (gameStarted) {
          navigate(`/game?${roomSessionKey}`, {
            state: {
              name: playerName,
              isLeader,
              roomPassword,
              roomName,
              isPublic,
            },
          });
        } else {
          navigate(`/lobby?${roomSessionKey}`, {
            state: {
              name: playerName,
              isLeader,
              roomPassword,
              roomName,
              isPublic,
            },
          });
        }
      },
    );
  };

  const handleJoinFromRooms = (room) => {
    setActiveTab("quickplay");
    setGameAction("join");
    setroomNamePassword(room.roomName);
    setShowRoomsModal(false);
  };

  return (
    <div className="min-h-screen bg-black bg-center flex items-center justify-center relative overflow-hidden">
      {/* Spark Particles - Fire from bottom to middle */}
      <SparkParticles />

      {/* Dark overlay with slight red tint for medieval feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-red-950/20 to-black/60 z-0"></div>

      {/* Ambient fog/mist effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(80, 20, 10, 0.4) 0%, transparent 100%)",
        }}
      ></div>

      {/* Main card - Medieval style - rounded with decorations */}
      <div className="relative w-[85%] max-w-sm min-w-[320px] z-10">
        {/* Dark background with medieval styling */}
        <div className="bg-black/95 backdrop-blur-lg border-2 border-amber-600/50 rounded-xl shadow-[0_0_30px_rgba(200,100,50,0.3)] p-4 sm:p-8 text-white flex flex-col relative">
          {/* Corner decorations - amber style */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

          {/* Logo/Title section */}
          <div className="flex justify-center mb-4 relative">
            {/* Flame glow behind logo */}
            <div
              className="absolute w-32 h-32 rounded-full blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 100, 30, 0.4) 0%, transparent 70%)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            ></div>
            <img
              src="/images/Sabotage3.png"
              alt="Leader"
              className="w-[60%] max-w-[220px] mb-2 relative z-10 drop-shadow-lg"
              onError={(e) => (e.target.src = "/images/default.jpg")}
            />
          </div>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent w-16"></div>
            <div className="text-amber-600 text-lg">⚔</div>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent w-16"></div>
          </div>

          {/* Tabs - Stone tablet style */}
          <div className="flex mb-4 mt-2 relative">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 font-bold transition relative overflow-hidden ${
                activeTab === "login"
                  ? "text-amber-500"
                  : "text-stone-400 hover:text-amber-300"
              }`}
              style={medievalFontStyle}
            >
              {activeTab === "login" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600"
                  style={{
                    boxShadow: "0 0 10px rgba(255, 150, 50, 0.8)",
                  }}
                ></span>
              )}
              {t("home.loginButton")}
            </button>
            <button
              onClick={() => setActiveTab("quickplay")}
              className={`flex-1 py-3 px-4 font-bold transition relative ${
                activeTab === "quickplay"
                  ? "text-amber-500"
                  : "text-stone-400 hover:text-amber-300"
              }`}
              style={medievalFontStyle}
            >
              {activeTab === "quickplay" && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600"
                  style={{
                    boxShadow: "0 0 10px rgba(255, 150, 50, 0.8)",
                  }}
                ></span>
              )}
              {t("home.quickPlayButton")}
            </button>
          </div>

          {/* Game Action Tabs - Only visible in quickplay */}
          <div className="h-[20px] mb-6">
            {activeTab === "quickplay" && (
              <div className="flex gap-1">
                <button
                  onClick={() => setGameAction("join")}
                  className={`flex-1 py-2 px-3 rounded-sm text-sm font-bold transition border ${
                    gameAction === "join"
                      ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                      : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
                  }`}
                  style={medievalFontStyle}
                >
                  {t("home.joinGame")}
                </button>
                <button
                  onClick={() => setGameAction("create")}
                  className={`flex-1 py-2 px-3 rounded-sm text-sm font-bold transition border ${
                    gameAction === "create"
                      ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                      : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
                  }`}
                  style={medievalFontStyle}
                >
                  {t("home.createGame")}
                </button>
              </div>
            )}
          </div>

          {/* Form area - Parchment/inner shadow */}
          <div
            className="px-2 rounded-lg p-4 sm:p-5 relative h-[300px] sm:h-[320px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(30, 20, 10, 0.9) 0%, rgba(20, 15, 10, 0.95) 100%)",
              boxShadow:
                "inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(100, 50, 20, 0.2)",
            }}
          >
            {/* Login Form */}
            <div
              className={`transition-all duration-500 absolute inset-0 p-4 ${
                activeTab === "login"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-full pointer-events-none"
              }`}
            >
              <input
                type="text"
                placeholder={t("home.email")}
                className="w-full mb-3 sm:mb-4 p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                style={medievalFontStyle}
              />
              <input
                type="text"
                placeholder={t("home.password")}
                className="w-full p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                style={medievalFontStyle}
              />

              {/* Decorative button with fire effect */}
              <button
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 transition rounded-sm font-bold border border-amber-700/50 text-amber-100 mt-6 sm:mt-8 text-sm sm:text-base relative overflow-hidden group"
                style={{
                  fontFamily: "MedievalSharp",
                  fontWeight: 1000,
                  boxShadow: "0 4px 15px rgba(150, 50, 20, 0.4)",
                }}
              >
                {/* Button glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                {t("home.login")}
              </button>

              <button
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:from-stone-700 hover:via-stone-800 hover:to-stone-700 transition rounded-sm font-bold border border-stone-600/50 text-amber-100 mt-3 sm:mt-5 text-sm sm:text-base"
                style={{
                  fontFamily: "MedievalSharp",
                  fontWeight: 1000,
                }}
              >
                {t("home.signUp")}
              </button>
            </div>

            {/* Quickplay Form */}
            <div
              className={`transition-all duration-500 absolute inset-0 p-4 ${
                activeTab === "quickplay"
                  ? "opacity-100 translate-x-0"
                  : activeTab === "login"
                    ? "opacity-0 -translate-x-full pointer-events-none"
                    : "opacity-0 translate-x-full pointer-events-none"
              }`}
            >
              {gameAction === "join" && (
                <>
                  <input
                    type="text"
                    placeholder={t("home.yourName")}
                    className="w-full mt-2 mb-3 sm:mb-4 p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                    style={medievalFontStyle}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={10}
                  />
                  <input
                    type="text"
                    placeholder={t("home.roomNamePassword")}
                    className="w-full mb-3 sm:mb-4 p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                    style={medievalFontStyle}
                    value={roomNamePassword}
                    onChange={(e) => setroomNamePassword(e.target.value)}
                  />
                  <button
                    onClick={handleJoin}
                    onMouseDown={() => setPressedButton("join")}
                    onMouseUp={() => setPressedButton(null)}
                    onMouseLeave={() => setPressedButton(null)}
                    onTouchStart={() => setPressedButton("join")}
                    onTouchEnd={() => setPressedButton(null)}
                    className={`w-full py-3 sm:py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 transition rounded-sm font-bold border border-amber-700/50 text-amber-100 mt-3 sm:mt-4 text-sm sm:text-base relative overflow-hidden group ${
                      pressedButton === "join"
                        ? "scale-[0.98] brightness-75"
                        : ""
                    }`}
                    style={{
                      fontFamily: "MedievalSharp",
                      fontWeight: 1000,
                      boxShadow: "0 4px 15px rgba(150, 50, 20, 0.4)",
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    {t("home.joinGame")}
                  </button>
                </>
              )}

              {gameAction === "create" && (
                <>
                  <input
                    type="text"
                    placeholder={t("home.yourName")}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full mt-2 mb-3 sm:mb-4 p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                    style={medievalFontStyle}
                    maxLength={10}
                  />
                  <input
                    type="text"
                    placeholder={t("home.roomName")}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full mb-3 sm:mb-4 p-3 sm:p-4 rounded-sm bg-black/60 border border-amber-800/40 placeholder-amber-600/40 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base transition"
                    style={medievalFontStyle}
                  />
                  <div className="flex gap-1 mt-1 mb-3 sm:mb-4">
                    <button
                      onClick={() => {
                        setIsPublic(true);
                        setOneDevice(false);
                      }}
                      className={`flex-1 py-2.5 px-2 text-xs sm:text-sm rounded-l-sm font-bold transition border ${
                        oneDevice
                          ? "bg-stone-900/80 text-stone-500 border-stone-700"
                          : isPublic
                            ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                            : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
                      }`}
                      style={medievalFontStyle}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => {
                        setIsPublic(false);
                        setOneDevice(false);
                      }}
                      className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold transition border ${
                        oneDevice
                          ? "bg-stone-900/80 text-stone-500 border-stone-700"
                          : !isPublic
                            ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                            : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
                      }`}
                      style={medievalFontStyle}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => {
                        setOneDevice(true);
                        setIsPublic(false);
                      }}
                      className={`flex-1.5 py-2.5 px-2 text-xs sm:text-sm rounded-r-sm font-bold transition border sm:hidden ${
                        oneDevice
                          ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                          : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
                      }`}
                      style={medievalFontStyle}
                    >
                      One Device
                    </button>
                  </div>
                  <button
                    onClick={handleCreate}
                    onMouseDown={() => setPressedButton("create")}
                    onMouseUp={() => setPressedButton(null)}
                    onMouseLeave={() => setPressedButton(null)}
                    onTouchStart={() => setPressedButton("create")}
                    onTouchEnd={() => setPressedButton(null)}
                    className={`w-full mt-4 py-3 sm:py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 transition rounded-sm font-bold border border-amber-700/50 text-amber-100 text-sm sm:text-base relative overflow-hidden group ${
                      pressedButton === "create"
                        ? "scale-[0.98] brightness-75"
                        : ""
                    }`}
                    style={{
                      fontFamily: "MedievalSharp",
                      fontWeight: 1000,
                      boxShadow: "0 4px 15px rgba(150, 50, 20, 0.4)",
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    Create Game
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom action buttons */}
          <div className="flex justify-between items-end z-10 mt-4">
            <button
              onClick={() => setShowRules(true)}
              className="bg-stone-900/90 hover:bg-stone-800 text-amber-400 px-4 sm:px-5 py-2 rounded-sm font-bold z-10 border border-amber-700/40 text-xs sm:text-sm hover:border-amber-500/50 transition"
              style={medievalFontStyle}
            >
              {t("home.rules")}
            </button>
            <button
              onClick={() => setShowRoomsModal(true)}
              className="bg-gradient-to-r from-amber-900 to-red-900 hover:from-amber-800 hover:to-red-800 text-amber-100 px-4 sm:px-5 py-2 rounded-sm font-bold z-10 border border-amber-600/40 text-xs sm:text-sm transition"
              style={medievalFontStyle}
            >
              {t("home.rooms")}
            </button>
          </div>
        </div>
      </div>

      {/* Language selector - Bottom */}
      <div className="fixed gap-6 bottom-6 left-0 right-0 flex justify-center z-20">
        <button
          onClick={() => changeLanguage("en")}
          className="text-amber-600/70 hover:text-amber-400 text-sm font-bold transition px-3 py-1 border border-transparent hover:border-amber-600/30 rounded-sm"
          style={medievalFontStyle}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage("gr")}
          className="text-amber-600/70 hover:text-amber-400 text-sm font-bold transition px-3 py-1 border border-transparent hover:border-amber-600/30 rounded-sm"
          style={medievalFontStyle}
        >
          Ελληνικά
        </button>
      </div>

      {/* Modals */}
      <Notify
        message="Login section is under construction"
        show={activeTab === "login"}
      />
      <Rules showRules={showRules} setShowRules={setShowRules} />
      <RoomsModal
        show={showRoomsModal}
        onClose={() => setShowRoomsModal(false)}
        onJoinRoom={handleJoinFromRooms}
      />
      <EnterPasswordModal
        show={showPasswordModal}
        roomName={pendingRoomName}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setShowPasswordModal(false)}
      />

      {/* CSS Animation keyframes */}
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
    </div>
  );
}

export default Home;

//TODO: Add in-game chat
//TODO: Fix responsive design for all pages
//TODO: Implement the login section
//TODO: Add extra page the players profile
