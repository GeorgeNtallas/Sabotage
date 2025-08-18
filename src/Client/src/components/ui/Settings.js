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
                  checked={isChecked("Seer")}
                  onChange={() => toggleRole("Seer")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Seer
              </label>
            )}

            {readyPlayers.length >= 5 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Draven")}
                  onChange={() => toggleRole("Draven")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Draven
              </label>
            )}

            {readyPlayers.length >= 5 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Shade")}
                  onChange={() => toggleRole("Shade")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600  focus:ring-green-500 transition"
                />
                Shade
              </label>
            )}

            {readyPlayers.length >= 10 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Usurper")}
                  onChange={() => toggleRole("Usurper")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500  transition"
                />
                Usurper
              </label>
            )}

            {readyPlayers.length >= 7 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Seraphina")}
                  onChange={() => toggleRole("Seraphina")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500  transition"
                />
                Seraphina
              </label>
            )}

            {readyPlayers.length >= 6 && (
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isChecked("Guardian")}
                  onChange={() => toggleRole("Guardian")}
                  className="appearance-none w-4 h-4 rounded-md bg-transparent border border-white checked:bg-green-600   focus:ring-green-500 transition"
                />
                Guardian
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
