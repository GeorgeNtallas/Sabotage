import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Settings = ({
  isLeader,
  readyPlayers,
  selectedRoles,
  toggleRole,
  showSettings,
  setShowSettings,
  isMobile,
}) => {
  const [activeTab, setActiveTab] = useState("characters");
  const isChecked = (role) => selectedRoles.has(role);

  const playerCount = readyPlayers.length + 1;

  const allCharacters = [
    { name: "Seer", icon: "/images/SeerIcon.png", minPlayers: 2 },
    { name: "Guardian", icon: "/images/GuardianIcon.png", minPlayers: 6 },
    { name: "Seraphina", icon: "/images/SeraphinaIcon.png", minPlayers: 6 },
    { name: "Shade", icon: "/images/ShadeIcon.png", minPlayers: 6 },
    { name: "Draven", icon: "/images/DravenIcon.png", minPlayers: 8 },
    { name: "Kaelen", icon: "/images/KaelenIcon.png", minPlayers: 10 },
  ];

  const characters = allCharacters.filter(
    (char) => playerCount >= char.minPlayers,
  );

  if (isMobile) {
    return (
      showSettings && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-black/98 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] w-[90%] max-w-md flex flex-col text-white relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
              
              <div className="flex justify-between items-center p-4 border-b border-cyan-500/30">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: "MedievalSharp" }}>⚙️ Quest Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-cyan-400 hover:text-cyan-300 text-3xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="flex border-b border-cyan-500/30">
                <button
                  onClick={() => setActiveTab("characters")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "characters"
                      ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "text-cyan-400/50 hover:text-cyan-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  Heroes
                </button>
                <button
                  onClick={() => setActiveTab("gameSettings")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameSettings"
                      ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "text-cyan-400/50 hover:text-cyan-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  Rules
                </button>
                <button
                  onClick={() => setActiveTab("gameModes")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameModes"
                      ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "text-cyan-400/50 hover:text-cyan-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  Modes
                </button>
              </div>
              <div className="p-4">
                {activeTab === "characters" && (
                  <div className="grid grid-cols-3 gap-3">
                    {characters.map((character) => (
                      <button
                        key={character.name}
                        onClick={() => toggleRole(character.name)}
                        className={`flex flex-col items-center p-2 rounded-lg border transition ${
                          isChecked(character.name)
                            ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                        }`}
                      >
                        <img
                          src={character.icon}
                          alt={character.name}
                          className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                          onError={(e) => (e.target.src = "/images/default.jpg")}
                        />
                        <span className="text-xs font-semibold text-cyan-200" style={{ fontFamily: "MedievalSharp" }}>
                          {character.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === "gameSettings" && (
                  <div className="text-center text-cyan-400/50 py-8" style={{ fontFamily: "MedievalSharp" }}>
                    🏰 Coming soon...
                  </div>
                )}
                {activeTab === "gameModes" && (
                  <div className="text-center text-cyan-400/50 py-8" style={{ fontFamily: "MedievalSharp" }}>
                    ⚔️ Coming soon...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )
    );
  }

  return (
    <div>
      {isLeader && (
        <div className="bg-black/98 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.4)] w-[350px] h-[400px] flex flex-col text-white relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
          
          <div className="p-4 border-b border-cyan-500/30">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center" style={{ fontFamily: "MedievalSharp" }}>
              ⚙️ Quest Settings
            </h2>
          </div>
          <div className="flex border-b border-cyan-500/30">
            <button
              onClick={() => setActiveTab("characters")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "characters"
                  ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500"
                  : "text-cyan-400/50 hover:text-cyan-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              Heroes
            </button>
            <button
              onClick={() => setActiveTab("gameSettings")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameSettings"
                  ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500"
                  : "text-cyan-400/50 hover:text-cyan-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              Rules
            </button>
            <button
              onClick={() => setActiveTab("gameModes")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameModes"
                  ? "bg-zinc-900/50 text-cyan-400 border-b-2 border-cyan-500"
                  : "text-cyan-400/50 hover:text-cyan-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              Modes
            </button>
          </div>
          <div className="p-4">
            {activeTab === "characters" && (
              <div className="grid grid-cols-3 gap-3">
                {characters.map((character) => (
                  <button
                    key={character.name}
                    onClick={() => toggleRole(character.name)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition ${
                      isChecked(character.name)
                        ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                    }`}
                  >
                    <img
                      src={character.icon}
                      alt={character.name}
                      className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                      onError={(e) => (e.target.src = "/images/default.jpg")}
                    />
                    <span className="text-xs font-semibold text-cyan-200" style={{ fontFamily: "MedievalSharp" }}>
                      {character.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {activeTab === "gameSettings" && (
              <div className="text-center text-cyan-400/50 py-8" style={{ fontFamily: "MedievalSharp" }}>
                🏰 Coming soon...
              </div>
            )}
            {activeTab === "gameModes" && (
              <div className="text-center text-cyan-400/50 py-8" style={{ fontFamily: "MedievalSharp" }}>
                ⚔️ Coming soon...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
