import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CharacterImage from "../ui/CharacterImage";
import AnimatedWindow from "../ui/Info";

function DesktopGameView({
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
  showChat,
  finalTeamSuggestions,
  leaderVotedPlayers,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="relative w-full bg-gray-900 text-white overflow-hidden"
      style={{
        backgroundImage: "url(/images/mythical.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "1fr",
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Row 1: Logo */}
      <div className="flex justify-center items-center py-4">
        <img
          src="/images/Sabotage3.png"
          alt="Logo"
          className="w-40"
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />
      </div>

      {/* Row 2: 3 Columns */}
      <div className="grid grid-cols-3 gap-4 px-4 overflow-y-auto">
        {/* Column 1: Empty */}
        <div className="flex flex-col w-[350px]"></div>

        {/* Column 2: Phase-Round, Exit-Menu */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setShowExit(true)}
              onMouseDown={() => setPressedButton("exit")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              className={`px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-md font-bold ${pressedButton === "exit" ? "scale-95 brightness-75" : ""}`}
            >
              {t("game.exit")}
            </button>

            <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg p-3 text-center flex-1">
              <h3 className="font-semibold mb-2">
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
                        result === "success" ? "bg-blue-400" : "bg-red-500";
                    }
                  }
                  return (
                    <motion.div
                      key={phaseNum}
                      className={`w-6 h-6 rounded-full ${circleColor} flex items-center justify-center text-white text-xs font-bold`}
                      animate={
                        phaseNum === phase
                          ? { opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }
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
              onMouseDown={() => setPressedButton("menu")}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              pressedButton={pressedButton}
            />
          </div>
          <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center mb-2">
              <h2 className="text-lg font-semibold">{displayName || name}</h2>
              {isLeader && (
                <img
                  src="/images/Crown.jpg"
                  alt="Leader"
                  className="w-6 h-5 ml-2"
                  onError={(e) => (e.target.src = "/images/default.jpg")}
                />
              )}
            </div>
            <CharacterImage
              characterName={character.name}
              className="max-w-52 mx-auto mb-1 ml-3 mr-3"
            />
            <h3 className="text-lg font-bold text-yellow-400">
              {character.name}
            </h3>
            <p className="text-sm text-gray-300 mb-1">
              {t(`characters.descriptions.${character.name}`)}
            </p>
            <p className="text-xs">
              {t("game.team")}:{" "}
              <span
                className={
                  character.team === "good" ? "text-blue-400" : "text-red-400"
                }
              >
                {character.team === "good" ? t("game.good") : t("game.evil")}
              </span>
            </p>
          </div>
        </div>

        {/* Column 3: 2 Rows */}
        <div
          className="grid gap-4 w-[350px] ml-6"
          style={{ gridTemplateRows: "5fr 2fr" }}
        >
          {/* Row 1: Player List */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg p-3 w-full">
            <div
              className="grid grid-cols-3 text-white font-bold mb-3 border-b border-gray-600 pb-2 text-md"
              style={{ gridTemplateColumns: "2fr 2fr 1fr" }}
            >
              <h3 className="text-center">{t("lobby.players")}</h3>
              <h3 className="text-center">{t("game.role")}</h3>
              <h3 className="text-center">L</h3>
            </div>
            <div
              className="grid grid-cols-3 gap-y-2 text-sm text-gray-300"
              style={{ gridTemplateColumns: "2fr 2fr 1fr" }}
            >
              {players.map((player) => (
                <React.Fragment key={player.playerSessionKey}>
                  <div className="text-center">{player.name}</div>
                  <div className="text-center">
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
                        onError={(e) => (e.target.src = "/images/default.jpg")}
                      />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Row 2: Quest Popup Placeholder */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg p-3 ">
            <h4 className="text-md font-semibold text-white mb-3 text-center ">
              Quest Team
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 text-center">
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
                        <div key={p.playerSessionKey} className="text-center">
                          {p.name}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No suggestions yet</div>
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
                        <div key={p.playerSessionKey} className="text-center">
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
        </div>
      </div>

      {/* Row 3: Buttons */}
      <div className="flex justify-center items-center gap-4 py-4 px-4 mb-12">
        {showPlayersVote && (
          <button
            onClick={() => setShowVoteModal(true)}
            onMouseDown={() => setPressedButton("vote")}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={() => setPressedButton(null)}
            disabled={hasVoted}
            className={`px-6 py-3 rounded-lg text-white ${hasVoted ? "bg-gray-600 cursor-not-allowed" : `bg-amber-600 hover:bg-amber-700 ${pressedButton === "vote" ? "scale-95 brightness-75" : ""}`}`}
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
            className={`px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg ${pressedButton === "proceed" ? "scale-95 brightness-75" : ""}`}
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
            className={`px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg ${pressedButton === "leader" ? "scale-95 brightness-75" : ""}`}
          >
            {t("game.leaderVote")}
          </button>
        )}
      </div>
    </div>
  );
}

export default DesktopGameView;
