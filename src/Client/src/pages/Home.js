import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Rules from "../components/ui/Rules";
import Notify from "../components/ui/Notify";
import EnterPasswordModal from "../components/ui/EnterPasswordModal";
import RoomsModal from "../components/ui/RoomsModal";

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
  sessionStorage.removeItem("roomSessionKey");

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };
  const { t, i18n } = useTranslation();

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
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="mb-10 bg-black/95 backdrop-blur-lg border-2 border-cyan-500/50 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] p-4 sm:p-8 w-[85%] max-w-sm text-white flex flex-col relative">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
        <div className="flex justify-center">
          <img
            src="/images/Sabotage3.png"
            alt="Leader"
            className="w-[55%] max-w-[200px] mb-2"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-4 sm:mb-5 mt-4 sm:mt-5">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 rounded-l-md font-bold transition border-2 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-zinc-900 text-gray-300 hover:text-cyan-300 border-zinc-800"
            }`}
            style={medievalFontStyle}
          >
            {t("home.loginButton")}
          </button>
          <button
            onClick={() => setActiveTab("quickplay")}
            className={`flex-1 py-2 px-4 rounded-r-md font-bold transition border-2 ${
              activeTab === "quickplay"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-zinc-900 text-gray-300 hover:text-cyan-300 border-zinc-800"
            }`}
            style={medievalFontStyle}
          >
            {t("home.quickPlayButton")}
          </button>
        </div>

        {/* Game Action Tabs - Only visible in quickplay */}
        <div className="h-[20px] mb-3 sm:mb-4">
          {activeTab === "quickplay" && (
            <div className="flex">
              <button
                onClick={() => setGameAction("join")}
                className={`flex-1 py-1 px-2 rounded-l-md text-sm font-bold transition border ${
                  gameAction === "join"
                    ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50"
                    : "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
                }`}
                style={medievalFontStyle}
              >
                {t("home.joinGame")}
              </button>
              <button
                onClick={() => setGameAction("create")}
                className={`flex-1 py-1 px-2 rounded-r-md text-sm font-bold transition border ${
                  gameAction === "create"
                    ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50"
                    : "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
                }`}
                style={medievalFontStyle}
              >
                {t("home.createGame")}
              </button>
            </div>
          )}
        </div>

        <div className="px-4 text-black rounded-2xl p-4 sm:p-6 relative h-[260px] sm:h-[280px]">
          <div
            className={`transition-opacity duration-700 absolute inset-0 ${activeTab === "login" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <input
              type="text"
              placeholder={t("home.email")}
              className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
              style={medievalFontStyle}
            />
            <input
              type="text"
              placeholder={t("home.password")}
              className="w-full p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
              style={medievalFontStyle}
            />
            <button
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition rounded-md font-bold border-2 border-cyan-500/50 text-white mt-6 sm:mt-8 text-sm sm:text-base shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
              style={{
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.login")}
            </button>
            <button
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition rounded-md font-bold border-2 border-purple-500/50 text-white mt-4 sm:mt-6 text-sm sm:text-base shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              style={{
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.signUp")}
            </button>
          </div>

          <div
            className={`transition-opacity duration-700 absolute inset-0 ${
              activeTab === "quickplay"
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {gameAction === "join" && (
              <>
                <input
                  type="text"
                  placeholder={t("home.yourName")}
                  className="w-full mt-3 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
                  style={medievalFontStyle}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={10}
                />
                <input
                  type="text"
                  placeholder={t("home.roomNamePassword")}
                  className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
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
                  className={`w-full py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition rounded-md font-bold border-2 border-cyan-500/50 text-white mt-4 sm:mt-5 text-sm sm:text-base shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] ${
                    pressedButton === "join" ? "scale-95 brightness-75" : ""
                  }`}
                  style={{
                    fontFamily: "MedievalSharp",
                    fontWeight: 1000,
                  }}
                >
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
                  className="w-full mt-3 mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
                  style={medievalFontStyle}
                  maxLength={10}
                />
                <input
                  type="text"
                  placeholder={t("home.roomName")}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-md bg-black/80 border-2 border-cyan-500/50 placeholder-cyan-300/40 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base"
                  style={medievalFontStyle}
                />
                <div className="flex mt-1 mb-3 sm:mb-4">
                  <button
                    onClick={() => {
                      setIsPublic(true);
                      setOneDevice(false);
                    }}
                    className={`flex-1 py-2 px-4 text-sm rounded-l-md font-bold transition border ${
                      oneDevice
                        ? "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
                        : isPublic
                          ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50"
                          : "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
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
                    className={`flex-1 py-2 px-4 text-sm font-bold transition border ${
                      oneDevice
                        ? "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
                        : !isPublic
                          ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50"
                          : "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
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
                    className={`flex-2 py-2 px-4 text-sm rounded-r-md font-bold transition border sm:hidden ${
                      oneDevice
                        ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50"
                        : "bg-zinc-900 text-gray-400 hover:text-cyan-300 border-zinc-800"
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
                  className={`w-full mt-5 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition rounded-md font-bold border-2 border-cyan-500/50 text-white text-sm sm:text-base shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] ${
                    pressedButton === "create" ? "scale-95 brightness-75" : ""
                  }`}
                  style={{
                    fontFamily: "MedievalSharp",
                    fontWeight: 1000,
                  }}
                >
                  Create Game
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between items-end z-10 pb-safe mt-2">
          <button
            onClick={() => setShowRules(true)}
            className="pb-safe bg-zinc-900 hover:bg-zinc-800 text-cyan-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold z-10 border-2 border-cyan-500/50 text-sm sm:text-base hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
            style={medievalFontStyle}
          >
            {t("home.rules")}
          </button>
          <button
            onClick={() => setShowRoomsModal(true)}
            className="pb-safe bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold z-10 border-2 border-purple-500/50 text-sm sm:text-base shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition"
            style={medievalFontStyle}
          >
            {t("home.rooms")}
          </button>
        </div>
      </div>

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

      <div className="fixed gap-5 bottom-4 left-5 right-0 flex justify-center text-white">
        <button onClick={() => changeLanguage("en")}>English</button>
        <button onClick={() => changeLanguage("gr")}>Ελληνικά</button>
      </div>
      <EnterPasswordModal
        show={showPasswordModal}
        roomName={pendingRoomName}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default Home;

//TODO: Add in-game chat
//TODO: Fix responsive design for all pages
//TODO: Implement the login section
//TODO: Add extra page the players profile
