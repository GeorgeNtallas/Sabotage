import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CharacterImage from "../ui/CharacterImage";
import AnimatedWindow from "../ui/Info";
import FloatingEmbers from "../ui/FloatingEmbers";
import Lightning from "../ui/Lightning";

function MobileGameView({
  character,
  displayName,
  name,
  isLeader,
  players,
  roundLeaderId,
  phase,
  round,
  phaseResults,
  totalTeamSize,
  gameCharacters,
  phaseVoters,
  showPlayersVote,
  hasVoted,
  showQuestVoteButton,
  showLeaderVoteButton,
  setShowVoteModal,
  setShowQuestVoteModal,
  setShowLeaderVoteModal,
  setShowExit,
  pressedButton,
  setPressedButton,
  handleChatOpen,
  unreadMessages,
  finalTeamSuggestions,
  leaderVotedPlayers,
}) {
  const { t } = useTranslation();

  if (!character) return null;

  return (
    <div
      className="relative w-full bg-gray-900 text-white"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100dvh",
        height: "100dvh",
        margin: 0,
        padding: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        opacity: "inherit",
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <FloatingEmbers />
      <Lightning />
      <div className="absolute inset-0 bg-black/80 z-0"></div>
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
      <div className="relative z-10">
        <div className="flex justify-around items-center h-16 w-full mt-2">
          <button
            onClick={() => setShowExit(true)}
            onMouseDown={() => setPressedButton("exit")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            onTouchStart={() => setPressedButton("exit")}
            onTouchEnd={() => setPressedButton(null)}
            className={`px-3 py-2 bg-purple-600 hover:bg-purple-700 transition rounded-md font-bold ${
              pressedButton === "exit" ? "scale-95 brightness-75" : ""
            }`}
          >
            {t("game.exit")}
          </button>
          <img
            src="/images/Sabotage3.png"
            alt="Leader"
            className="w-40 ml-6"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          <div className="w-20"></div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex justify-center items-center h-16 w-full px-4 mt-5">
            <div className="flex items-center gap-10">
              <button
                onClick={handleChatOpen}
                onMouseDown={() => setPressedButton("chat")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("chat")}
                onTouchEnd={() => setPressedButton(null)}
                className={`relative px-3 py-2 bg-purple-600 hover:bg-purple-700 transition rounded-md font-bold ${
                  pressedButton === "chat" ? "scale-95 brightness-75" : ""
                }`}
              >
                {t("game.chat")}
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <div className="bg-black/90 rounded-lg p-3 text-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(150,50,150,0.4)]">
                <h3 className="text-center font-semibold mb-2">
                  {t("game.phase")} {phase} - {t("game.round")} {round}
                </h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((phaseNum) => {
                    let circleColor = "bg-gray-600";

                    if (phaseNum === phase) {
                      circleColor = "bg-cyan-600";
                    } else if (phaseNum < phase) {
                      const result = phaseResults[phaseNum - 1];
                      if (result) {
                        circleColor =
                          result === "success" ? "bg-amber-500" : "bg-red-500";
                      }
                    }

                    return (
                      <motion.div
                        key={phaseNum}
                        className={`w-6 h-6 rounded-full ${circleColor} flex items-center justify-center text-white text-xs font-bold`}
                        animate={
                          phaseNum === phase
                            ? {
                                opacity: [1, 0.5, 1],
                                scale: [1, 1.05, 1],
                              }
                            : {
                                opacity: [0.9, 0.9, 0.9],
                                scale: [1, 1, 1],
                              }
                        }
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {phaseNum}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <AnimatedWindow
                triggerLabel={t("game.menu")}
                totalTeamSize={totalTeamSize}
                gameCharacters={gameCharacters}
                phaseVoters={phaseVoters}
                players={players}
                onMouseDown={() => setPressedButton("menu")}
                onMouseUp={() => setPressedButton(null)}
                onMouseLeave={() => setPressedButton(null)}
                onTouchStart={() => setPressedButton("menu")}
                onTouchEnd={() => setPressedButton(null)}
                pressedButton={pressedButton}
              />
            </div>
          </div>

          <div className="flex justify-center ml-2">
            <div className="flex flex-row space-x-4">
              <div className="bg-black/90 rounded-lg mx-auto text-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(150,50,150,0.4)]">
                <div className="flex items-center justify-center mb-2">
                  <h2 className="text-lg font-semibold pt-2">
                    {displayName || name}
                  </h2>
                  {isLeader && (
                    <img
                      src="/images/Crown.jpg"
                      alt="Leader"
                      className="w-6 h-5 mt-1 ml-2"
                      onError={(e) => (e.target.src = "/images/default.jpg")}
                    />
                  )}
                </div>
                <CharacterImage characterName={character.name} />
                <h3 className="text-lg font-bold text-yellow-400">
                  {character.name}
                </h3>
                <p className="text-sm text-purple-200 mb-1">
                  {t(`characters.descriptions.${character.name}`)}
                </p>
                <p className="text-xs pb-2">
                  {t("game.team")}:{" "}
                  <span
                    className={
                      character.team === "good"
                        ? "text-blue-400"
                        : "text-red-400"
                    }
                  >
                    {character.team === "good"
                      ? t("game.good")
                      : t("game.evil")}
                  </span>
                </p>
              </div>

              <div
                className="bg-black/90 rounded-lg w-48 p-2 mx-auto text-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(150,50,150,0.4)]"
                style={{ gridTemplateColumns: "1fr 1fr auto" }}
              >
                <div
                  className="grid grid-cols-3 text-purple-200 font-bold mb-3 border-b border-purple-500/30 pb-2 text-sm"
                  style={{ gridTemplateColumns: "1fr 1fr auto" }}
                >
                  <h3 className="text-center">{t("lobby.players")}</h3>
                  <h3 className="text-center mr-3">{t("game.role")}</h3>
                  <h3 className="text-center mr-1">L</h3>
                </div>
                <div
                  className="grid grid-cols-3 gap-y-2 text-xs text-purple-200/70"
                  style={{ gridTemplateColumns: "1fr 1fr auto" }}
                >
                  {players.map((player) => (
                    <React.Fragment key={player.playerSessionKey}>
                      <div className="text-center">{player.name}</div>
                      <div className="text-center mr-2">
                        {player.visibleRole === "evil"
                          ? "Evil"
                          : player.visibleRole === "Seer/Seraphina"
                            ? "S/S"
                            : ""}
                      </div>
                      <div className="text-center">
                        {player.playerSessionKey === roundLeaderId && (
                          <img
                            src="/images/Crown.jpg"
                            alt="Leader"
                            className="w-4 h-4 mx-auto"
                            onError={(e) =>
                              (e.target.src = "/images/default.jpg")
                            }
                          />
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-80">
              {(finalTeamSuggestions.length > 0 ||
                leaderVotedPlayers.length > 0) && (
                <div className="bg-black/90 rounded-lg p-3 mb-4 text-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(150,50,150,0.4)]">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">
                    Quest Team
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-purple-200/70">
                    <div>
                      <h5 className="font-semibold text-white mb-2">
                        Player Suggestions
                      </h5>
                      {finalTeamSuggestions.length > 0 ? (
                        <div className="space-y-1">
                          {players
                            .filter((p) =>
                              finalTeamSuggestions.includes(p.playerSessionKey),
                            )
                            .map((p) => (
                              <div
                                key={p.playerSessionKey}
                                className="text-center"
                              >
                                {p.name}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-purple-500/50">
                          No suggestions yet
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white mb-2">
                        Leader Selection
                      </h5>
                      {leaderVotedPlayers.length > 0 ? (
                        <div className="space-y-1">
                          {players
                            .filter((p) =>
                              leaderVotedPlayers.includes(p.playerSessionKey),
                            )
                            .map((p) => (
                              <div
                                key={p.playerSessionKey}
                                className="text-center"
                              >
                                {p.name}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          {isLeader ? "No selection yet" : "Leader deciding..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {showPlayersVote && (
                <button
                  onClick={() => setShowVoteModal(true)}
                  onMouseDown={() => setPressedButton("vote")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("vote")}
                  onTouchEnd={() => setPressedButton(null)}
                  disabled={hasVoted}
                  className={`w-full rounded-lg p-3 mb-2 text-white ${
                    hasVoted
                      ? "bg-gray-600 cursor-not-allowed"
                      : `bg-amber-800 hover:bg-amber-900 ${
                          pressedButton === "vote"
                            ? "scale-95 brightness-75"
                            : ""
                        }`
                  }`}
                >
                  {hasVoted
                    ? t("game.waitForOtherPlayers")
                    : t("game.voteForQuestTeam")}
                </button>
              )}
              {showQuestVoteButton && (
                <button
                  onClick={() => setShowQuestVoteModal(true)}
                  onMouseDown={() => setPressedButton("proceed")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("proceed")}
                  onTouchEnd={() => setPressedButton(null)}
                  className={`w-full bg-amber-800 hover:bg-amber-900 text-white rounded-lg p-3 mb-2 ${
                    pressedButton === "proceed" ? "scale-95 brightness-75" : ""
                  }`}
                >
                  {t("game.proceedToQuest")}
                </button>
              )}
              {isLeader && showLeaderVoteButton && (
                <button
                  onClick={() => setShowLeaderVoteModal(true)}
                  onMouseDown={() => setPressedButton("leader")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("leader")}
                  onTouchEnd={() => setPressedButton(null)}
                  className={`w-full bg-amber-800 hover:bg-amber-900 text-white rounded-lg p-3 ${
                    pressedButton === "leader" ? "scale-95 brightness-75" : ""
                  }`}
                >
                  {t("game.leaderVote")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileGameView;
