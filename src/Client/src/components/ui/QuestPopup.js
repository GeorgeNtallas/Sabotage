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
      className={`bg-black/90 rounded-lg p-3 mb-4 text-center w-80 mx-auto border-2 border-purple-500/50 shadow-[0_0_30px_rgba(150,50,150,0.4)]
      transition-all duration-500 ease-out
      ${
        shouldShow
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <h4 className="text-sm font-semibold text-purple-300 mb-3">Quest Team</h4>
      <div className="grid grid-cols-2 gap-4 text-xs text-purple-200/70">
        <div>
          <h5 className="font-semibold text-purple-300 mb-2">
            Player Suggestions
          </h5>
          {finalTeamSuggestions.length > 0 ? (
            <div className="space-y-1">
              {players
                .filter((p) =>
                  finalTeamSuggestions.includes(p.playerSessionKey),
                )
                .map((p) => (
                  <div key={p.playerSessionKey} className="text-center">
                    {p.name}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-purple-500/50">No suggestions yet</div>
          )}
        </div>
        <div>
          <h5 className="font-semibold text-purple-300 mb-2">
            Leader Selection
          </h5>
          {leaderVotedPlayers.length > 0 ? (
            <div className="space-y-1">
              {players
                .filter((p) => leaderVotedPlayers.includes(p.playerSessionKey))
                .map((p) => (
                  <div key={p.playerSessionKey} className="text-center  ">
                    {p.name}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-purple-500/50">
              {isLeader ? "No selection yet" : "Leader deciding..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
