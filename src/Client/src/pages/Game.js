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
import Chat from "../components/ui/Chat";
import DesktopGameView from "../components/res_design/DesktopGameView";
import MobileGameView from "../components/res_design/MobileGameView";

function Game() {
  // Loc, roomSessionKey
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};
  const { t } = useTranslation();
  const roomSessionKey = sessionStorage.getItem("roomSessionKey");
  const playerSessionKey = sessionStorage.getItem("playerSessionKey");
  const [displayName, setDisplayName] = useState(name || "");
  const [fadeIn, setFadeIn] = useState(false);

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
          (p) => p.playerSessionKey === playerSessionKey,
        );
        if (me?.name) setDisplayName(me.name);
        // amazonq-ignore-next-line
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
  const [pressedButton, setPressedButton] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [phaseVoters, setPhaseVoters] = useState({});

  // -------------ΤΗΕ NEW IMPLEMENTATION OF THE SOCKETS------------
  const [room, setRoom] = useState({});

  // amazonq-ignore-next-line

  useEffect(() => {
    socket.on("state_update", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      socket.off("state_update");
    };
  }, []);

  // -------------ΤΗΕ NEW IMPLEMENTATION OF THE SOCKETS-------------

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setShowChat(true);
    }
  }, [isDesktop]);

  // Request game state on mount for rejoining players
  useEffect(() => {
    if (roomSessionKey && playerSessionKey) {
      socket.emit("request_game_state", { roomSessionKey, playerSessionKey });
    }
  }, [roomSessionKey, playerSessionKey]);
  // amazonq-ignore-next-line

  // Listen for game state response
  useEffect(() => {
    socket.on("game_state_response", ({ phaseResults: serverPhaseResults }) => {
      if (serverPhaseResults && Array.isArray(serverPhaseResults)) {
        setPhaseResults(serverPhaseResults);
      }
    });
    return () => socket.off("game_state_response");
  }, []);
  // amazonq-ignore-next-line

  // Assigne Roles to players
  useEffect(() => {
    socket.on(
      "character_assigned",
      ({ character, players: assignedPlayers, gameCharacters }) => {
        setCharacter(character);
        setPlayers(assignedPlayers);
        setGameCharacters(gameCharacters);
        setWaitingForReconnect(null);
        setFadeIn(true);

        // cache for seamless reconnect rendering
        try {
          sessionStorage.setItem(
            "lastCharacterPayload",
            JSON.stringify({
              character,
              players: assignedPlayers,
              // amazonq-ignore-next-line
              gameCharacters,
            }),
          );
        } catch {}

        // Update my display name on initial assign or reconnect
        const me = (assignedPlayers || []).find(
          (p) => p.playerSessionKey === playerSessionKey,
        );
        if (me && me.name) setDisplayName(me.name);
      },
    );
    return () => socket.off("character_assigned");
  }, [playerSessionKey]);

  // clear cache once we have rendered at least once with live data
  useEffect(() => {
    // amazonq-ignore-next-line
    if (character) {
      try {
        sessionStorage.removeItem("lastCharacterPayload");
      } catch {}
    }
    // amazonq-ignore-next-line
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
    // amazonq-ignore-next-line
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
        "Leave the room? This will remove you from the game.",
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
  // amazonq-ignore-next-line

  useEffect(() => {
    const handleChatMessage = () => {
      if (!showChat && !isDesktop) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    socket.on("chat_message", handleChatMessage);
    return () => socket.off("chat_message", handleChatMessage);
  }, [showChat, isDesktop]);

  const handleChatOpen = () => {
    setShowChat(true);
    setUnreadMessages(0);
  };

  // Update the room parameters
  useEffect(() => {
    socket.on(
      "round_update",
      ({
        source,
        roundLeader,
        round,
        phase,
        missionTeamSizes,
        totalTeamSize,
        phaseResults,
        phaseVoters: serverPhaseVoters,
      }) => {
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
        if (serverPhaseVoters) setPhaseVoters(serverPhaseVoters);

        if (
          phaseResults &&
          Array.isArray(phaseResults) &&
          phaseResults.length > 0
        ) {
          setPhaseResults(phaseResults);
        }
      },
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
  // amazonq-ignore-next-line

  // Leader selected players for next quest
  useEffect(() => {
    socket.on("leader_voted", ({ votedPlayers }) => {
      setLeaderVotedPlayers(votedPlayers);
      setShowQuestVoteButton(true);
      setShowLeaderVoteButton(false);
    });
    return () => socket.off("leader_voted");
  }, []);
  // amazonq-ignore-next-line

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
  // amazonq-ignore-next-line

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
  // amazonq-ignore-next-line

  // Announce the quest result
  useEffect(() => {
    socket.on("inform_result", ({ result, success, fail }) => {
      setPhaseResults((prev) => [...prev, result]);
      setFinalVoteResults({ success: success, fail: fail });
      setShowWaitScreen(false);
      setShowResultScreen(true);
    });

    return () => socket.off("inform_result");
  }, []);
  // amazonq-ignore-next-line

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

  // amazonq-ignore-next-line
  const isLeader = playerSessionKey === roundLeaderId;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeIn ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="w-full h-full bg-black"
      >
      {character && (
        <>
      {isDesktop ? (
        <DesktopGameView
          character={character}
          displayName={displayName}
          name={name}
          isLeader={isLeader}
          players={players}
          roundLeaderId={roundLeaderId}
          phase={phase}
          round={round}
          phaseResults={phaseResults}
          totalTeamSize={totalTeamSize}
          gameCharacters={gameCharacters}
          phaseVoters={phaseVoters}
          showPlayersVote={showPlayersVote}
          hasVoted={hasVoted}
          showQuestVoteButton={showQuestVoteButton}
          showLeaderVoteButton={showLeaderVoteButton}
          setShowVoteModal={setShowVoteModal}
          setShowQuestVoteModal={setShowQuestVoteModal}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowExit={setShowExit}
          pressedButton={pressedButton}
          setPressedButton={setPressedButton}
          handleChatOpen={handleChatOpen}
          unreadMessages={unreadMessages}
          showChat={showChat}
          playerSessionKey={playerSessionKey}
          roomSessionKey={roomSessionKey}
          finalTeamSuggestions={finalTeamSuggestions}
          leaderVotedPlayers={leaderVotedPlayers}
        />
      ) : (
        <MobileGameView
          character={character}
          displayName={displayName}
          name={name}
          isLeader={isLeader}
          players={players}
          roundLeaderId={roundLeaderId}
          phase={phase}
          round={round}
          phaseResults={phaseResults}
          totalTeamSize={totalTeamSize}
          gameCharacters={gameCharacters}
          phaseVoters={phaseVoters}
          showPlayersVote={showPlayersVote}
          hasVoted={hasVoted}
          showQuestVoteButton={showQuestVoteButton}
          showLeaderVoteButton={showLeaderVoteButton}
          setShowVoteModal={setShowVoteModal}
          setShowQuestVoteModal={setShowQuestVoteModal}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowExit={setShowExit}
          pressedButton={pressedButton}
          setPressedButton={setPressedButton}
          handleChatOpen={handleChatOpen}
          unreadMessages={unreadMessages}
          finalTeamSuggestions={finalTeamSuggestions}
          leaderVotedPlayers={leaderVotedPlayers}
        />
      )}
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
      {waitingForReconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white text-black p-6 rounded-md">
            <h3 className="font-bold mb-2">{waitingForReconnect}</h3>
            <p>Please wait until they reconnect...</p>
          </div>
        </div>
      )}
      {!isDesktop && (
        <Chat
          show={showChat}
          onClose={() => setShowChat(false)}
          character={character}
          playerSessionKey={playerSessionKey}
          roomSessionKey={roomSessionKey}
          isDesktop={false}
        />
      )}
      </>
      )}
      </motion.div>
    </>
  );
}

export default Game;
