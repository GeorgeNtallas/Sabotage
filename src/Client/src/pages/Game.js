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
  const [displayName, setDisplayName] = useState(name || "");
  // preload from cached assign if present (helps on reconnect routing from Lobby)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("lastCharacterPayload");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.character) setCharacter(parsed.character);
        if (Array.isArray(parsed?.players)) setPlayers(parsed.players);
        if (Array.isArray(parsed?.gameCharacters))
          setGameCharacters(parsed.gameCharacters);
        const me = (parsed?.players || []).find(
          (p) => p.playerSessionKey === playerSessionKey
        );
        if (me?.name) setDisplayName(me.name);
      }
    } catch {}
  }, []);
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
  const [waitingForReconnect, setWaitingForReconnect] = useState(null);

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

  // Request game state on mount for rejoining players
  useEffect(() => {
    if (roomSessionKey && playerSessionKey) {
      socket.emit("request_game_state", { roomSessionKey, playerSessionKey });
    }
  }, [roomSessionKey, playerSessionKey]);

  // Listen for game state response
  useEffect(() => {
    socket.on("game_state_response", ({ phaseResults: serverPhaseResults }) => {
      if (serverPhaseResults && Array.isArray(serverPhaseResults)) {
        setPhaseResults(serverPhaseResults);
      }
    });
    return () => socket.off("game_state_response");
  }, []);

  // Assigne Roles to players
  useEffect(() => {
    socket.on(
      "character_assigned",
      ({ character, players: assignedPlayers, gameCharacters }) => {
        setCharacter(character);
        setPlayers(assignedPlayers);
        setGameCharacters(gameCharacters);
        setWaitingForReconnect(null);

        // cache for seamless reconnect rendering
        try {
          sessionStorage.setItem(
            "lastCharacterPayload",
            JSON.stringify({
              character,
              players: assignedPlayers,
              gameCharacters,
            })
          );
        } catch {}

        // Update my display name on initial assign or reconnect
        const me = (assignedPlayers || []).find(
          (p) => p.playerSessionKey === playerSessionKey
        );
        if (me && me.name) setDisplayName(me.name);
      }
    );
    return () => socket.off("character_assigned");
  }, [playerSessionKey]);

  // clear cache once we have rendered at least once with live data
  useEffect(() => {
    if (character) {
      try {
        sessionStorage.removeItem("lastCharacterPayload");
      } catch {}
    }
  }, [character]);

  useEffect(() => {
    socket.on("room_update", ({ playerList }) => {
      const list = playerList.playerList || playerList;
      const online = (list || []).filter((p) => p.online);
      setPlayers(online);

      // Keep my display name in sync with server data
      const me = online.find((p) => p.playerSessionKey === playerSessionKey);
      if (me && me.name) setDisplayName(me.name);
    });
    return () => socket.off("room_update");
  }, [playerSessionKey]);

  useEffect(() => {
    socket.on("player_logged_off", ({ name }) => {
      setWaitingForReconnect(`${name} logged off — waiting for reconnect`);
      setShowVoteModal(false);
      setShowLeaderVoteModal(false);
      setShowQuestVoteModal(false);
      setShowLeaderVoteButton(false);
      setShowQuestVoteButton(false);
      setShowQuestVoting(false);
      setShowResultScreen(false);
      setShowGameOver(false);
      setShowExit(false);
      setShowWaitScreen(false);
      setHasVoted(false);
      setShowPlayersVote(true);
    });
    socket.on("player_reconnected", () => {
      setWaitingForReconnect(null);
    });
    return () => {
      socket.off("player_logged_off");
      socket.off("player_reconnected");
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const leave = window.confirm(
        "Leave the room? This will remove you from the game."
      );
      if (leave) {
        socket.emit("exit", { roomSessionKey, playerSessionKey });
        sessionStorage.removeItem("roomSessionKey");
        navigate("/", { replace: true });
      } else {
        navigate(location.pathname + location.search, {
          replace: true,
          state: location.state,
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    // ensure a history entry exists so popstate fires when back pressed
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [roomSessionKey, playerSessionKey, navigate]);

  // Update the room parameters
  useEffect(() => {
    socket.on(
      "round_update",
      ({
        roundLeader,
        round,
        phase,
        missionTeamSizes,
        totalTeamSize,
        phaseResults,
      }) => {
        console.log("round_update received:", { roundLeader, round, phase });
        setRoundLeaderId(roundLeader);
        setRound(round);
        setSelectedPlayers([]);
        setFinalTeamSuggestions([]);
        setLeaderVotedPlayers([]);
        setTotalTeamSize(totalTeamSize);
        setMissionTeamSizes(missionTeamSizes);
        setShowPlayersVote(true);
        setHasVoted(false);
        setWaitingForReconnect(null);
        if (phase) setPhase(phase);

        // Set phase results for rejoining players - don't clear existing results
        if (
          phaseResults &&
          Array.isArray(phaseResults) &&
          phaseResults.length > 0
        ) {
          setPhaseResults(phaseResults);
        }
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
      setPhaseResults((prev) => {
        const newResults = [...prev, result];
        return newResults;
      });
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

  // Debug logging
  console.log("Leader check:", { playerSessionKey, roundLeaderId, isLeader });

  return (
    <AnimatePresence>
      <motion.div //TODO: Make the background more alive (add animation or wind)
        className="relative w-full bg-gray-900 text-white overflow-y-auto"
        style={{
          backgroundImage: "url(/images/mythical.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          margin: 0,
          padding: 0,
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
                      // Current active phase
                      circleColor = "bg-cyan-600";
                    } else if (phaseNum < phase) {
                      // Completed phases - use finalPhaseResults or default to success
                      const result =
                        finalPhaseResults[phaseNum - 1] ||
                        phaseResults[phaseNum - 1] ||
                        "success";
                      circleColor =
                        result === "success" ? "bg-amber-500" : "bg-red-500";
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
                            : {}
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
              />
            </div>
          </div>

          {/* Character Card */}
          <div className="flex justify-center ml-2">
            <div className="flex flex-row space-x-4">
              <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg mx-auto text-center">
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
                {character.name.toLowerCase() === "knight" ? (
                  <div className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-amber-900 overflow-hidden">
                    <img
                      src="/images/Knight/Knight-background.webp"
                      alt="Knight"
                      className="w-full h-full"
                    />
                    <img
                      src="/images/Knight/Knight-body.webp"
                      alt="Knight Torso"
                      className="absolute inset-0 w-full h-full animate-breathe"
                    />
                    <img
                      src="/images/Knight/Knight_head.webp"
                      alt="Knight Head"
                      className="absolute inset-0 w-full h-full animate-head"
                    />
                    <img
                      src="/images/Knight/Knight-cape.webp"
                      alt="Knight Cape"
                      className="absolute inset-0 w-full h-full animate-cape"
                    />
                  </div>
                ) : character.name.toLowerCase() === "thrall" ? (
                  <div className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-green-900 overflow-hidden">
                    <img
                      src="/images/Thrall/Thrall-background.webp"
                      alt="Thrall"
                      className="w-full h-full"
                    />
                    <img
                      src="/images/Thrall/Thrall-body.webp"
                      alt="Thrall Body"
                      className="absolute inset-0 w-full h-full animate-breathe"
                    />
                    <img
                      src="/images/Thrall/Thrall-head.webp"
                      alt="Thrall Head"
                      className="absolute inset-0 w-full h-full animate-head"
                    />
                  </div>
                ) : character.name.toLowerCase() === "draven" ? (
                  <div className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-gray-900 overflow-hidden">
                    <img
                      src="/images/Draven/Draven-background.webp"
                      alt="Draven"
                      className="w-full h-full"
                    />
                    <img
                      src="/images/Draven/Draven-body.webp"
                      alt="Draven Body"
                      className="absolute inset-0 w-full h-full animate-breathe"
                    />
                    <img
                      src="/images/Draven/Draven-trees.webp"
                      alt="Draven Trees"
                      className="absolute inset-0 w-full h-full animate-trees"
                    />
                    <img
                      src="/images/Draven/Draven-trees1.webp"
                      alt="Draven Trees 1"
                      className="absolute inset-0 w-full h-full animate-trees"
                    />
                    <img
                      src="/images/Draven/Draven-plants.webp"
                      alt="Draven Plants"
                      className="absolute inset-0 w-full h-full animate-leaves"
                    />
                    <img
                      src="/images/Draven/Draven-plants1.webp"
                      alt="Draven Plants 1"
                      className="absolute inset-0 w-full h-full animate-leaves"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </div>
                ) : character.name.toLowerCase() === "guardian" ? (
                  <div className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-zinc-900 overflow-hidden">
                    <img
                      src="/images/Guardian/Guardian-background.webp"
                      alt="Guardian"
                      className="w-full h-full block"
                    />
                    <img
                      src="/images/Guardian/Guardian-body.webp"
                      alt="Guardian Body"
                      className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
                    />
                    <img
                      src="/images/Guardian/Guardian-head.webp"
                      alt="Guardian Head"
                      className="absolute inset-0 w-full h-full animate-head pointer-events-none"
                    />
                    <img
                      src="/images/Guardian/Guardian-arm.webp"
                      alt="Guardian Arm"
                      className="absolute inset-0 w-full h-full animate-arm pointer-events-none"
                    />
                    <img
                      src="/images/Guardian/Guardian-light.webp"
                      alt="Guardian Light"
                      className="absolute inset-0 w-full h-full animate-candlelight pointer-events-none"
                    />
                  </div>
                ) : character.name.toLowerCase() === "seraphina" ? (
                  <div
                    className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-red-900 overflow-hidden"
                    style={{ isolation: "isolate" }}
                  >
                    <img
                      src="/images/Seraphina/Seraphina-background.webp"
                      alt="Seraphina"
                      className="w-full h-full block"
                    />
                    <img
                      src="/images/Seraphina/Seraphina- body.webp"
                      alt="Seraphina Body"
                      className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
                    />
                    <img
                      src="/images/Seraphina/Seraphina-head.webp"
                      alt="Seraphina Head"
                      className="absolute inset-0 w-full h-full animate-head pointer-events-none"
                    />
                    <img
                      src="/images/Seraphina/Seraphina-light.webp"
                      alt="Seraphina Light"
                      className="absolute inset-0 w-full h-full animate-candlelight pointer-events-none"
                    />
                  </div>
                ) : character.name.toLowerCase() === "shade" ? (
                  <div className="relative max-w-40 mx-auto mb-2 ml-3 mr-3 bg-gray-900 overflow-hidden">
                    <img
                      src="/images/Shade/Shade-background.webp"
                      alt="Shade"
                      className="w-full h-full block"
                    />
                    <img
                      src="/images/Shade/Shade-body.webp"
                      alt="Shade Body"
                      className="absolute inset-0 w-full h-full animate-breathe pointer-events-none"
                    />
                  </div>
                ) : (
                  <img
                    src={`/images/${character.name
                      .toLowerCase()
                      .replace(/\s+/g, "_")}.png`}
                    alt={character.name}
                    className="max-w-40 mx-auto mb-2 ml-3 mr-3"
                    onError={(e) => (e.target.src = "/images/default.jpg")}
                  />
                )}
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

          {/* Player and Leader Votes */}
          <QuestPopup
            players={players}
            finalTeamSuggestions={finalTeamSuggestions}
            leaderVotedPlayers={leaderVotedPlayers}
            isLeader={isLeader}
          />
        </div>
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
        {waitingForReconnect && ( //TODO: Fix the ui
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white text-black p-6 rounded-md">
              <h3 className="font-bold mb-2">{waitingForReconnect}</h3>
              <p>Please wait until they reconnect...</p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default Game;

//TODO: Να βαλω δρακο να πεταει στο background ειπε η Αλεξια
