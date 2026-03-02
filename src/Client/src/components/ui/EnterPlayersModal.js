import React, { useState } from "react";

const EnterPlayersModal = ({ isOpen, onClose, players, setPlayers }) => {
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = () => {
    if (newPlayer.trim() && players.length < 10) {
      setPlayers([...players, newPlayer.trim()]);
      setNewPlayer("");
    }
  };

  const updatePlayer = (index, name) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = name;
    setPlayers(updatedPlayers);
  };

  const removePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-hidden items-center justify-center flex">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-[90%] h-[90%] relative flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-4xl text-white focus:outline-none z-10"
          onClick={onClose}
        >
          ×
        </button>
        <div className="pt-8 pb-4">
          <h1 className="text-2xl font-bold mb-3 text-center">Add Players</h1>
          <p className="text-gray-400 mb-1 text-center">5 - 10 players</p>
          <p className="text-green-500 text-center">
            Players - {players.length}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800 p-3 rounded-2xl"
            >
              <span className="text-xl">👤</span>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                className="flex-1 mx-3 bg-transparent border-none text-white text-lg focus:outline-none"
              />
              <button
                className="text-white text-lg focus:outline-none"
                onClick={() => removePlayer(index)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-4 pt-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Add Player"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            className="flex-1 p-2 rounded-xl bg-gray-800 text-white focus:outline-none"
          />
          <button
            className="ml-3 bg-green-500 text-black rounded-full w-10 h-10 flex items-center justify-center text-xl focus:outline-none"
            onClick={addPlayer}
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterPlayersModal;
