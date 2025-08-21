import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import socket from "../socket";
import QuestPopup from "../components/ui/QuestPopup";
import Modals from "../components/ui/Modals";
import QuestVote from "../components/ui/QuestVote";
import PhaseResult from "../components/ui/PhaseResult";
import GameOver from "../components/ui/GameOver";
import WaitScreen from "../components/ui/WaitScreen";
import AnimatedWindow from "../components/ui/Info";

function Game() {
  // Loc, roomSessionKey
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};
  const { t } = useTranslation();
  const roomSessionKey = sessionStorage.getItem("roomSessionKey");
  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  // Show elements
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLeaderVoteModal, setShowLeaderVoteModal] = useState(false);
  const [showQuestVoteModal, setShowQuestVoteModal] = useState(false);
  const [showLeaderVoteButton, setShowLeaderVoteButton] = useState(false);
  const [showQuestVoteButton, setShowQuestVoteButton] = useState(false);
  const [showPlayersVote, setShowPlayersVote] = useState(true);
  const [showQuestVoting, setShowQuestVoting] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showWaitScreen, setShowWaitScreen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  // Arrays
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [phaseResults, setPhaseResults] = useState([]);
  const [character, setCharacter] = useState(null);
  const [leaderVotedPlayers, setLeaderVotedPlayers] = useState([]);
  const [finalTeamSuggestions, setFinalTeamSuggestions] = useState([]);
  const [finalPhaseResults, setFinalPhaseResult] = useState([]);
  const [finalVoteResults, setFinalVoteResults] = useState({});
  const [totalTeamSize, setTotalTeamSize] = useState([]);
  const [gameCharacters, setGameCharacters] = useState([]);
  // Others
  const [roundLeaderId, setRoundLeaderId] = useState();
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(1);
  const [missionTeamSizes, setMissionTeamSizes] = useState(1);
  const [gameResult, setGameResult] = useState("");

  // -------------ΤΗΕ NEW IMPLEMENTATION OF THE SOCKETS------------
  const [room, setRoom] = useState({});

  useEffect(() => {
    socket.on("state_update", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off("state_update");
    };
  }, []);

  // -------------ΤΗΕ NEW IMPLEMENTATION OF THE SOCKETS-------------

  // Assigne Roles to players
  useEffect(() => {
    socket.on(
      "character_assigned",
      ({ character, players, gameCharacters }) => {
        setCharacter(character);
        setPlayers(players);
        setGameCharacters(gameCharacters);
      }
    );
    return () => socket.off("character_assigned");
  }, []);

  // Update the room parameters
  useEffect(() => {
    socket.on(
      "round_update",
      ({ roundLeader, round, phase, missionTeamSizes, totalTeamSize }) => {
        setRoundLeaderId(roundLeader);
        setRound(round);
        setSelectedPlayers([]);
        setFinalTeamSuggestions([]);
        setLeaderVotedPlayers([]);
        setTotalTeamSize(totalTeamSize);
        setMissionTeamSizes(missionTeamSizes);
        setShowPlayersVote(true);
        setHasVoted(false);
        if (phase) setPhase(phase);
      }
    );
    return () => socket.off("round_update");
  }, []);

  // Players voted the players for next quest
  useEffect(() => {
    socket.on("team_voted", ({ success, team, votes }) => {
      setSelectedPlayers([]);
      setShowLeaderVoteButton(true);
      setFinalTeamSuggestions(team);
      setHasVoted(false);
    });
    return () => socket.off("team_voted");
  }, []);

  // Leader selected players for next quest
  useEffect(() => {
    socket.on("leader_voted", ({ votedPlayers }) => {
      setLeaderVotedPlayers(votedPlayers);
      setShowQuestVoteButton(true);
      setShowLeaderVoteButton(false);
    });
    return () => socket.off("leader_voted");
  }, []);

  // Players voted to procceed to quest
  useEffect(() => {
    socket.on("quest_voted", ({ result, votes }) => {
      setTimeout(() => {
        if (result !== "success") {
          setShowPlayersVote(true);
          socket.emit("next_round", { roomSessionKey, playerSessionKey });
        }
      }, 1000);
    });
    return () => socket.off("quest_voted");
  }, [roomSessionKey, leaderVotedPlayers, playerSessionKey]);

  // Selected Players on the quest
  useEffect(() => {
    socket.on("inform_players_to_vote", ({ votedPlayers, waitPlayers }) => {
      setShowPlayersVote(false);
      setShowQuestVoteButton(false);

      if (votedPlayers.includes(playerSessionKey)) {
        setShowQuestVoting(true);
      }

      if (waitPlayers.includes(playerSessionKey)) {
        setShowWaitScreen(true);
      }
    });
    return () => socket.off("inform_players_to_vote");
  }, [playerSessionKey, players]);

  // Announce the quest result
  useEffect(() => {
    socket.on("inform_result", ({ result, success, fail }) => {
      setPhaseResults((prev) => [...prev, result]);
      setFinalPhaseResult((prev) => [...prev, result]);
      setFinalVoteResults({ success: success, fail: fail });
      setShowWaitScreen(false);
      setShowResultScreen(true);
    });

    return () => socket.off("inform_result");
  }, [
    finalPhaseResults,
    finalVoteResults.fail,
    finalVoteResults.success,
    phase,
  ]);

  // Game over
  useEffect(() => {
    socket.on("game_over", ({ result, goodWins, evilWins }) => {
      setShowGameOver(true);
      setGameResult(result);
    });
    return () => socket.off("game_over");
  }, []);

  // Game over
  useEffect(() => {
    socket.on("exit_to_home", () => {
      sessionStorage.removeItem("roomSessionKey");
      sessionStorage.removeItem("playerSessionKey");
      navigate("/", { state: { name } });
    });
    return () => socket.off("exit_to_home");
  }, [name, navigate]);

  if (!character) {
    return (
      <AnimatePresence>
        <motion.div
          className="flex items-center justify-center h-screen bg-gray-900 text-white"
          style={{
            backgroundImage: "url(/images/haunted-house-gothic-style.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl">{t("game.waitingForCharacter")}</h2>
        </motion.div>
      </AnimatePresence>
    );
  }

  const isLeader = playerSessionKey === roundLeaderId;

  return (
    <AnimatePresence>
      <motion.div
        className="relative min-h-screen w-full bg-gray-900 text-white p-2 sm:p-4"
        style={{
          backgroundImage: "url(/images/mythical.jpg      )",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="flex justify-center">
          <img
            src="/images/Sabotage3.png"
            alt="Leader"
            className="mb-10 w-40"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
        </div>

        {/* Mobile Layout */}
        <div className="relative z-10 space-y-4 ">
          {/* Phase/Round/Exit */}
          <div className="flex justify-center items-center h-16 w-full px-4">
            <div className="flex items-center gap-10">
              <button
                onClick={() => setShowExit(true)}
                className={`px-4 py-2  bg-gradient-to-r bg-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition rounded-md font-bold`}
              >
                {t("game.exit")}
              </button>
              <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg p-3 text-center">
                <h3 className="text-center font-semibold mb-2">
                  {t("game.phase")} {phase} - {t("game.round")} {round}
                </h3>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((phaseNum) => {
                    let circleColor = "bg-gray-600";
                    if (phaseNum === phase) {
                      circleColor = "bg-purple-700";
                    } else if (phaseNum < phase) {
                      const result = phaseResults[phaseNum - 1];
                      circleColor =
                        result === "success" ? "bg-amber-500" : "bg-red-500";
                    }
                    return (
                      <div
                        key={phaseNum}
                        className={`w-6 h-6 rounded-full ${circleColor} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {phaseNum}
                      </div>
                    );
                  })}
                </div>
              </div>
              <AnimatedWindow
                triggerLabel={t("game.menu")}
                totalTeamSize={totalTeamSize}
                gameCharacters={gameCharacters}
              />
            </div>
          </div>

          {/* Character Card */}
          <div className="flex justify-center ml-2">
            <div className="flex flex-row space-x-4">
              <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg mx-auto text-center">
                <div className="flex items-center justify-center mb-2">
                  <h2 className="text-lg font-semibold pt-2">{name}</h2>
                  {isLeader && (
                    <img
                      src="/images/Crown.jpg"
                      alt="Leader"
                      className="w-6 h-5 mt-1 ml-2"
                      onError={(e) => (e.target.src = "/images/default.jpg")}
                    />
                  )}
                </div>
                <img
                  src={`/images/${character.name
                    .toLowerCase()
                    .replace(/\s+/g, "_")}.png`}
                  alt={character.name}
                  className="max-w-40 mx-auto mb-2 ml-3 mr-3"
                  onError={(e) => (e.target.src = "/images/default.jpg")}
                />
                <h3 className="text-lg font-bold text-yellow-400">
                  {character.name}
                </h3>
                <p className="text-sm text-gray-300 mb-1">
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

              {/* Players List */}
              <div
                className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg w-48 p-2 mx-auto text-center"
                style={{ gridTemplateColumns: "1fr 1fr auto" }}
              >
                <div
                  className="grid grid-cols-3 text-white font-bold mb-3 border-b border-gray-600 pb-2 text-sm"
                  style={{ gridTemplateColumns: "1fr 1fr auto" }}
                >
                  <h3 className="text-center">{t("lobby.players")}</h3>
                  <h3 className="text-center mr-3">{t("game.role")}</h3>
                  <h3 className="text-center mr-1">L</h3>
                </div>
                <div
                  className="grid grid-cols-3 gap-y-2 text-xs text-gray-300"
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

          {/* Action Buttons - Mobile */}
          <div className="flex justify-center">
            <div className="w-80">
              {showPlayersVote && (
                <button
                  onClick={() => setShowVoteModal(true)}
                  disabled={hasVoted}
                  className={`w-full rounded-lg p-3 mb-2 text-white ${
                    hasVoted
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
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
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-2"
                >
                  {t("game.proceedToQuest")}
                </button>
              )}
              {isLeader && showLeaderVoteButton && (
                <button
                  onClick={() => setShowLeaderVoteModal(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3"
                >
                  {t("game.leaderVote")}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Player and Leader Votes */}
        <QuestPopup
          players={players}
          finalTeamSuggestions={finalTeamSuggestions}
          leaderVotedPlayers={leaderVotedPlayers}
          isLeader={isLeader}
        />

        {/* Voting Modal For All */}
        {showVoteModal && (
          <Modals
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
            setSelectedPlayers={setSelectedPlayers}
            selectedPlayers={selectedPlayers}
            setShowVoteModal={setShowVoteModal}
            setShowPlayersVote={setShowPlayersVote}
            ShowVoteModal={showVoteModal}
            players={players}
            type="voteAll"
            missionTeamSizes={missionTeamSizes}
          />
        )}
        {/* Voting Modal For Leader */}
        {showLeaderVoteModal && (
          <Modals
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
            setSelectedPlayers={setSelectedPlayers}
            selectedPlayers={selectedPlayers}
            setShowVoteModal={setShowVoteModal}
            setShowPlayersVote={setShowPlayersVote}
            setShowLeaderVoteModal={setShowLeaderVoteModal}
            showLeaderVoteModal={showLeaderVoteModal}
            setShowQuestVoteButton={setShowQuestVoteButton}
            players={players}
            type="leaderVote"
            missionTeamSizes={missionTeamSizes}
          />
        )}
        {/* Voting Modal Selected Players */}
        {showQuestVoteModal && (
          <Modals
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
            leaderVotedPlayers={leaderVotedPlayers}
            setShowQuestVoteButton={setShowQuestVoteButton}
            setShowQuestVoteModal={setShowQuestVoteModal}
            showQuestVoteModal={showQuestVoteModal}
            type="questVote"
          />
        )}
        {/* Selected Players Vote */}
        {showQuestVoting && (
          <QuestVote
            setShowQuestVoting={setShowQuestVoting}
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
            show={showQuestVoting}
            phase={phase}
          />
        )}
        {/* Phase Result */}
        {showResultScreen && (
          <PhaseResult
            votes={finalVoteResults}
            setShowResultScreen={setShowResultScreen}
            show={showResultScreen}
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
          />
        )}
        {showGameOver && (
          <GameOver roomSessionKey={roomSessionKey} winner={gameResult} />
        )}
        {showExit && (
          <Modals
            roomSessionKey={roomSessionKey}
            playerSessionKey={playerSessionKey}
            players={players}
            setShowExit={setShowExit}
            showExit={showExit}
            type="exit"
          />
        )}
        {showWaitScreen && (
          <WaitScreen
            roomSessionKey={roomSessionKey}
            leaderVotedPlayers={leaderVotedPlayers}
            setShowWaitScreen={setShowWaitScreen}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default Game;
