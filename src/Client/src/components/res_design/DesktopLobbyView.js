import React from "react";
import { useTranslation } from "react-i18next";
import Settings from "../ui/Settings";

function DesktopLobbyView({
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
  handleExitClick,
  handleStartGame,
  showChat,
  selectedRoles,
  toggleRole,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="relative flex h-screen bg-gray-900 text-white"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10 flex w-full">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-md border border-black rounded-xl shadow-2xl p-4 w-[350px] h-[600px] text-white">
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
          <div
            className={
              isCurrentLeader
                ? "flex gap-4"
                : "flex flex-col items-center gap-2"
            }
          >
            <div
              className={`flex flex-col gap-2 ${isCurrentLeader ? "flex-1" : ""}`}
            >
              {!(
                isCurrentLeader && readyPlayers.includes(playerSessionKey)
              ) && (
                <button
                  onClick={handleReadyClick}
                  onMouseDown={() => setPressedButton("ready")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
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
                onClick={handleExitClick}
                onMouseDown={() => setPressedButton("exit")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                className={`text-md px-5 py-3 bg-gradient-to-r bg-red-700 hover:bg-red-800 hover:via-red-700 hover:to-red-800 transition rounded-md font-bold border border-red-900 text-white ${
                  pressedButton === "exit" ? "scale-95 brightness-75" : ""
                }`}
              >
                {t("lobby.exit")}
              </button>
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
                  onClick={handleStartGame}
                >
                  {t("lobby.startGame")}
                </button>
              )}
            </div>
          </div>
        </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {isCurrentLeader && (
            <Settings
              isLeader={isCurrentLeader}
              readyPlayers={readyPlayers}
              selectedRoles={selectedRoles}
              toggleRole={toggleRole}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DesktopLobbyView;
