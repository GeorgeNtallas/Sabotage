import React from "react";
import socket from "../socket";

const VoteMedal = ({
  roomId,
  setSelectedPlayers,
  selectedPlayers,
  setShowLeaderVoteModal,
  setShowVoteButton,
  setShowQuestVoteButton,
  setShowQuestVoteModal,
  setShowVoteModal,
  setShowPlayersVote,
  players,
  type,
}) => {
  if (type === "voteAll") {
    // Vote Medal
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-80 max-w-md">
          <h3 className="text-xl font-bold mb-4 text-white text-center ">
            Select Quest Team
          </h3>
          <div className="space-y-2 mb-4 flex flex-col items-center">
            {players.map((player) => (
              <label
                key={player.socketId}
                className="gap-x-3 flex flex-row items-center text-white"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.socketId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPlayers([...selectedPlayers, player.socketId]);
                    } else {
                      setSelectedPlayers(
                        selectedPlayers.filter((id) => id !== player.socketId)
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
              onClick={() => {
                // Send vote to server
                socket.emit("vote_team", { roomId, selectedPlayers });
                setShowVoteModal(false);
                setShowPlayersVote(false);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Submit Vote
            </button>

            <button
              onClick={() => {
                setShowVoteModal(false);
                setSelectedPlayers([]);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      //
    );
  } else if (type === "leaderVote") {
    // Vote for the quest
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-80 max-w-md">
          <h3 className="text-xl font-bold mb-4 text-white text-center ">
            Select Quest Team
          </h3>
          <div className="space-y-2 mb-4 flex flex-col items-center">
            {players.map((player) => (
              <label
                key={player.socketId}
                className="gap-x-3 flex flex-row items-center text-white"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.socketId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPlayers([...selectedPlayers, player.socketId]);
                    } else {
                      setSelectedPlayers(
                        selectedPlayers.filter((id) => id !== player.socketId)
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
              onClick={() => {
                // Send vote to server
                setShowLeaderVoteModal(false);
                setShowVoteModal(false);
                setShowVoteButton(false);
                socket.emit("leader_vote", { roomId, selectedPlayers });

                //   setSelectedPlayers([]);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Submit Vote
            </button>

            <button
              onClick={() => {
                setShowLeaderVoteModal(false);
                setSelectedPlayers([]);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  } else if (type === "questVote") {
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-50 max-w-md">
        <h3 className="text-xl font-bold mb-4 text-white">Proceed to Quest?</h3>
        <div className="space-y-2 mb-4">
          <label className="flex gap-14 items-center text-white">
            <button
              onClick={() => {
                const vote = "success";
                socket.emit("vote_quest", { roomId, vote });
                setShowQuestVoteModal(false);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Yes
            </button>
            <button
              onClick={() => {
                const vote = "fail";
                socket.emit("vote_quest", { roomId, vote });
                setShowQuestVoteModal(false);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              No
            </button>
          </label>
        </div>
      </div>
    </div>;
  }
};

export default VoteMedal;
