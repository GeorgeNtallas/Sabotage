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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border-2 border-slate-600 shadow-2xl w-[90%] max-w-md flex flex-col text-white"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-600">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="flex border-b border-slate-600">
                <button
                  onClick={() => setActiveTab("characters")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "characters"
                      ? "bg-slate-700 text-white border-b-2 border-amber-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setActiveTab("gameSettings")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameSettings"
                      ? "bg-slate-700 text-white border-b-2 border-amber-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Game Settings
                </button>
                <button
                  onClick={() => setActiveTab("gameModes")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameModes"
                      ? "bg-slate-700 text-white border-b-2 border-amber-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Game Modes
                </button>
              </div>
              <div className="p-4">
                {activeTab === "characters" && (
                  <div className="grid grid-cols-3 gap-3">
                    {characters.map((character) => (
                      <button
                        key={character.name}
                        onClick={() => toggleRole(character.name)}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition ${
                          isChecked(character.name)
                            ? "border-amber-500 bg-slate-600/50"
                            : "border-slate-500 bg-slate-800/30 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={character.icon}
                          alt={character.name}
                          className="w-16 h-16 rounded-full mb-2"
                          onError={(e) =>
                            (e.target.src = "/images/default.jpg")
                          }
                        />
                        <span className="text-sm font-semibold">
                          {character.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === "gameSettings" && (
                  <div className="text-center text-gray-400 py-8">
                    Coming soon...
                  </div>
                )}
                {activeTab === "gameModes" && (
                  <div className="text-center text-gray-400 py-8">
                    Coming soon...
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border-2 border-slate-600 shadow-2xl w-[350px] h-[400px] flex flex-col text-white">
          <div className="p-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white text-center">
              Settings
            </h2>
          </div>
          <div className="flex border-b border-slate-600">
            <button
              onClick={() => setActiveTab("characters")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "characters"
                  ? "bg-slate-700 text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Characters
            </button>
            <button
              onClick={() => setActiveTab("gameSettings")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameSettings"
                  ? "bg-slate-700 text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Game Settings
            </button>
            <button
              onClick={() => setActiveTab("gameModes")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameModes"
                  ? "bg-slate-700 text-white border-b-2 border-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Game Modes
            </button>
          </div>
          <div className="p-4">
            {activeTab === "characters" && (
              <div className="grid grid-cols-3 gap-3">
                {characters.map((character) => (
                  <button
                    key={character.name}
                    onClick={() => toggleRole(character.name)}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition ${
                      isChecked(character.name)
                        ? "border-amber-500 bg-slate-600/50"
                        : "border-slate-500 bg-slate-800/30 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={character.icon}
                      alt={character.name}
                      className="w-16 h-16 rounded-full mb-2"
                      onError={(e) => (e.target.src = "/images/default.jpg")}
                    />
                    <span className="text-sm font-semibold">
                      {character.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {activeTab === "gameSettings" && (
              <div className="text-center text-gray-400 py-8">
                Coming soon...
              </div>
            )}
            {activeTab === "gameModes" && (
              <div className="text-center text-gray-400 py-8">
                Coming soon...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
