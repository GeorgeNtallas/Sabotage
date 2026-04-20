import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const EnterPlayersModal = ({ isOpen, onClose, players, setPlayers }) => {
  const [newPlayer, setNewPlayer] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [players, isOpen]);

  // Reset error when user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showError && newPlayer.length > 0) {
        setShowError(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [newPlayer, showError]);

  const addPlayer = () => {
    const trimmedName = newPlayer.trim().toLowerCase();

    // Check if the name is empty
    if (!trimmedName) {
      setErrorMessage(t("oneDevice.enterKnightName"));
      setShowError(true);
      return;
    }

    // Check if the player name already exists (case-insensitive)
    const existingPlayer = players.find((p) => p.toLowerCase() === trimmedName);
    if (existingPlayer) {
      setErrorMessage(`"${newPlayer.trim()}" ${t("oneDevice.exist")} `);
      setShowError(true);
      return;
    }

    if (players.length < 10) {
      setShowError(false);
      setPlayers([...players, newPlayer.trim()]);
      // Clear the input and refocus with a small delay to keep keyboard open
      setTimeout(() => {
        setNewPlayer("");
        inputRef.current?.focus();
      }, 50);
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
      <div className="bg-black border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] w-[90%] h-[90%] max-w-2xl relative flex flex-col text-white">
        {/* Corner decorations - purple style */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

        <button
          className="absolute top-3 right-3 text-purple-400 hover:text-purple-300 text-3xl font-bold z-10 transition"
          onClick={onClose}
        >
          ×
        </button>

        <div className="pt-8 pb-4 px-6 border-b border-purple-500/30">
          <h1
            className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400"
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("oneDevice.knightsRoster")}
          </h1>
          <p className="text-purple-400/60 text-sm text-center">
            {t("oneDevice.warriorsRequired")}
          </p>
          <p className="text-purple-400 text-center font-bold mt-1">
            {t("oneDevice.current")} {players.length}
            {players.length == 10 && (
              <span className="text-red-600 text-center font-bold mt-1">
                {" MAX"}
              </span>
            )}
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-3">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-zinc-900/50 border border-purple-500/30 p-3 rounded-lg hover:border-purple-500/50 hover:shadow-[0_0_10px_rgba(150,50,150,0.3)] transition"
            >
              <span className="text-2xl">🛡️</span>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                className="flex-1 bg-transparent border-none text-purple-100 text-lg focus:outline-none"
                style={{ fontFamily: "MedievalSharp" }}
              />
              <button
                className="text-red-500 hover:text-red-400 text-xl transition"
                onClick={() => removePlayer(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 p-6 border-t border-purple-500/30">
          <div className="flex-1 relative">
            {showError && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 z-50 shadow-lg text-center">
                <span className="text-red-400 block">{errorMessage}</span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
              </div>
            )}
            <motion.input
              ref={inputRef}
              type="text"
              placeholder={t("oneDevice.enterKnightName")}
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
              disabled={players.length >= 10}
              animate={
                showError
                  ? {
                      borderColor: ["#ef4444", "#dc2626", "#ef4444"],
                    }
                  : {
                      borderColor: [
                        "rgba(150,50,150,0.3)",
                        "rgba(150,50,150,0.5)",
                        "rgba(150,50,150,0.3)",
                      ],
                    }
              }
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-full p-3 rounded-lg border-2 text-purple-100 focus:outline-none placeholder-purple-400/40 ${showError ? "bg-red-900/30 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.9)]" : "bg-zinc-900/50 border-purple-500/30 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(150,50,150,0.4)]"}`}
              style={{ fontFamily: "MedievalSharp" }}
            />
          </div>
          <button
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-black rounded-lg px-6 py-3 font-bold transition shadow-[0_0_15px_rgba(150,50,150,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addPlayer}
            disabled={players.length >= 10}
            style={{ fontFamily: "MedievalSharp" }}
          >
            {t("oneDevice.add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterPlayersModal;
