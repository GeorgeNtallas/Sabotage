import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Settings from "../ui/Settings";
import Chat from "../ui/Chat";

function MobileLobbyView({
  name,
  newRoomName,
  isPublic,
  roomPassword,
  players,
  lobbyLeaderId,
  readyPlayers,
  playerSessionKey,
  roomSessionKey,
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
  showChat,
  setShowChat,
  chatMessages,
  setChatMessages,
}) {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
      }}
    >
      <div className="absolute inset-0 bg-black/80"></div>
      {/* Dark overlay with purple tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-950/20 to-black/60 z-0"></div>

      {/* Ambient fog effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(60, 20, 80, 0.4) 0%, transparent 100%)",
        }}
      ></div>

      <div className="relative z-10 bg-black/95 backdrop-blur-lg border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.3)] p-4 w-[90%] max-w-sm text-white">
        {/* Corner decorations - purple style */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

        {/* Logo area */}
        <div className="flex justify-center mb-3 relative">
          {/* Purple glow behind logo */}
          <div
            className="absolute w-20 h-20 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(150, 50, 150, 0.4) 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          ></div>
          <img
            src="/images/Sabotage3.png"
            alt="Logo"
            className="w-[50%] max-w-[150px] drop-shadow-lg relative z-10"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-12"></div>
          <div className="text-purple-500 text-lg">⚔</div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-12"></div>
        </div>

        {/* Welcome and Room Info */}
        <h2
          className="text-xl text-center mb-2 text-purple-400"
          style={{ fontFamily: "MedievalSharp" }}
        >
          {t("lobby.welcome")}
        </h2>

        <div className="text-center mb-3">
          <div
            className="text-2xl font-bold text-purple-300"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {name}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3 bg-black/60 border border-purple-500/30 rounded py-2 px-3">
          <div
            className="text-purple-400/70 text-xs uppercase tracking-widest"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("lobby.room")}:
          </div>
          <div
            className="text-lg font-bold text-purple-400"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {newRoomName}
          </div>
          <img
            src={isPublic ? "/images/public.png" : "/images/private.png"}
            alt={isPublic ? "Public" : "Private"}
            className="w-5 h-5"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />

          {!isPublic && (
            <span className="text-purple-400/70 text-sm">({roomPassword})</span>
          )}
        </div>

        {/* Professional Players List */}
        <div className="bg-black/60 border border-purple-500/30 rounded-lg p-2 mb-3">
          <h3
            className="text-xs font-semibold text-purple-400 mb-2 flex items-center justify-center gap-1"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("lobby.players")} ({players.length})
          </h3>
          <div
            className={`${players.length >= 5 ? "grid grid-cols-2 gap-2" : "space-y-2"} max-h-[180px] overflow-y-auto pr-1`}
          >
            {players.map((player) => {
              const isLeader = player.playerSessionKey === lobbyLeaderId;
              const isReady = readyPlayers.includes(player.playerSessionKey);
              const isCurrentPlayer =
                player.playerSessionKey === playerSessionKey;

              return (
                <div
                  key={player.playerSessionKey}
                  className={`flex items-center justify-between p-1.5 rounded-lg border transition ${
                    isCurrentPlayer
                      ? "bg-purple-950/30 border-purple-500/50"
                      : "bg-zinc-900/50 border-purple-500/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {/* Player avatar placeholder */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isLeader
                          ? "bg-amber-600/50 border border-amber-500 text-amber-300"
                          : "bg-purple-900/50 border border-purple-600 text-purple-300"
                      }`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isCurrentPlayer
                              ? "text-purple-300"
                              : "text-purple-200"
                          }`}
                          style={{ fontFamily: "MedievalSharp" }}
                        >
                          {player.name}
                        </span>
                        {isLeader && (
                          <span className="text-xs bg-amber-600/30 border border-amber-500/50 text-amber-300 px-1 rounded flex-shrink-0">
                            👑
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isReady ? (
                      <span className="text-xs bg-green-600/30 border border-green-500/50 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        ✓
                      </span>
                    ) : (
                      <span className="text-xs bg-zinc-700/30 border border-zinc-600/50 text-zinc-400 px-1.5 py-0.5 rounded">
                        ⏳
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Top row: Ready and Chat */}
          <div className="flex gap-2">
            {/* Leader shows disabled "start the game" when ready, others show ready button */}
            {isCurrentLeader && readyPlayers.includes(playerSessionKey) ? (
              <button
                disabled={true}
                className="flex-1 py-3 rounded-sm font-bold transition relative overflow-hidden group bg-zinc-800/50 border border-zinc-700 text-purple-400 cursor-not-allowed"
                style={{ fontFamily: "MedievalSharp" }}
              >
                {t("lobby.awaitingStart")}
              </button>
            ) : (
              <button
                onClick={handleReadyClick}
                onMouseDown={() => setPressedButton("ready")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("ready")}
                onTouchEnd={() => setPressedButton(null)}
                disabled={readyPlayers.includes(playerSessionKey)}
                className={`flex-1 py-3 rounded-sm font-bold transition relative overflow-hidden group ${
                  readyPlayers.includes(playerSessionKey)
                    ? "bg-zinc-800/50 border border-zinc-700 text-zinc-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-800 via-green-700 to-green-800 hover:from-green-700 hover:via-green-600 hover:to-green-700 border border-green-600/50 text-green-200"
                } ${pressedButton === "ready" ? "scale-[0.98] brightness-75" : ""}`}
                style={{ fontFamily: "MedievalSharp" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
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
              className={`relative px-4 py-3 bg-gradient-to-r from-purple-800 via-purple-700 to-violet-800 hover:from-purple-700 hover:via-purple-600 hover:to-violet-700 border border-purple-600/50 text-purple-200 rounded-sm font-bold transition overflow-hidden group ${
                pressedButton === "chat" ? "scale-[0.98] brightness-75" : ""
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              💬
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                className={`relative px-4 py-3 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:from-stone-700 hover:via-stone-800 hover:to-stone-700 border border-stone-600/50 text-stone-300 rounded-sm font-bold transition overflow-hidden group ${
                  pressedButton === "settings"
                    ? "scale-[0.98] brightness-75"
                    : ""
                }`}
                style={{ fontFamily: "MedievalSharp" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                ⚙️
              </button>
            )}
          </div>

          {/* Start Game Button (Leader only) */}
          {isCurrentLeader && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              onMouseDown={() => setPressedButton("start")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton("start")}
              onTouchEnd={() => setPressedButton(null)}
              className={`w-full py-3 rounded-sm font-bold transition relative overflow-hidden group ${
                canStart
                  ? "bg-gradient-to-r from-purple-800 via-purple-700 to-violet-800 hover:from-purple-700 hover:via-purple-600 hover:to-violet-700 border border-purple-600/50 text-purple-200 shadow-[0_4px_20px_rgba(150,50,150,0.4)]"
                  : "bg-stone-900/50 border border-stone-700/50 text-stone-500 cursor-not-allowed"
              } ${pressedButton === "start" && canStart ? "scale-[0.98] brightness-75" : ""}`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              {t("lobby.startGame")}
            </button>
          )}

          {/* Exit Button */}
          <button
            onClick={handleExitClick}
            onMouseDown={() => setPressedButton("exit")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("exit")}
            onTouchEnd={() => setPressedButton(null)}
            className={`w-full py-3 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 hover:from-red-800 hover:via-red-700 hover:to-amber-800 border border-red-700/50 text-red-200 rounded-sm font-bold transition relative overflow-hidden group ${
              pressedButton === "exit" ? "scale-[0.98] brightness-75" : ""
            }`}
            style={{ fontFamily: "MedievalSharp" }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            {t("lobby.exit")}
          </button>
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-12"></div>
          <div className="text-purple-500 text-lg">⚔</div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent w-12"></div>
        </div>
      </div>

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

      {showChat && (
        <Chat
          show={showChat}
          onClose={() => setShowChat(false)}
          playerSessionKey={playerSessionKey}
          roomSessionKey={roomSessionKey}
          isDesktop={false}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
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
    </div>
  );
}

export default MobileLobbyView;
