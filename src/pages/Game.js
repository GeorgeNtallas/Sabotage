import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../socket";
import QuestPopup from "../components/QuestPopup";
import VoteMedal from "../components/VoteMedal";
import QuestVote from "../components/QuestVote";

function Game() {
  // Loc, roomId
  const location = useLocation();
  const { roomId, playerId } = location.state || {};
  // Show elements
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLeaderVoteModal, setShowLeaderVoteModal] = useState(false);
  const [showQuestVoteModal, setShowQuestVoteModal] = useState(false);
  const [showVoteButton, setShowVoteButton] = useState(false);
  const [showQuestVoteButton, setShowQuestVoteButton] = useState(false);
  const [showPlayersVote, setShowPlayersVote] = useState(true);
  const [showQuestVoting, setShowQuestVoting] = useState(false);
  // Arrays
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [phaseResults, setPhaseResults] = useState([]);
  const [character, setCharacter] = useState(null);
  const [leaderVotedPlayers, setLeaderVotedPlayers] = useState([]);
  const [finalTeamSuggestions, setFinalTeamSuggestions] = useState([]);
  // Others
  const [roundLeaderId, setRoundLeaderId] = useState();

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    socket.on("character_assigned", ({ character, players }) => {
      setCharacter(character);
      setPlayers(players);
    });
    return () => socket.off("character_assigned");
  }, []);

  useEffect(() => {
    socket.on("leader_voted", ({ votedPlayers }) => {
      setLeaderVotedPlayers(votedPlayers);
      setShowQuestVoteButton(true);
    });
    return () => socket.off("leader_voted");
  }, []);

  useEffect(() => {
    socket.on("team_voted", ({ success, team, votes }) => {
      setSelectedPlayers([]);
      setShowVoteButton(true);
      setFinalTeamSuggestions(team);
    });
    return () => socket.off("team_voted");
  }, []);

  useEffect(() => {
    socket.on("round_update", ({ roundLeader, round, phase }) => {
      setRoundLeaderId(roundLeader);
      setRound(round);
      setSelectedPlayers([]);
      if (phase) setPhase(phase);
    });
    return () => socket.off("round_update");
  }, []);

  useEffect(() => {
    socket.on("inform_players_to_vote", ({ votedPlayers }) => {
      if (votedPlayers.includes(playerId)) {
        setShowQuestVoting(true);
      }
    });
    return () => socket.off("inform_players_to_vote");
  }, [playerId]);

  useEffect(() => {});

  useEffect(() => {
    socket.on("quest_voted", ({ result, votes }) => {
      setShowPlayersVote(false);
      setShowQuestVoteButton(false);
      setShowPlayersVote(true);

      if (result === "success") {
        setPhaseResults((prev) => [...prev, result]);
      }

      setTimeout(() => {
        if (result !== "success") {
          socket.emit("next_round", { roomId });
        }
      }, 1000);
    });
    return () => socket.off("quest_voted");
  }, [roomId, leaderVotedPlayers]);

  if (!character) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-2xl">Waiting for character assignment...</h2>
      </div>
    );
  }

  const isLeader = playerId === roundLeaderId;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
        Avalon Game
      </h1>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        {/* Phase/Round Info */}
        <div className="bg-gray-800 rounded-lg p-3">
          <h3 className="text-center font-semibold mb-2">
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
                  className={`w-6 h-6 rounded-full ${circleColor} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {phaseNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Character Card */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <h2 className="text-lg font-semibold">{location.state?.name}</h2>
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
              .replace(/\s+/g, "-")}.jpg`}
            alt={character.name}
            className="max-w-40 mx-auto mb-2"
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          <h3 className="text-lg font-bold text-yellow-400">
            {character.name}
          </h3>
          <p className="text-sm text-gray-300 mb-1">{character.description}</p>
          <p className="text-xs">
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
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="grid grid-cols-3 text-white font-bold mb-3 border-b border-gray-600 pb-2 text-sm">
            <h3 className="text-center">Players</h3>
            <h3 className="text-center">Role</h3>
            <h3 className="text-center">Leader</h3>
          </div>
          <div className="grid grid-cols-3 gap-y-2 text-xs text-gray-300">
            {players.map((player) => (
              <React.Fragment key={player.socketId}>
                <div className="text-center">{player.name}</div>
                <div className="text-center">
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

      {/* Desktop Layout */}
      <div className="hidden md:block relative h-[70vh]">
        <div className="bg-gray-800 rounded-lg p-4 text-center absolute left-[5%] w-[25%] max-w-sm top-1/2 transform -translate-y-1/2">
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
              .replace(/\s+/g, "-")}.jpg`}
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

      <QuestPopup
        players={players}
        finalTeamSuggestions={finalTeamSuggestions}
        leaderVotedPlayers={leaderVotedPlayers}
        isLeader={isLeader}
      />

      {/* Action Buttons */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs px-4">
        {showPlayersVote && (
          <button
            onClick={() => setShowVoteModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 mb-2"
          >
            Vote for Quest Team
          </button>
        )}
        {showQuestVoteButton && (
          <button
            onClick={() => setShowQuestVoteModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 mb-2"
          >
            Proceed to Quest?
          </button>
        )}
        {isLeader && showVoteButton && (
          <button
            onClick={() => setShowLeaderVoteModal(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3"
          >
            Leader Vote
          </button>
        )}
      </div>
      {/* Voting Modal For All */}
      {showVoteModal && (
        <VoteMedal
          roomId={roomId}
          setSelectedPlayers={setSelectedPlayers}
          selectedPlayers={selectedPlayers}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowVoteButton={setShowVoteButton}
          leaderVotedPlayers={leaderVotedPlayers}
          setShowQuestVoteButton={setShowQuestVoteButton}
          setShowQuestVoteModal={setShowQuestVoteModal}
          setShowVoteModal={setShowVoteModal}
          setShowPlayersVote={setShowPlayersVote}
          players={players}
          type="voteAll"
        />
      )}
      {/* Voting Modal For Leader */}
      {showLeaderVoteModal && (
        <VoteMedal
          roomId={roomId}
          setSelectedPlayers={setSelectedPlayers}
          selectedPlayers={selectedPlayers}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowVoteButton={setShowVoteButton}
          leaderVotedPlayers={leaderVotedPlayers}
          setShowQuestVoteButton={setShowQuestVoteButton}
          setShowQuestVoteModal={setShowQuestVoteModal}
          setShowVoteModal={setShowVoteModal}
          setShowPlayersVote={setShowPlayersVote}
          players={players}
          type="leaderVote"
        />
      )}
      {showQuestVoteModal && (
        <VoteMedal
          roomId={roomId}
          setSelectedPlayers={setSelectedPlayers}
          selectedPlayers={selectedPlayers}
          setShowLeaderVoteModal={setShowLeaderVoteModal}
          setShowVoteButton={setShowVoteButton}
          leaderVotedPlayers={leaderVotedPlayers}
          setShowQuestVoteButton={setShowQuestVoteButton}
          setShowQuestVoteModal={setShowQuestVoteModal}
          setShowVoteModal={setShowVoteModal}
          setShowPlayersVote={setShowPlayersVote}
          players={players}
          type="questVote"
        />
      )}
      {showQuestVoting && <QuestVote setShowQuestVoting={setShowQuestVoting} />}
    </div>
  );
}

export default Game;
