import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import socket from "../socket";
import Rules from "../components/ui/Rules";
import Notify from "../components/ui/Notify";

function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
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
    if (!name.trim()) {
      alert(t("home.pleaseEnterName"));
      return;
    }

    socket.emit(
      "create_room",
      name,
      ({ roomPassword, roomSessionKey, playerSessionKey, isLeader, error }) => {
        if (error) {
          alert(error);
          return;
        } else {
          sessionStorage.setItem("roomSessionKey", roomSessionKey);
          sessionStorage.setItem("playerSessionKey", playerSessionKey);
        }

        navigate(`/lobby?${roomSessionKey}`, {
          state: { name, isLeader, roomPassword },
        });
      },
    );
  };

  const handleJoin = () => {
    socket.emit(
      "join_room",
      { name: name, roomPassword: roomPassword },
      ({ roomSessionKey, playerSessionKey, isLeader, gameStarted, error }) => {
        if (error) {
          alert(error);
          return;
        }
        sessionStorage.setItem("roomSessionKey", roomSessionKey);
        sessionStorage.setItem("playerSessionKey", playerSessionKey);

        if (gameStarted) {
          navigate(`/game?${roomSessionKey}`, {
            state: { name, isLeader, roomPassword },
          });
        } else {
          navigate(`/lobby?${roomSessionKey}`, {
            state: { name, isLeader, roomPassword },
          });
        }
      },
    );
  };

  return (
    <div
      className="relative h-dvh min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="mb-10 bg-black/60 backdrop-blur-md border border-black rounded-xl shadow-2xl p-8 w-[350px] h-[500px] text-white">
        <div className="flex justify-center">
          <img
            src="/images/Sabotage3.png"
            alt="Leader"
            className="w-[55%] mb-2"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-5 mt-5">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 px-4 rounded-l-md font-bold transition ${
              activeTab === "login"
                ? "bg-rose-600 text-white"
                : "bg-gray-800 text-gray-300 hover:text-white"
            }`}
            style={medievalFontStyle}
          >
            {t("home.loginButton") || "Login"}
          </button>
          <button
            onClick={() => setActiveTab("quickplay")}
            className={`flex-1 py-2 px-4 rounded-r-md font-bold transition ${
              activeTab === "quickplay"
                ? "bg-rose-600 text-white"
                : "bg-gray-800 text-gray-300 hover:text-white"
            }`}
            style={medievalFontStyle}
          >
            {t("home.quickPlayButton")}
          </button>
        </div>

        <div
          className="px-4 text-black rounded-2xl p-6 relative"
          style={{ height: "280px" }}
        >
          <div
            className={`transition-opacity duration-700 absolute inset-0 ${activeTab === "login" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <input
              type="text"
              placeholder={t("home.email")}
              className="w-full mb-4 p-3 rounded-md bg-indigo-500/15 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={medievalFontStyle}
            />
            <input
              type="text"
              placeholder={t("home.password")}
              className="w-full p-3 rounded-md bg-indigo-500/15 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={medievalFontStyle}
            />
            <button
              className="w-full py-3 bg-gradient-to-r bg-green-700 hover:from-green-800 hover:via-green-700 hover:to-green-800 transition rounded-md font-bold border border-green-950 text-white"
              style={{
                marginTop: "20px",
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.login")}
            </button>
            <button
              className="w-full py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white"
              style={{
                marginTop: "50px",
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.signUp")}
            </button>
          </div>

          <div
            className={`transition-opacity duration-700 absolute inset-0 ${activeTab === "quickplay" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <input
              type="text"
              placeholder={t("home.yourName")}
              className="w-full mb-4 p-3 rounded-md bg-indigo-500/15 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={medievalFontStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder={t("home.roomPassword")}
              className="w-full  p-3 rounded-md bg-indigo-500/15 border border-white/40 placeholder-white/80 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={medievalFontStyle}
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
            />
            <button
              onClick={handleJoin}
              onMouseDown={() => setPressedButton("join")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("join")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 bg-gradient-to-r bg-green-700 hover:from-green-800 hover:via-green-700 hover:to-green-800 transition rounded-md font-bold border border-green-950 text-white ${
                pressedButton === "join" ? "scale-95 brightness-75" : ""
              }`}
              style={{
                marginTop: "20px",
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.joinGame")}
            </button>
            <button
              onClick={handleCreate}
              onMouseDown={() => setPressedButton("create")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("create")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white ${
                pressedButton === "create" ? "scale-95 brightness-75" : ""
              }`}
              style={{
                marginTop: "50px",
                fontFamily: "MedievalSharp",
                fontWeight: 1000,
              }}
            >
              {t("home.createGame")}
            </button>
          </div>
        </div>
      </div>
      <Notify
        message="Login section is under construction"
        show={activeTab === "login"}
      />
      <Rules showRules={showRules} setShowRules={setShowRules} />
      <button
        onClick={() => setShowRules(true)}
        className="absolute bottom-10 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg font-bold z-10 border border-gray-800"
        style={medievalFontStyle}
      >
        {t("home.rules")}
      </button>
      <div className="absolute space-x-5 bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        <button onClick={() => changeLanguage("en")}>English</button>
        <button onClick={() => changeLanguage("gr")}>Ελληνικά</button>
      </div>
    </div>
  );
}

export default Home;
