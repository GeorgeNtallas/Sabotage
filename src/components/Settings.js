import React from "react";

const Settings = ({ isLeader, readyPlayers, selectedRoles, toggleRole }) => {
  const isChecked = (role) => selectedRoles.has(role);

  return (
    <div>
      {isLeader && (
        <div className="w-80 bg-white text-black text-center p-6 shadow-lg rounded-lg mt-6">
          <h3 className="text-xl text-center font-semibold mb-4">Include</h3>

          {readyPlayers.length >= 1 && (
            <div className="flex                                                                                                                     justify-start gap-x-9">
              <label className="font-medium whitespace-nowrap">Merlin</label>
              <input
                type="checkbox"
                checked={isChecked("Merlin")}
                onChange={() => toggleRole("Merlin")}
              />
            </div>
          )}

          {readyPlayers.length >= 7 && (
            <div className="flex items-center justify-start gap-x-7">
              <label className="font-medium whitespace-nowrap">Mordred</label>
              <input
                type="checkbox"
                checked={isChecked("Mordred")}
                onChange={() => toggleRole("Mordred")}
              />
            </div>
          )}

          {readyPlayers.length >= 1 && (
            <div className="flex items-center justify-start gap-x-6">
              <label className="font-medium whitespace-nowrap">Assassin</label>
              <input
                type="checkbox"
                checked={isChecked("Assassin")}
                onChange={() => toggleRole("Assassin")}
              />
            </div>
          )}
          {readyPlayers.length >= 8 && (
            <div className="flex items-center justify-start gap-x-3">
              <label className="font-medium">Oberon</label>
              <input
                type="checkbox"
                checked={isChecked("Oberon")}
                onChange={() => toggleRole("Oberon")}
              />
            </div>
          )}

          {readyPlayers.length >= 6 && (
            <div className="flex items-center justify-start gap-x-5">
              <label className="font-medium">Morgana</label>
              <input
                type="checkbox"
                checked={isChecked("Morgana")}
                onChange={() => toggleRole("Morgana")}
              />
            </div>
          )}

          {readyPlayers.length >= 6 && (
            <div className="flex items-center justify-start gap-x-7">
              <label className="font-medium">Percival</label>
              <input
                type="checkbox"
                checked={isChecked("Percival")}
                onChange={() => toggleRole("Percival")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
