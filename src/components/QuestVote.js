import React from "react";
import socket from "../socket";

const QuestVote = ({ setShowQuestVoting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="flex flex-col md:flex-row gap-8">
        <button
          onClick={() => {
            const vote = "success";
            setShowQuestVoting(false);
            //socket.emit("vote_quest", { roomId, vote });
          }}
          className="w-48 h-20 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded-lg"
        >
          Success
        </button>
        <button
          onClick={() => {
            const vote = "fail";
            setShowQuestVoting(false);
            //socket.emit("vote_quest", { roomId, vote });
          }}
          className="w-48 h-20 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-lg"
        >
          Fail
        </button>
      </div>
    </div>
  );
};

export default QuestVote;
