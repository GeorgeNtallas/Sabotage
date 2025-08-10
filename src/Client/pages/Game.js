import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import socket from "../../socket";
import QuestPopup from "../components/QuestPopup";
import Modals from "../components/Modals";
import QuestVote from "../components/QuestVote";
import PhaseResult from "../components/PhaseResult";
import GameOver from "../components/GameOver";
import WaitScreen from "../components/WaitScreen";

function Game() {
  // Loc, roomId
  const location = useLocation();
  const { roomId, playerId } = location.state || {};
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
  // Arrays
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [phaseResults, setPhaseResults] = useState([]);
  const [character, setCharacter] = useState(null);
  const [leaderVotedPlayers, setLeaderVotedPlayers] = useState([]);
  const [finalTeamSuggestions, setFinalTeamSuggestions] = useState([]);
  const [finalPhaseResults, setFinalPhaseResult] = useState([]);
  const [finalVoteResults, setFinalVoteResults] = useState({});
  // Others
  const [roundLeaderId, setRoundLeaderId] = useState();
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(1);
  const [missionTeamSizes, setMissionTeamSizes] = useState(1);
  const [gameResult, setGameResult] = useState("");

  // Assigne Roles to players
  useEffect(() => {
    socket.on("character_assigned", ({ character, players }) => {
      setCharacter(character);
      setPlayers(players);
    });
    return () => socket.off("character_assigned");
  }, []);

  // Update the room parameters
  useEffect(() => {
    socket.on(
      "round_update",
      ({ roundLeader, round, phase, missionTeamSizes }) => {
        setRoundLeaderId(roundLeader);
        setRound(round);
        setSelectedPlayers([]);
        setFinalTeamSuggestions([]);
        setLeaderVotedPlayers([]);
        setMissionTeamSizes(missionTeamSizes);
        setShowPlayersVote(true);
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
          socket.emit("next_round", { roomId });
        }
      }, 1000);
    });
    return () => socket.off("quest_voted");
  }, [roomId, leaderVotedPlayers]);

  // Selected Players on the quest
  useEffect(() => {
    socket.on("inform_players_to_vote", ({ votedPlayers, waitPlayers }) => {
      setShowPlayersVote(false);
      setShowQuestVoteButton(false);

      if (votedPlayers.includes(playerId)) {
        setShowQuestVoting(true);
      }

      if (waitPlayers.includes(playerId)) {
        setShowWaitScreen(true);
      }
    });
    return () => socket.off("inform_players_to_vote");
  }, [playerId, players]);

  // Announce the quest result
  useEffect(() => {
    socket.on("inform_result", ({ result, success, fail }) => {
      setPhaseResults((prev) => [...prev, result]);
      setFinalPhaseResult((prev) => [...prev, result]);
      setFinalVoteResults({ success: success, fail: fail });
      setShowResultScreen(true);
      setShowWaitScreen(false);
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

  if (!character) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-gray-900 text-white"
        style={{
          backgroundImage: "url(/images/haunted-house-gothic-style.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h2 className="text-2xl">Waiting for character assignment...</h2>
      </div>
    );
  }

  const isLeader = playerId === roundLeaderId;

  return (
    <div
      className="relative min-h-screen w-full bg-gray-900 text-white p-2 sm:p-4"
      style={{
        backgroundImage: "url(/images/mythical.jpg      )",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center">
        <img
          src="/images/Sabotage3.png"
          alt="Leader"
          className="w-[30%] mb-10"
          onError={(e) => (e.target.src = "/images/default.jpg")}
        />
      </div>

      {/* Mobile Layout */}
      <div className="relative z-10 block md:hidden space-y-4 ">
        {/* Phase/Round/Exit */}
        <div className="relative flex justify-start items-center h-16 w-full px-4">
          {/* Exit Button */}
          <div className="absolute left-2 ">
            <button
              onClick={() => setShowExit(true)}
              className={`px-4 py-2  bg-gradient-to-r bg-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition rounded-md font-bold`}
            >
              Exit
            </button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg p-3 text-center">
              <h3 className="text-center font-semibold mb-2">
                Phase {phase} - Round {round}
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
          </div>
        </div>

        {/* Character Card */}
        <div className="flex flex-row space-x-5">
          <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-lg mx-auto text-center">
            <div className="flex items-center justify-center mb-2">
              <h2 className="text-lg font-semibold pt-2">
                {location.state?.name}
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
            <img
              src={`/images/${character.name
                .toLowerCase()
                .replace(/\s+/g, "_")}.png`}
              alt={character.name}
              className="max-w-40 mx-auto mb-2 ml-7 mr-7"
              onError={(e) => (e.target.src = "/images/default.jpg")}
            />
            <h3 className="text-lg font-bold text-yellow-400">
              {character.name}
            </h3>
            <p className="text-sm text-gray-300 mb-1">
              {character.description}
            </p>
            <p className="text-xs pb-2">
              Team:{" "}
              <span
                className={
                  character.team === "good" ? "text-blue-400" : "text-red-400"
                }
              >
                {character.team.toUpperCase()}
              </span>
            </p>
          </div>
          {/* Players List */}
          <div
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg w-11/12 p-3 mx-auto text-center"
            style={{ gridTemplateColumns: "1fr 1fr auto" }}
          >
            <div
              className="grid grid-cols-3 text-white font-bold mb-3 border-b border-gray-600 pb-2 text-sm"
              style={{ gridTemplateColumns: "1fr 1fr auto" }}
            >
              <h3 className="text-center">Players</h3>
              <h3 className="text-center mr-3">Role</h3>
              <h3 className="text-center mr-1">L</h3>
            </div>
            <div
              className="grid grid-cols-3 gap-y-2 text-xs text-gray-300"
              style={{ gridTemplateColumns: "1fr 1fr auto" }}
            >
              {players.map((player) => (
                <React.Fragment key={player.socketId}>
                  <div className="text-center">{player.name}</div>
                  <div className="text-center mr-2">
                    {player.visibleRole === "evil"
                      ? "Evil"
                      : player.visibleRole === "Merlin/Morgana"
                      ? "M/M"
                      : ""}
                  </div>
                  <div className="text-center">
                    {player.socketId === roundLeaderId && (
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
        </div>

        {/* Action Buttons - Mobile */}
        <div className="px-4">
          {showPlayersVote && (
            <button
              onClick={() => setShowVoteModal(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-2"
            >
              Vote for Quest Team
            </button>
          )}
          {showQuestVoteButton && (
            <button
              onClick={() => setShowQuestVoteModal(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-2"
            >
              Proceed to Quest?
            </button>
          )}
          {isLeader && showLeaderVoteButton && (
            <button
              onClick={() => setShowLeaderVoteModal(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3"
            >
              Leader Vote
            </button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block relative h-[70vh]">
        {/* Phases - Rounds */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900  rounded-lg p-4 text-center absolute left-[5%] w-[25%] max-w-sm top-1/2 transform -translate-y-1/2">
          <h3 className="text-lg font-semibold mb-3">
            Phase {phase} - Round {round}
          </h3>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((phaseNum) => {
              let circleColor = "bg-gray-600";
              if (phaseNum === phase) {
                circleColor = "bg-yellow-500";
              } else if (phaseNum < phase) {
                const result = phaseResults[phaseNum - 1];
                circleColor =
                  result === "success" ? "bg-blue-500" : "bg-red-500";
              }
              return (
                <div
                  key={phaseNum}
                  className={`w-8 h-8 rounded-full ${circleColor} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {phaseNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Character card */}
        <div className="bg-gray-800 rounded-lg p-6 text-center absolute left-[41%] w-[18%] max-w-sm top-1/2 transform -translate-y-1/2">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-xl">{location.state?.name}</h2>
            {isLeader && (
              <img
                src="/images/Crown.jpg"
                alt="Leader"
                className="w-6 h-6 ml-2"
                onError={(e) => (e.target.src = "/images/default.jpg")}
              />
            )}
          </div>
          <img
            src={`/images/${character.name
              .toLowerCase()
              .replace(/\s+/g, "_")}.png`}
            alt={character.name}
            className="w-full max-w-[200px] mx-auto"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          <h3 className="text-2xl font-bold text-yellow-400">
            {character.name}
          </h3>
          <p className="text-gray-300 mt-2">{character.description}</p>
          <p className="text-sm mt-2">
            Team:{" "}
            <span
              className={
                character.team === "good" ? "text-blue-400" : "text-red-400"
              }
            >
              {character.team.toUpperCase()}
            </span>
          </p>
        </div>

        {/* Player List */}
        <div className="bg-gray-800 rounded-lg p-4 text-center absolute left-[70%] w-[25%] max-w-sm top-1/2 transform -translate-y-1/2">
          <div className="grid grid-cols-3 text-white font-bold mb-4 border-b border-gray-600 pb-2">
            <h3>Players</h3>
            <h3>Role</h3>
            <h3>Leader</h3>
          </div>
          <div className="grid grid-cols-3 gap-y-3 text-sm text-gray-300">
            {players.map((player) => (
              <React.Fragment key={player.socketId}>
                <div className="text-center">{player.name}</div>
                <div className="text-center">
                  {player.visibleRole === "evil"
                    ? "Evil"
                    : player.visibleRole === "Merlin/Morgana"
                    ? "Merlin/Morgana"
                    : ""}
                </div>
                <div className="text-center">
                  {player.socketId === roundLeaderId && (
                    <img
                      src="/images/Crown.jpg"
                      alt="Leader"
                      className="w-[20px] h-auto mx-auto"
                      onError={(e) => (e.target.src = "/images/default.jpg")}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
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

      {/* Action Buttons - Desktop*/}
      <div className="hidden md:block fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs px-4">
        {showPlayersVote && (
          <button
            onClick={() => setShowVoteModal(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-2"
          >
            Vote for Quest Team
          </button>
        )}
        {showQuestVoteButton && (
          <button
            onClick={() => setShowQuestVoteModal(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-2"
          >
            Proceed to Quest?
          </button>
        )}
        {isLeader && showLeaderVoteButton && (
          <button
            onClick={() => setShowLeaderVoteModal(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3"
          >
            Leader Vote
          </button>
        )}
      </div>
      {/* Voting Modal For All */}
      {showVoteModal && (
        <Modals
          roomId={roomId}
          setSelectedPlayers={setSelectedPlayers}
          selectedPlayers={selectedPlayers}
          setShowVoteModal={setShowVoteModal}
          setShowPlayersVote={setShowPlayersVote}
          players={players}
          type="voteAll"
          missionTeamSizes={missionTeamSizes}
        />
      )}
      {/* Voting Modal For Leader */}
      {showLeaderVoteModal && (
        <Modals
          roomId={roomId}
          setSelectedPlayers={setSelectedPlayers}
          selectedPlayers={selectedPlayers}
          setShowVoteModal={setShowVoteModal}
          setShowPlayersVote={setShowPlayersVote}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowQuestVoteButton={setShowQuestVoteButton}
          players={players}
          type="leaderVote"
          missionTeamSizes={missionTeamSizes}
        />
      )}
      {/* Voting Modal Selected Players */}
      {showQuestVoteModal && (
        <Modals
          roomId={roomId}
          leaderVotedPlayers={leaderVotedPlayers}
          setShowQuestVoteButton={setShowQuestVoteButton}
          setShowQuestVoteModal={setShowQuestVoteModal}
          type="questVote"
        />
      )}
      {/* Selected Players Vote */}
      {showQuestVoting && (
        <QuestVote
          setShowQuestVoting={setShowQuestVoting}
          roomId={roomId}
          phase={phase}
        />
      )}
      {/* Phase Result */}
      {showResultScreen && (
        <PhaseResult
          votes={finalVoteResults}
          setShowResultScreen={setShowResultScreen}
          roomId={roomId}
        />
      )}
      {showGameOver && <GameOver roomId={roomId} winner={gameResult} />}
      {showExit && (
        <Modals roomId={roomId} setShowExit={setShowExit} type="exit" />
      )}
      {showWaitScreen && (
        <WaitScreen
          roomId={roomId}
          leaderVotedPlayers={leaderVotedPlayers}
          setShowWaitScreen={setShowWaitScreen}
        />
      )}
    </div>
  );
}

export default Game;
