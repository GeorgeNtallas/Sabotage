import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Settings from "../ui/Settings";

function MobileLobbyView({
  name,
  newRoomName,
  isPublic,
  roomPassword,
  players,
  lobbyLeaderId,
  readyPlayers,
  playerSessionKey,
  isCurrentLeader,
  canStart,
  pressedButton,
  setPressedButton,
  handleReadyClick,
  handleChatOpen,
  handleExitClick,
  handleStartGame,
  unreadMessages,
  selectedRoles,
  toggleRole,
}) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

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
      <div className="mb-10 bg-black/60 backdrop-blur-md border border-black rounded-xl shadow-2xl p-4 w-[350px] h-[600px] text-white">
        <h2 className="text-3xl font-extrabold text-center mb-8">
          {t("lobby.welcome")} &nbsp;
          <span className="text-indigo-300 text-shadow">{name}</span>
        </h2>
        <div className="flex items-center justify-center mb-2">
          <p className="mb-5 text-xl font-extrabold text-center text-slate-300 italic">
            {t("lobby.room")}:{" "}
            {newRoomName?.trim() && (
              <span className="font-mono text-indigo-300">{newRoomName}</span>
            )}
          </p>
          <img
            src={isPublic ? "/images/public.png" : "/images/private.png"}
            alt={isPublic ? "Public" : "Private"}
            className={isPublic ? "w-5 h-5 mb-5 ml-2" : "w-7 h-7 mb-5 ml-5"}
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          {!isPublic && (
            <p className="mb-5 text-md font-extrabold text-center text-slate-300 italic">
              <span className="font-mono text-indigo-300">{roomPassword}</span>
            </p>
          )}
        </div>

        <div className="bg-black/1 rounded-2xl p-6">
          <div className="w-full mb-4 p-3 rounded-md bg-indigo-500/15 border border-white/20 text-white">
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-3">
              {!(
                isCurrentLeader && readyPlayers.includes(playerSessionKey)
              ) && (
                <button
                  onClick={handleReadyClick}
                  onMouseDown={() => setPressedButton("ready")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("ready")}
                  onTouchEnd={() => setPressedButton(null)}
                  disabled={readyPlayers.includes(playerSessionKey)}
                  className={`text-md px-5 py-3 rounded-md font-bold transition ${
                    readyPlayers.includes(playerSessionKey)
                      ? "bg-red-600 cursor-not-allowed"
                      : `bg-gradient-to-r bg-green-700 hover:from-green-800 hover:via-green-700 hover:to-green-800 transition rounded-md font-bold border border-green-950 text-white ${
                          pressedButton === "ready"
                            ? "scale-95 brightness-75"
                            : ""
                        }`
                  }`}
                >
                  {readyPlayers.includes(playerSessionKey)
                    ? t("lobby.waiting")
                    : t("lobby.ready")}
                </button>
              )}
              <button
                onClick={handleChatOpen}
                onMouseDown={() => setPressedButton("chat")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("chat")}
                onTouchEnd={() => setPressedButton(null)}
                className={`relative text-md px-5 py-3 bg-gradient-to-r bg-indigo-700 hover:bg-indigo-800 hover:via-indigo-700 hover:to-indigo-800 transition rounded-md font-bold border border-indigo-900 text-white ${
                  pressedButton === "chat" ? "scale-95 brightness-75" : ""
                }`}
              >
                {t("lobby.chat") || "Chat"}
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              {isCurrentLeader && (
                <button
                  onClick={() => setShowSettings(true)}
                  onMouseDown={() => setPressedButton("settings")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("settings")}
                  onTouchEnd={() => setPressedButton(null)}
                  className={`text-md px-5 py-3 bg-gradient-to-r bg-slate-700 hover:bg-slate-800 hover:via-slate-700 hover:to-slate-800 transition rounded-md font-bold border border-slate-900 text-white ${
                    pressedButton === "settings" ? "scale-95 brightness-75" : ""
                  }`}
                >
                  Settings
                </button>
              )}
            </div>
            {isCurrentLeader && (
              <button
                className={`text-md px-3 py-4 rounded-md ${
                  canStart
                    ? `bg-gradient-to-r bg-green-600 to-green-700 hover:bg-green-700 transition ${
                        pressedButton === "start"
                          ? "scale-95 brightness-75"
                          : ""
                      }`
                    : "bg-green-500/10 backdrop-blur-md border-green-400/20 cursor-not-allowed"
                } text-black font-semibold`}
                disabled={!canStart}
                onMouseDown={() => setPressedButton("start")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("start")}
                onTouchEnd={() => setPressedButton(null)}
                onClick={handleStartGame}
              >
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
              className={`text-md px-5 py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white ${
                pressedButton === "exit" ? "scale-95 brightness-75" : ""
              }`}
            >
              {t("lobby.exit")}
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <Settings
          isLeader={isCurrentLeader}
          readyPlayers={readyPlayers}
          selectedRoles={selectedRoles}
          toggleRole={toggleRole}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          isMobile={true}
        />
      )}
    </div>
  );
}

export default MobileLobbyView;
