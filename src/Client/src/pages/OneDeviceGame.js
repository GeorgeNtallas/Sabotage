import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ReactCardFlip from "react-card-flip";
import socket from "../socket";
import Draggable from "react-draggable";
import GameOver from "../components/ui/GameOver";
import AnimatedWindow from "../components/ui/Info";
import { use } from "i18next";

function OneDeviceGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { characters, players, missionteamSizes, name, isLeader, newRoomName } =
    location.state || {};
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScrollPosition, setModalScrollPosition] = useState(0);
  const [fadeGen, setfadeGen] = useState(false);
  const [fadePlayer, setfadePlayer] = useState(false);
  const { t } = useTranslation();

  // Show elements
  const [showExit, setShowExit] = useState(false);
  const [showQuestVoteModal, setShowQuestVoteModal] = useState(false);
  const [showPlayersVoteModal, setShowPlayersVoteModal] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  // Others
  const [phaseResults, setPhaseResults] = useState([]);
  const [phaseHistory, setPhaseHistory] = useState([]);
  const [pressedButton, setPressedButton] = useState(null);
  const [roundLeaderId, setRoundLeaderId] = useState();
  const [usedRoundLeaders, setUsedRoundLeaders] = useState([]);
  const [leaderVotedPlayers, setLeaderVotedPlayers] = useState([]);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(1);
  const [missionTeamSizes, setMissionTeamSizes] = useState(missionteamSizes);
  const [gameResult, setGameResult] = useState("");
  const [phaseVoters, setPhaseVoters] = useState({});
  const [game_started, setGameStarted] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [buttonOrder, setButtonOrder] = useState(["success", "fail"]);

  // Function to randomize button order
  const randomizeButtonOrder = () => {
    const buttons = ["success", "fail"];
    // Fisher-Yates shuffle for better randomization
    for (let i = buttons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
    }
    setButtonOrder(buttons);
  };
  const [currentVotingPlayerIndex, setCurrentVotingPlayerIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState([]);
  const [currentFlipping, setCurrentFlipping] = useState(-1);
  const [votes, setVotes] = useState({ success: 0, fail: 0 });
  const [shuffled, setShuffled] = useState([]);
  const [maxModalHeight, setMaxModalHeight] = useState(0);

  const roomSessionKey = sessionStorage.getItem("roomSessionKey");
  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  useEffect(() => {
    setfadeGen(true);
    setfadePlayer(true);
  }, []);

  // Game over
  useEffect(() => {
    socket.on(
      "exit_to_lobby",
      ({ leader, isPublic, password, roomName, readyList }) => {
        // Empty client state
        setPhaseResults([]);
        setPressedButton(null);
        setRoundLeaderId();
        setUsedRoundLeaders([]);
        setLeaderVotedPlayers([]);
        setRound(1);
        setPhase(1);
        setMissionTeamSizes(missionteamSizes);
        setGameResult("");
        setPhaseVoters({});
        setGameStarted(false);
        setSelectedPlayers([]);
        setShowGameOver(false);
        navigate(`/onedevice?${roomSessionKey}`, {
          state: {
            name: name,
            isLeader: isLeader,
            newRoomName: newRoomName,
          },
        });
      },
    );
    return () => socket.off("exit_to_home");
  }, [name, navigate]);

  const handleExitClick = () => {
    socket.emit("exit", { roomSessionKey, playerSessionKey });
    sessionStorage.removeItem("roomSessionKey");
    navigate(`/`);
  };

  // Next player
  const handleNextPlayer = () => {
    if (!game_started) {
      setfadePlayer(false);

      setTimeout(() => {
        setCurrentPlayerIndex((prev) => prev + 1);
        setModalScrollPosition(0);

        // Fade back in
        setfadePlayer(true);
      }, 500); // must match transition duration
    } else {
    }
  };

  const handleStartGame = () => {
    setfadeGen(false);

    setTimeout(() => {
      // Initialize round leader
      const randomIndex = Math.floor(Math.random() * players.length);
      setRoundLeaderId(players[randomIndex].playerSessionKey);
      setUsedRoundLeaders([players[randomIndex].playerSessionKey]);

      // Fade back in
      setGameStarted(true);
      setfadeGen(true);
    }, 1000); // must match transition duration
  };

  const nextRound = () => {
    setfadeGen(false);

    setTimeout(() => {
      setSelectedPlayers([]);
      pickNewRoundLeader();
      setRound((prevRound) => prevRound + 1);
      setfadeGen(true);
    }, 1000);
  };

  const playersVote = () => {
    setPhaseVoters({});
    setCurrentVotingPlayerIndex(0);
    randomizeButtonOrder(); // Randomize button order before showing modal
    setShowPlayersVoteModal(true);
  };

  const showResults = (voters) => {
    const successVotes = Object.values(voters).filter(
      (vote) => vote === "success",
    ).length;

    const failVotes = Object.values(voters).filter(
      (vote) => vote === "fail",
    ).length;

    setVotes({ success: successVotes, fail: failVotes });
    setShowPlayersVoteModal(false);
    setTimeout(() => {
      setShowResultScreen(true);
    }, 3000);
  };

  const nextPhase = () => {
    // Use functional update to ensure we're working with the latest phaseResults state
    setPhaseResults((prevPhaseResults) => {
      const phaseResult = votes.fail >= 1 ? "fail" : "success";
      const newPhaseResults = [...prevPhaseResults, phaseResult];

      // Add phase history
      const voterPlayerNames = Object.keys(phaseVoters).map((sessionKey) => {
        const player = players.find((p) => p.playerSessionKey === sessionKey);
        return player?.name || "Unknown";
      });

      setPhaseHistory((prev) => [
        ...prev,
        {
          phaseNumber: phase,
          result: phaseResult,
          voters: voterPlayerNames,
        },
      ]);

      // Check for game over conditions with the updated results
      const evilWins = newPhaseResults.filter((r) => r === "fail").length >= 3;
      const goodWins =
        newPhaseResults.filter((r) => r === "success").length >= 3;

      if (!evilWins && !goodWins) {
        // Continue to next phase
        setPhase((prevPhase) => prevPhase + 1);
        setShowResultScreen(false);
        setVotes({ success: 0, fail: 0 });
        setSelectedPlayers([]);
        pickNewRoundLeader();
        setShuffled([]);
        setFlippedCards([]);
        setCurrentFlipping(-1);
      } else {
        // Game over logic
        if (evilWins) {
          setGameResult("evil");
        } else if (goodWins) {
          setGameResult("good");
        }

        setShowResultScreen(false);
        setVotes({ success: 0, fail: 0 });
        setShuffled([]);
        setFlippedCards([]);
        setCurrentFlipping(-1);
        setShowGameOver(true);
      }

      return newPhaseResults;
    });
  };
  // Function to pick new round leader
  const pickNewRoundLeader = () => {
    // Get available players who haven't been leaders yet
    const availablePlayers = players.filter(
      (player) => !usedRoundLeaders.includes(player.playerSessionKey),
    );

    let newLeaderId;
    let newUsedLeaders;

    if (availablePlayers.length === 0) {
      // All players have been leaders, reset the used leaders array
      const randomIndex = Math.floor(Math.random() * players.length);
      newLeaderId = players[randomIndex].playerSessionKey;
      newUsedLeaders = [newLeaderId];
    } else {
      // Pick a random available player
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      newLeaderId = availablePlayers[randomIndex].playerSessionKey;
      newUsedLeaders = [...usedRoundLeaders, newLeaderId];
    }

    setRoundLeaderId(newLeaderId);
    setUsedRoundLeaders(newUsedLeaders);
  };

  useEffect(() => {
    if (!votes || !showResultScreen) return;

    const cards = [];

    for (let i = 0; i < votes.success; i++)
      cards.push({ id: i, type: "success" });

    for (let i = 0; i < votes.fail; i++)
      cards.push({ id: votes.success + i, type: "fail" });

    setShuffled(cards);
    setFlippedCards([]);

    const blinkDuration = 4000;
    const flipInterval = 4000;
    const lastCardExtraDelay = 4000;

    // 🔥 All cards blink
    setCurrentFlipping(-2);

    const timeouts = [];

    cards.forEach((card, index) => {
      let delay = blinkDuration + index * flipInterval;

      if (index === cards.length - 1) {
        delay += lastCardExtraDelay;
      }

      const timeoutId = setTimeout(() => {
        setFlippedCards((prev) => [...prev, card.id]);

        // 🛑 Stop blinking ONLY after last card flips
        if (index === cards.length - 1) {
          setCurrentFlipping(-1);

          setTimeout(() => {
            nextPhase();
          }, 5000);
        }
      }, delay);

      timeouts.push(timeoutId);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [votes, showResultScreen]);

  if (showResultScreen) {
    const cards = [];
    for (let i = 0; i < votes.success; i++)
      cards.push({ id: i, type: "success" });
    for (let i = 0; i < votes.fail; i++)
      cards.push({ id: votes.success + i, type: "fail" });
  }

  // Get current player info
  const currentPlayer = players[currentPlayerIndex];
  const currentCharacter = characters[currentPlayer.playerSessionKey];

  // Calculate visible role based on viewer and target characters
  const calculateVisibleRole = (viewerCharacter, targetCharacter) => {
    if (!viewerCharacter || !targetCharacter) return "";
    const viewer = viewerCharacter.name;
    const target = targetCharacter.name;
    const targetTeam = targetCharacter.team;

    if (viewer === "Seer" && targetTeam === "evil" && target !== "Draven")
      return "evil";
    if (viewer === "Guardian" && (target === "Seer" || target === "Seraphina"))
      return "Seer/Seraphina";
    if (
      ["Seraphina", "Shade", "Thrall", "Draven"].includes(viewer) &&
      target !== "Kaelen" &&
      targetTeam === "evil"
    )
      return "evil";
    // Kaelen is evil and doesn't see any players
    if (viewer === "Kaelen") return "";
    return "";
  };

  // Calculate visible players based on character rules
  const visiblePlayers = React.useMemo(() => {
    if (!currentCharacter) return [];

    return players
      .filter((p) => p.playerSessionKey !== currentPlayer.playerSessionKey)
      .map((p) => {
        const targetChar = characters[p.playerSessionKey];
        const visibleRole = calculateVisibleRole(currentCharacter, targetChar);
        return visibleRole
          ? { playerSessionKey: p.playerSessionKey, role: visibleRole }
          : null;
      })
      .filter(Boolean);
  }, [currentCharacter, players, characters, currentPlayer]);

  // Calculate max modal height for all players
  React.useEffect(() => {
    if (!players || !characters) return;

    let maxVisible = 0;
    players.forEach((player) => {
      const char = characters[player.playerSessionKey];
      if (!char) return;

      const visible = players
        .filter((p) => p.playerSessionKey !== player.playerSessionKey)
        .map((p) => {
          const targetChar = characters[p.playerSessionKey];
          const role = calculateVisibleRole(char, targetChar);
          return role ? 1 : 0;
        })
        .reduce((sum, val) => sum + val, 0);

      if (visible > maxVisible) maxVisible = visible;
    });

    const baseHeight = 350;
    const perPlayerHeight = 20;
    setMaxModalHeight(baseHeight + maxVisible * perPlayerHeight);
  }, [players, characters]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeGen ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="w-full h-full bg-black"
      >
        {!game_started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: fadePlayer ? 1 : 0 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            className="w-full min-h-screen flex flex-col"
            style={{
              backgroundImage: "url(/images/haunted-house-gothic-style.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-purple-950/20"></div>
            <div className="flex-1 overflow-y-auto pb-20 sm:pb-24">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                {/* Player's Name */}
                <h2
                  className="mt-4 sm:mt-6 mb-4 sm:mb-6 text-center text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 px-4 z-20"
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {currentPlayer.name}
                </h2>

                <div className="relative w-full max-w-[75%] sm:max-w-xs">
                  <Draggable
                    axis="y"
                    bounds={{ top: -maxModalHeight, bottom: 0 }}
                    position={{ x: 0, y: 0 }}
                    onStop={(e, data) => {
                      if (data.y < 0) {
                        data.node.style.transform = "translate(0px, 0px)";
                      }
                    }}
                  >
                    <div
                      className="absolute w-full z-20 bg-black/95 text-white p-2 sm:p-3 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] border-2 border-cyan-500/50 flex flex-col items-center justify-end"
                      style={{
                        height: "100%",
                        minHeight: `${maxModalHeight}px`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/80 z-10"></div>
                      <div className="text-center z-20">
                        <div className="text-4xl sm:text-5xl md:text-7xl mb-3 sm:mb-4 z-20 text-cyan-400">
                          ↑
                        </div>
                        <p
                          className="text-center text-sm sm:text-base md:text-lg font-medium text-cyan-300 mb-3 sm:mb-4 z-20"
                          style={{ fontFamily: "MedievalSharp" }}
                        >
                          Drag Up to Reveal
                        </p>
                      </div>
                    </div>
                  </Draggable>

                  {/* Modal for Character Display */}
                  <div
                    className="border-2 border-cyan-500/50 text-white p-2 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] w-full flex flex-col items-center justify-center space-y-3 sm:space-y-4 relative overflow-hidden"
                    style={{
                      minHeight: `${maxModalHeight}px`,
                      background:
                        "linear-gradient(135deg, #0a0e1a 0%, #0d1117 25%, #0a0e1a 50%, #0d1117 75%, #0a0e1a 100%), repeating-linear-gradient(0deg, rgba(6,182,212,0.1) 0px, transparent 1px, transparent 40px, rgba(6,182,212,0.1) 41px), repeating-linear-gradient(90deg, rgba(168,85,247,0.05) 0px, transparent 1px, transparent 40px, rgba(168,85,247,0.05) 41px)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-black/50 to-purple-950/30"></div>
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                    <div className="relative w-full flex flex-col items-center justify-center p-2 sm:p-3 md:p-4">
                      <img
                        src={`/images/${currentCharacter.name}Icon.png`}
                        alt="Character"
                        className="w-32 h-32 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full mb-2 sm:mb-3 md:mb-4 border-2 border-cyan-500"
                        onError={(e) => (e.target.src = "/images/default.jpg")}
                      />
                      <p
                        className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        {currentCharacter.name}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg text-cyan-200 mt-1 sm:mt-2 font-light text-center px-2">
                        {currentCharacter.description}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg text-cyan-300 mt-1 sm:mt-2 font-light">
                        Team:{" "}
                        <span
                          className={
                            currentCharacter.team === "evil"
                              ? "text-red-500"
                              : "text-emerald-400"
                          }
                        >
                          {currentCharacter.team}
                        </span>
                      </p>
                      {visiblePlayers && visiblePlayers.length > 0 && (
                        <div className="mt-2 sm:mt-3 md:mt-4 w-full bg-zinc-900/50 border border-cyan-500/30 p-2 sm:p-3 rounded-lg">
                          <p
                            className="text-sm sm:text-base md:text-lg font-bold text-cyan-400 mb-2"
                            style={{ fontFamily: "MedievalSharp" }}
                          >
                            You can see:
                          </p>
                          <div className="space-y-2">
                            {visiblePlayers.map((visible) => {
                              const visiblePlayer = players.find(
                                (p) =>
                                  p.playerSessionKey ===
                                  visible.playerSessionKey,
                              );
                              return (
                                <p
                                  key={visible.playerSessionKey}
                                  className="text-xs sm:text-sm md:text-base text-cyan-200 font-medium"
                                >
                                  {visiblePlayer?.name || "Unknown"} -{" "}
                                  <span className="text-red-500 font-bold">
                                    {visible.role}
                                  </span>
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instruction Text */}
                <p
                  className="text-center text-sm sm:text-base md:text-lg font-medium text-cyan-300 px-4 z-20"
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  Pass device to the next knight
                </p>
              </div>
            </div>

            {/* Button at the Bottom */}
            <div className="fixed bottom-10 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent py-2 sm:py-3 md:py-4 flex justify-center">
              {currentPlayerIndex < players.length - 1 && (
                <button
                  onClick={handleNextPlayer}
                  className="w-32 sm:w-36 md:w-40 bg-gradient-to-r from-cyan-900/80 to-cyan-800/80 hover:from-cyan-800/80 hover:to-cyan-700/80 text-white py-2 px-3 sm:px-4 rounded-md font-bold text-xs sm:text-sm md:text-base shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-500/50"
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  Next Knight
                </button>
              )}

              {currentPlayerIndex === players.length - 1 && (
                <button
                  onClick={handleStartGame}
                  className="w-32 sm:w-36 md:w-40 bg-gradient-to-r from-purple-900/80 to-purple-800/80 hover:from-purple-800/80 hover:to-purple-700/80 text-white py-2 px-3 sm:px-4 rounded-md font-bold text-xs sm:text-sm md:text-base shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-500/50"
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  🗡️ Begin Quest
                </button>
              )}
            </div>
          </motion.div>
        )}
        {game_started && (
          <div
            className="relative w-full bg-gray-900 text-white"
            style={{
              backgroundImage: "url(/images/mythical.jpg)",
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
            <div className="flex justify-center items-center h-12 sm:h-16 w-full">
              <img
                src="/images/Sabotage3.png"
                alt="Leader"
                className="w-32 sm:w-44 mr-3"
                onError={(e) => (e.target.src = "/images/default.jpg")}
              />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center h-12 sm:h-16 w-full px-2 sm:px-4 mt-3 sm:mt-5">
                <button
                  onClick={() => handleExitClick()}
                  onMouseDown={() => setPressedButton("exit")}
                  onMouseUp={() => setPressedButton(null)}
                  onMouseLeave={() => setPressedButton(null)}
                  onTouchStart={() => setPressedButton("exit")}
                  onTouchEnd={() => setPressedButton(null)}
                  className={`px-3 py-2 bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800/80 hover:to-red-700/80 transition rounded-md font-bold border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] ${
                    pressedButton === "exit" ? "scale-95 brightness-75" : ""
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {t("game.exit")}
                </button>
                <div className="bg-black/95 border border-cyan-500/30 rounded-lg p-2 sm:p-3 text-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <h3
                    className="text-center text-xs sm:text-base font-semibold mb-1 sm:mb-2 text-cyan-400"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
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
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${circleColor} flex items-center justify-center text-white text-xs font-bold`}
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
                  totalTeamSize={missionteamSizes}
                  gameCharacters={Object.values(characters)}
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

              {/* Big UI for Round Leader and Players */}
              <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mt-4 sm:mt-8">
                <div className="bg-black/95 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] p-3 sm:p-6 ">
                  {/* Round Leader */}
                  <div className="text-center">
                    <p
                      className="text-lg sm:text-2xl font-bold text-cyan-200"
                      style={{ fontFamily: "MedievalSharp" }}
                    >
                      Quest Leader:{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        {
                          players.find(
                            (player) =>
                              player.playerSessionKey === roundLeaderId,
                          )?.name
                        }
                      </span>
                    </p>
                    <p
                      className="text-sm sm:text-md text-cyan-300 mt-1 sm:mt-2"
                      style={{ fontFamily: "MedievalSharp" }}
                    >
                      {t("game.pick")}
                      <span className="text-cyan-400 font-bold">
                        {missionTeamSizes[phase - 1]}
                      </span>{" "}
                      {t("game.players")}
                    </p>
                  </div>
                  {/* Other Players with Switches */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                      {players
                        .filter((player) => player.playerSessionKey)
                        .map((player, index, array) => {
                          const isLastItem = index === array.length - 1;
                          const isOddCount = array.length % 2 === 1;
                          const shouldCenter = isLastItem && isOddCount;

                          if (shouldCenter) {
                            return (
                              <div
                                key={player.playerSessionKey}
                                className="col-span-2 flex justify-center "
                              >
                                <div className="flex items-center justify-between p-2 bg-zinc-900/50 border border-cyan-500/30 rounded-lg w-full max-w-[calc(50%-0.375rem)]">
                                  {/* Player Name */}
                                  <span
                                    className="text-cyan-200 font-medium"
                                    style={{ fontFamily: "MedievalSharp" }}
                                  >
                                    {player.name}
                                  </span>
                                  {/* Switch */}
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={selectedPlayers.includes(
                                        player.playerSessionKey,
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          if (
                                            selectedPlayers.length <
                                            missionTeamSizes[phase - 1]
                                          ) {
                                            setSelectedPlayers([
                                              ...selectedPlayers,
                                              player.playerSessionKey,
                                            ]);
                                          }
                                        } else {
                                          setSelectedPlayers(
                                            selectedPlayers.filter(
                                              (id) =>
                                                id !== player.playerSessionKey,
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                  </label>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={player.playerSessionKey}
                              className="flex items-center justify-between p-2 bg-zinc-900/50 border border-cyan-500/30 rounded-lg"
                            >
                              {/* Player Name */}
                              <span
                                className="text-cyan-200 font-medium"
                                style={{ fontFamily: "MedievalSharp" }}
                              >
                                {player.name}
                              </span>
                              {/* Switch */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={selectedPlayers.includes(
                                    player.playerSessionKey,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      if (
                                        selectedPlayers.length <
                                        missionTeamSizes[phase - 1]
                                      ) {
                                        setSelectedPlayers([
                                          ...selectedPlayers,
                                          player.playerSessionKey,
                                        ]);
                                      }
                                    } else {
                                      setSelectedPlayers(
                                        selectedPlayers.filter(
                                          (id) =>
                                            id !== player.playerSessionKey,
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  {/* Submit Button - Bottom Center */}
                  <div className="mt-3 sm:mt-5 flex justify-center">
                    <button
                      disabled={
                        selectedPlayers.length !== missionTeamSizes[phase - 1]
                      }
                      onClick={() => {
                        setShowQuestVoteModal(true);
                      }}
                      onMouseDown={() => setPressedButton("submit")}
                      onMouseUp={() => setPressedButton(null)}
                      onMouseLeave={() => setPressedButton(null)}
                      onTouchStart={() => setPressedButton("submit")}
                      onTouchEnd={() => setPressedButton(null)}
                      className={`w-36 sm:w-48 px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-xl font-bold shadow-lg ${
                        selectedPlayers.length !== missionTeamSizes[phase - 1]
                          ? "bg-zinc-800/50 border border-zinc-700/50 cursor-not-allowed"
                          : `bg-gradient-to-r from-cyan-900/80 to-cyan-800/80 hover:from-cyan-800/80 hover:to-cyan-700/80 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)] ${
                              pressedButton === "submit"
                                ? "scale-95 brightness-75"
                                : ""
                            }`
                      }`}
                      style={{ fontFamily: "MedievalSharp" }}
                    >
                      {t("game.submit")}
                    </button>
                  </div>
                </div>
                {/* Phase History */}

                <div className="mt-2 sm:mt-3 bg-black/95 border border-cyan-500/30 rounded-lg p-2 sm:p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <h3
                    className="text-lg sm:text-xl font-bold text-cyan-400 mb-1 text-center"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    Quest History
                  </h3>
                  <div className="space-y-2">
                    {phaseHistory.map((item, index) => (
                      <div
                        key={index}
                        className="bg-zinc-900/50 border border-cyan-500/30 rounded-lg p-1 flex items-center gap-2 sm:gap-4 overflow-x-auto"
                      >
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-sm sm:text-md font-semibold text-cyan-200"
                            style={{ fontFamily: "MedievalSharp" }}
                          >
                            Phase {item.phaseNumber}:
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                              item.result === "success"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.result === "success" ? "Success" : "Fail"}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {item.voters.map((voter, voterIndex) => (
                            <span
                              key={voterIndex}
                              className="bg-zinc-800 border border-cyan-500/30 text-cyan-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs"
                            >
                              {voter}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {showQuestVoteModal && (
              <div className="flex bg-black/98 fixed top-0 left-0 w-full h-full items-center justify-center z-50">
                <div className="bg-black/98 border-2 border-cyan-500/50 rounded-lg p-6 w-50 max-w-md relative shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                  <h3
                    className="text-xl text-center font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {t("modals.proceedToQuest")}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <label className="flex justify-center gap-10 text-white">
                      <button
                        onClick={() => {
                          setShowQuestVoteModal(false);
                          playersVote();
                        }}
                        onMouseDown={() => setPressedButton("yes")}
                        onMouseUp={() => setPressedButton(null)}
                        onMouseLeave={() => setPressedButton(null)}
                        onTouchStart={() => setPressedButton("yes")}
                        onTouchEnd={() => setPressedButton(null)}
                        className={`px-4 py-2 bg-gradient-to-r from-cyan-900/80 to-cyan-800/80 hover:from-cyan-800/80 hover:to-cyan-700/80 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-500/50 ${
                          pressedButton === "yes"
                            ? "scale-95 brightness-75"
                            : ""
                        }`}
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        {t("modals.yes")}
                      </button>
                      <button
                        onClick={() => {
                          setShowQuestVoteModal(false);
                          nextRound();
                        }}
                        onMouseDown={() => setPressedButton("no")}
                        onMouseUp={() => setPressedButton(null)}
                        onMouseLeave={() => setPressedButton(null)}
                        onTouchStart={() => setPressedButton("no")}
                        onTouchEnd={() => setPressedButton(null)}
                        className={`px-4 py-2 bg-gradient-to-r from-slate-900/80 to-slate-800/80 hover:from-slate-800/80 hover:to-slate-700/80 text-white rounded-lg font-bold shadow-lg border border-slate-700/50 ${
                          pressedButton === "no" ? "scale-95 brightness-75" : ""
                        }`}
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        {t("modals.no")}
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {showPlayersVoteModal && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
                style={{
                  backgroundImage:
                    "url(/images/3d-grunge-brick-interior-with-spotlight-shining-down.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                {/* Current Player Name with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVotingPlayerIndex}
                    className="absolute top-28 left-0 right-0 z-20 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <h3
                      className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center"
                      style={{ fontFamily: "MedievalSharp" }}
                    >
                      {
                        players.find(
                          (player) =>
                            player.playerSessionKey ===
                            selectedPlayers[currentVotingPlayerIndex],
                        )?.name
                      }
                    </h3>
                  </motion.div>
                </AnimatePresence>

                {/* Vote Buttons with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVotingPlayerIndex}
                    className="flex flex-col md:flex-row gap-8 z-20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {buttonOrder.map((voteType) => {
                      const isSuccess = voteType === "success";
                      return (
                        <button
                          key={voteType}
                          onClick={() => {
                            randomizeButtonOrder();
                            setCurrentVotingPlayerIndex((prevIndex) => {
                              const playerToVote = selectedPlayers[prevIndex];

                              setPhaseVoters((prevVoters) => {
                                const updated = {
                                  ...prevVoters,
                                  [playerToVote]: voteType,
                                };

                                // If this was the last player
                                if (prevIndex === selectedPlayers.length - 1) {
                                  showResults(updated);
                                }

                                return updated;
                              });

                              // Move to next player if not last
                              if (prevIndex < selectedPlayers.length - 1) {
                                return prevIndex + 1;
                              }

                              return prevIndex; // stay if finished
                            });
                          }}
                          onMouseDown={() => setPressedButton(voteType)}
                          onMouseUp={() => setPressedButton(null)}
                          onMouseLeave={() => setPressedButton(null)}
                          onTouchStart={() => setPressedButton(voteType)}
                          onTouchEnd={() => setPressedButton(null)}
                          className={`w-48 h-20 text-2xl font-extrabold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition ${
                            pressedButton === voteType
                              ? "scale-95 brightness-75"
                              : ""
                          }`}
                          style={{
                            backgroundImage: isSuccess
                              ? "url(/images/Crown2.jpg), linear-gradient(to right, #a18207, #ca8a04, #a18207)"
                              : "url(/images/NicePng_close-button-png_521965.png), linear-gradient(to right, #7a1d1d, #bf2c2c, #7a1d1d)",
                            backgroundSize: isSuccess
                              ? "50px, auto"
                              : "60px, auto",
                            backgroundPosition: "left",
                            backgroundRepeat: "no-repeat",
                            paddingLeft: isSuccess ? "2.5rem" : "1rem",
                          }}
                        >
                          {isSuccess ? t("modals.success") : t("modals.fail")}
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
        {/* Phase Result */}
        <AnimatePresence>
          {showResultScreen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full h-full flex items-center justify-center px-4">
                <div className="flex flex-wrap justify-center gap-4 max-w-full overflow-y-auto">
                  {shuffled.map((card) => (
                    <ReactCardFlip
                      key={card.id}
                      isFlipped={flippedCards.includes(card.id)}
                      flipDirection="horizontal"
                    >
                      <div
                        className={`w-40 h-60 bg-purple-700 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                          currentFlipping === -2 ||
                          currentFlipping ===
                            shuffled.findIndex((c) => c.id === card.id)
                            ? "animate-pulse"
                            : ""
                        }`}
                      >
                        ?
                      </div>
                      <div
                        className={`w-40 h-60 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                          card.type === "success"
                            ? "bg-amber-600"
                            : "bg-red-800"
                        }`}
                      >
                        {card.type === "success" ? "✓" : "✗"}
                      </div>
                    </ReactCardFlip>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showGameOver && (
          <GameOver roomSessionKey={roomSessionKey} winner={gameResult} />
        )}
      </motion.div>
    </>
  );
}

export default OneDeviceGame;
