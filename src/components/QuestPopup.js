import React from "react";

export default function QuestPopup({
  players,
  finalTeamSuggestions,
  leaderVotedPlayers,
  isLeader,
}) {
  // Show popup when final team suggestions are available OR when leader makes selection
  const shouldShow =
    finalTeamSuggestions.length > 0 || leaderVotedPlayers.length > 0;

  return (
    <div
      className={`bg-gray-700 rounded-lg p-3 mb-4 text-center absolute left-[70%] w-[25%] max-w-sm top-[20%] transform -translate-y-1/2
      transition-all duration-500 ease-out
      ${
        shouldShow
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <h4 className="text-sm font-semibold text-white mb-3">Quest Team</h4>
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
        <div>
          <h5 className="font-semibold text-white mb-2">Player Suggestions</h5>
          {finalTeamSuggestions.length > 0 ? (
            <div className="space-y-1">
              {players
                .filter((p) => finalTeamSuggestions.includes(p.socketId))
                .map((p) => (
                  <div key={p.socketId} className="text-center">
                    {p.name}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-500">No suggestions yet</div>
          )}
        </div>
        <div>
          <h5 className="font-semibold text-white mb-2">Leader Selection</h5>
          {leaderVotedPlayers.length > 0 ? (
            <div className="space-y-1">
              {players
                .filter((p) => leaderVotedPlayers.includes(p.socketId))
                .map((p) => (
                  <div key={p.socketId} className="text-center  ">
                    {p.name}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-500">
              {isLeader ? "No selection yet" : "Leader deciding..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
