import React from "react";

const Settings = ({ isLeader, readyPlayers, selectedRoles, toggleRole }) => {
  const isChecked = (role) => selectedRoles.has(role);

  return (
    <div>
      {isLeader && (
        <div className="mt-6 p-4 border border-white/20 rounded-md bg-white/5">
          <h3 className="text-xl text-center font-semibold text-white mb-4">
            Include
          </h3>

          <div className="flex flex-col items-center">
            {readyPlayers.length >= 1 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Merlin")}
                  onChange={() => toggleRole("Merlin")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Merlin
              </label>
            )}

            {readyPlayers.length >= 7 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Mordred")}
                  onChange={() => toggleRole("Mordred")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Mordred
              </label>
            )}

            {readyPlayers.length >= 1 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Assassin")}
                  onChange={() => toggleRole("Assassin")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Assassin
              </label>
            )}

            {readyPlayers.length >= 8 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Oberon")}
                  onChange={() => toggleRole("Oberon")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500  transition"
                />
                Oberon
              </label>
            )}

            {readyPlayers.length >= 6 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Morgana")}
                  onChange={() => toggleRole("Morgana")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500  transition"
                />
                Morgana
              </label>
            )}

            {readyPlayers.length >= 6 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Percival")}
                  onChange={() => toggleRole("Percival")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500 transition"
                />
                Percival
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
