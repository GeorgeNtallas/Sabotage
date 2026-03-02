import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const EnterPlayersModal = ({ isOpen, onClose, players, setPlayers }) => {
  const [newPlayer, setNewPlayer] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [players, isOpen]);

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
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="bg-black/98 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] w-[90%] h-[90%] max-w-2xl relative flex flex-col text-white">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
        
        <button
          className="absolute top-3 right-3 text-cyan-400 hover:text-cyan-300 text-3xl font-bold z-10"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="pt-8 pb-4 px-6 border-b border-cyan-500/30">
          <h1 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: "MedievalSharp" }}>⚔️ Knights Roster ⚔️</h1>
          <p className="text-cyan-400/60 text-sm text-center">5 - 10 warriors required</p>
          <p className="text-cyan-400 text-center font-bold mt-1">
            Current: {players.length}
          </p>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-6">
          {players.map((player, index) => (
            <div key={index} className="flex items-center gap-3 bg-zinc-900/50 border border-cyan-500/30 p-3 rounded-lg hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition">
              <span className="text-2xl">🛡️</span>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                className="flex-1 bg-transparent border-none text-cyan-100 text-lg focus:outline-none" style={{ fontFamily: "MedievalSharp" }}
              />
              <button
                className="text-red-500 hover:text-red-400 text-xl transition"
                onClick={() => removePlayer(index)}
              >
                ⚔️
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3 p-6 border-t border-cyan-500/30">
          <input
            type="text"
            placeholder="Enter knight name..."
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            className="flex-1 p-3 rounded-lg bg-zinc-900/50 border border-cyan-500/30 text-cyan-100 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)]" style={{ fontFamily: "MedievalSharp" }}
          />
          <button
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-black rounded-lg px-6 py-3 font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400"
            onClick={addPlayer}
            disabled={players.length >= 10}
            style={{ fontFamily: "MedievalSharp" }}
          >
            ➕ Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterPlayersModal;
