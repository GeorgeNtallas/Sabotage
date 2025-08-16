import React from "react";
import socket from "../../socket";

const QuestVote = ({
  setShowQuestVoting,
  roomSessionKey,
  playerSessionKey,
  phase,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      style={{
        backgroundImage:
          "url(/images/3d-grunge-brick-interior-with-spotlight-shining-down.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <button
          onClick={() => {
            const vote = "success";
            setShowQuestVoting(false);
            socket.emit("result_votes", {
              roomSessionKey,
              playerSessionKey,
              vote,
              phase,
            });
          }}
          className="w-48 h-20 text-2xl font-extrabold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition"
          style={{
            backgroundImage:
              "url(/images/Crown2.jpg), linear-gradient(to right, #a18207, #ca8a04, #a18207)",
            backgroundSize: "50px, auto",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
            paddingLeft: "2.5rem",
          }}
        >
          Success
        </button>
        <button
          onClick={() => {
            const vote = "fail";
            setShowQuestVoting(false);
            socket.emit("result_votes", {
              roomSessionKey,
              playerSessionKey,
              vote,
              phase,
            });
          }}
          className="w-48 h-20 text-2xl font-extrabold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition"
          style={{
            backgroundImage:
              "url(/images/CROSED.jpg), linear-gradient(to right, #7a1d1d, #bf2c2c, #7a1d1d)",
            backgroundSize: "60px, auto",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
            paddingLeft: "1rem",
          }}
        >
          Fail
        </button>
      </div>
    </div>
  );
};

export default QuestVote;
