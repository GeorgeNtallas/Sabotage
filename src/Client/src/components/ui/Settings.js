import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CHARACTERS } from "../../constants";

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
  const { t } = useTranslation();

  const playerCount = readyPlayers.length;

  const allCharacters = [
    {
      name: "Seer",
      icon: "/images/SeerIcon.png",
      minPlayers: 5,
      description: CHARACTERS.Seer?.description || "",
    },
    {
      name: "Guardian",
      icon: "/images/GuardianIcon.png",
      minPlayers: 6,
      description: CHARACTERS.Guardian?.description || "",
    },
    {
      name: "Seraphina",
      icon: "/images/SeraphinaIcon.png",
      minPlayers: 6,
      description: CHARACTERS.Seraphina?.description || "",
    },
    {
      name: "Shade",
      icon: "/images/ShadeIcon.png",
      minPlayers: 5,
      description: CHARACTERS.Shade?.description || "",
    },
    {
      name: "Draven",
      icon: "/images/DravenIcon.png",
      minPlayers: 7,
      description: CHARACTERS.Draven?.description || "",
    },
    {
      name: "Kaelen",
      icon: "/images/KaelenIcon.png",
      minPlayers: 8,
      description: CHARACTERS.Kaelen?.description || "",
    },
  ];

  // Show all characters but disable those that require more players
  const isCharacterEnabled = (minPlayers) => playerCount >= minPlayers;

  if (isMobile) {
    return (
      showSettings && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-black/98 border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] w-[90%] max-w-md flex flex-col text-white relative"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner decorations - purple style */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

              <div className="flex justify-between items-center p-4 border-b border-purple-500/30">
                <h2
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400"
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {t("oneDevice.questSettings")}
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-purple-400 hover:text-purple-300 text-3xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="flex border-b border-purple-500/30">
                <button
                  onClick={() => setActiveTab("characters")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "characters"
                      ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_10px_rgba(150,50,150,0.4)]"
                      : "text-purple-400/50 hover:text-purple-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {t("oneDevice.heroes")}
                </button>
                <button
                  onClick={() => setActiveTab("gameSettings")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameSettings"
                      ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_10px_rgba(150,50,150,0.4)]"
                      : "text-purple-400/50 hover:text-purple-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {t("oneDevice.rules")}
                </button>
                <button
                  onClick={() => setActiveTab("gameModes")}
                  className={`flex-1 py-3 font-semibold transition ${
                    activeTab === "gameModes"
                      ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_10px_rgba(150,50,150,0.4)]"
                      : "text-purple-400/50 hover:text-purple-400/80"
                  }`}
                  style={{ fontFamily: "MedievalSharp" }}
                >
                  {t("oneDevice.modes")}
                </button>
              </div>
              <div className="p-4">
                {activeTab === "characters" && (
                  <div className="grid grid-cols-3 gap-3">
                    {allCharacters.map((character) => {
                      const enabled = isCharacterEnabled(character.minPlayers);
                      return (
                        <div key={character.name} className="relative group">
                          <button
                            onClick={() =>
                              enabled && toggleRole(character.name)
                            }
                            disabled={!enabled}
                            className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                              !enabled
                                ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                                : isChecked(character.name)
                                  ? "border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(150,50,150,0.4)]"
                                  : "border-zinc-700 bg-zinc-900/50 hover:border-purple-500/50"
                            }`}
                          >
                            <img
                              src={character.icon}
                              alt={character.name}
                              className="w-16 h-16 rounded-full mb-2 border border-purple-500/30"
                              onError={(e) =>
                                (e.target.src = "/images/default.jpg")
                              }
                            />
                            <span
                              className={`text-xs font-semibold ${
                                !enabled ? "text-zinc-500" : "text-purple-200"
                              }`}
                              style={{ fontFamily: "MedievalSharp" }}
                            >
                              {character.name}
                              {!enabled && ` (${character.minPlayers})`}
                            </span>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                            {character.description}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeTab === "gameSettings" && (
                  <div
                    className="text-center text-purple-400/50 py-8"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {t("oneDevice.comingSoon")}
                  </div>
                )}
                {activeTab === "gameModes" && (
                  <div
                    className="text-center text-purple-400/50 py-8"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {t("oneDevice.comingSoon")}
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
        <div className="bg-black border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] w-[350px] h-[400px] flex flex-col text-white relative">
          {/* Corner decorations - purple style */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-purple-500"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-purple-500"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-purple-500"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-purple-500"></div>

          <div className="p-4 border-b border-purple-500/30">
            <h2
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 text-center"
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("oneDevice.questSettings")}
            </h2>
          </div>
          <div className="flex border-b border-purple-500/30">
            <button
              onClick={() => setActiveTab("characters")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "characters"
                  ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500"
                  : "text-purple-400/50 hover:text-purple-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("oneDevice.heroes")}
            </button>
            <button
              onClick={() => setActiveTab("gameSettings")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameSettings"
                  ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500"
                  : "text-purple-400/50 hover:text-purple-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("oneDevice.rules")}
            </button>
            <button
              onClick={() => setActiveTab("gameModes")}
              className={`flex-1 py-3 font-semibold transition ${
                activeTab === "gameModes"
                  ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500"
                  : "text-purple-400/50 hover:text-purple-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("oneDevice.modes")}
            </button>
          </div>
          <div className="p-4">
            {activeTab === "characters" && (
              <div className="grid grid-cols-3 gap-3">
                {allCharacters.map((character) => {
                  const enabled = isCharacterEnabled(character.minPlayers);
                  return (
                    <div key={character.name} className="relative group">
                      <button
                        onClick={() => enabled && toggleRole(character.name)}
                        disabled={!enabled}
                        className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                          !enabled
                            ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                            : isChecked(character.name)
                              ? "border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(150,50,150,0.4)]"
                              : "border-zinc-700 bg-zinc-900/50 hover:border-purple-500/50"
                        }`}
                      >
                        <img
                          src={character.icon}
                          alt={character.name}
                          className="w-16 h-16 rounded-full mb-2 border border-purple-500/30"
                          onError={(e) =>
                            (e.target.src = "/images/default.jpg")
                          }
                        />
                        <span
                          className={`text-xs font-semibold ${
                            !enabled ? "text-zinc-500" : "text-purple-200"
                          }`}
                          style={{ fontFamily: "MedievalSharp" }}
                        >
                          {character.name}
                          {!enabled && ` (${character.minPlayers})`}
                        </span>
                      </button>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                        {character.description}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === "gameSettings" && (
              <div
                className="text-center text-purple-400/50 py-8"
                style={{ fontFamily: "MedievalSharp" }}
              >
                {t("oneDevice.comingSoon")}
              </div>
            )}
            {activeTab === "gameModes" && (
              <div
                className="text-center text-purple-400/50 py-8"
                style={{ fontFamily: "MedievalSharp" }}
              >
                {t("oneDevice.comingSoon")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
