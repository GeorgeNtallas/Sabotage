import React from "react";

const WaitScreen = ({
  roomSessionKey,
  leaderVotedPlayers,
  setShowWaitScreen,
}) => {
  return (
    <div className="fixed inset-0 bg-black font-extrabold bg-opacity-50 flex items-center justify-center z-50">
      <h2>Waiting the other players..</h2>
    </div>
  );
};

export default WaitScreen;
