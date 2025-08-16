import React from "react";
import socket from "../../socket";
import { useNavigate } from "react-router-dom";

const Modals = ({
  roomSessionKey,
  playerSessionKey,
  setSelectedPlayers,
  selectedPlayers,
  setShowLeaderVoteModal,
  leaderVotedPlayers,
  setShowQuestVoteModal,
  setShowQuestVoteButton,
  setShowVoteModal,
  setShowPlayersVote,
  players,
  type,
  missionTeamSizes,
  setShowExit,
}) => {
  const navigate = useNavigate();

  if (type === "voteAll") {
    // Vote Medal
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-80 max-w-md">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-white text-center ">
              Select Quest Team
            </h3>
            <div className="font-semibold text-white text-center">
              Choose {missionTeamSizes}
            </div>
          </div>

          <div className="space-y-2 mb-4 flex flex-col items-center">
            {players.map((player) => (
              <label
                key={player.playerSessionKey}
                className="gap-x-3 flex flex-row items-center text-white"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.playerSessionKey)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPlayers([
                        ...selectedPlayers,
                        player.playerSessionKey,
                      ]);
                    } else {
                      setSelectedPlayers(
                        selectedPlayers.filter(
                          (id) => id !== player.playerSessionKey
                        )
                      );
                    }
                  }}
                  className="appearance-none h-5 w-5 border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-transparent transition duration-200 cursor-pointer "
                />
                {player.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              disabled={selectedPlayers.length !== missionTeamSizes}
              onClick={() => {
                // Send vote to server
                socket.emit("vote_team", {
                  roomSessionKey,
                  playerSessionKey,
                  selectedPlayers,
                });
                setShowVoteModal(false);
                setShowPlayersVote(false);
                setSelectedPlayers([]);
              }}
              className={`px-4 py-2  text-white rounded-lg
                ${
                  selectedPlayers.length !== missionTeamSizes
                    ? "bg-amber-600/25 backdrop-blur-md border-amber-400/20 cursor-not-allowed"
                    : "bg-amber-600  hover:bg-amber-700"
                }`}
            >
              Submit Vote
            </button>

            <button
              onClick={() => {
                setShowVoteModal(false);
                setSelectedPlayers([]);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  } else if (type === "leaderVote") {
    // Leader selecting
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-80 max-w-md">
          <h3 className="text-xl font-bold mb-4 text-white text-center ">
            Select Quest Team
          </h3>
          <div className="space-y-2 mb-4 flex flex-col items-center">
            {players.map((player) => (
              <label
                key={player.playerSessionKey}
                className="gap-x-3 flex flex-row items-center text-white"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.playerSessionKey)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPlayers([
                        ...selectedPlayers,
                        player.playerSessionKey,
                      ]);
                    } else {
                      setSelectedPlayers(
                        selectedPlayers.filter(
                          (id) => id !== player.playerSessionKey
                        )
                      );
                    }
                  }}
                  className="appearance-none h-5 w-5 border-2 border-blue-500 rounded-full checked:bg-blue-500 checked:border-transparent transition duration-200 cursor-pointer "
                />
                {player.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              disabled={selectedPlayers.length !== missionTeamSizes}
              onClick={() => {
                // Send vote to server
                setShowLeaderVoteModal(false);
                setShowVoteModal(false);
                setShowQuestVoteButton(false);
                setSelectedPlayers([]);
                socket.emit("leader_vote", {
                  roomSessionKey,
                  playerSessionKey,
                  selectedPlayers,
                });
              }}
              className={`px-4 py-2  text-white rounded-lg
                ${
                  selectedPlayers.length !== missionTeamSizes
                    ? "bg-amber-600/25 backdrop-blur-md border-amber-400/20 cursor-not-allowed"
                    : "bg-amber-600  hover:bg-amber-700"
                }`}
            >
              Submit Vote
            </button>

            <button
              onClick={() => {
                setShowLeaderVoteModal(false);
                setSelectedPlayers([]);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  } else if (type === "questVote") {
    return (
      // Players vote to proceed
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-50 max-w-md">
          <h3 className="text-xl text-center font-bold mb-4 text-white">
            Proceed to Quest?
          </h3>
          <div className="space-y-2 mb-4">
            <label className="flex gap-14 items-between text-white">
              <button
                onClick={() => {
                  const vote = "success";
                  socket.emit("vote_quest", {
                    roomSessionKey,
                    playerSessionKey,
                    vote,
                    leaderVotedPlayers,
                  });
                  setShowQuestVoteModal(false);
                  setShowQuestVoteButton(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  const vote = "fail";
                  socket.emit("vote_quest", {
                    roomSessionKey,
                    playerSessionKey,
                    vote,
                    leaderVotedPlayers,
                  });
                  setShowQuestVoteModal(false);
                  setShowQuestVoteButton(false);
                }}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                No
              </button>
            </label>
          </div>
        </div>
      </div>
    );
  } else if (type === "exit") {
    return (
      // Player exiting game
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-50 max-w-md">
          <h3 className="text-xl text-center font-bold mb-4 text-white">
            Exit Game?
          </h3>
          <div className="space-y-2 mb-4">
            <label className="flex gap-14 items-center text-white">
              <button
                onClick={() => {
                  socket.emit("exit", { roomSessionKey, playerSessionKey });
                  sessionStorage.removeItem("playerSessionKey");
                  if (players.length === 1)
                    sessionStorage.removeItem("roomSessionKey");
                  navigate(`/`);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowExit(false);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                No
              </button>
            </label>
          </div>
        </div>
      </div>
    );
  }
};

export default Modals;
