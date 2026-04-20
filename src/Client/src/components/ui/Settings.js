import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { CHARACTERS } from "../../constants";
import { ROLE_BALANCE } from "../../constants";

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

  const [modesVisibility, setModesVisibility] = useState(false);
  const isChecked = (role) => selectedRoles.has(role);
  const { t } = useTranslation();

  const playerCount = readyPlayers.length;

  // Get role balance based on player count
  const roleBalance = ROLE_BALANCE[playerCount] || {
    good: playerCount,
    evil: 0,
  };

  const maxGoodCharacters = 3;
  const maxEvilCharacters = roleBalance.evil;

  // Count currently selected good and evil characters
  const selectedGoodCount = Object.values(CHARACTERS).filter(
    (c) => c.team === "good" && selectedRoles.has(c.name),
  ).length;
  const selectedEvilCount = Object.values(CHARACTERS).filter(
    (c) => c.team === "evil" && selectedRoles.has(c.name),
  ).length;

  // Check if can select more of a specific team
  const canSelectGood = selectedGoodCount < maxGoodCharacters;
  const canSelectEvil = selectedEvilCount < maxEvilCharacters;

  // Toggle role function with team limit check
  const handleToggleRole = (roleName) => {
    const character = Object.values(CHARACTERS).find(
      (c) => c.name === roleName,
    );
    if (!character) return;

    if (selectedRoles.has(roleName)) {
      // Always allow deselecting
      toggleRole(roleName);
    } else {
      // Check team-specific limits
      if (character.team === "good" && !canSelectGood) return;
      if (character.team === "evil" && !canSelectEvil) return;
      toggleRole(roleName);
    }
  };

  // Check if a character can be selected based on team limits and min players
  const isCharacterEnabled = (character) => {
    // Always allow if already selected (so user can deselect)
    if (selectedRoles.has(character.name)) return true;

    // Check if player count meets the character's minimum player requirement
    if (playerCount < character.minPlayers) return false;

    if (character.team === "good") return canSelectGood;
    if (character.team === "evil") return canSelectEvil;
    return true;
  };

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
              className="bg-black/98 border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] w-[350px] h-[550px] flex flex-col text-white relative"
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
              </div>
              <div className="p-4">
                {activeTab === "characters" && (
                  <>
                    {/* Good Characters Section */}
                    <div className="mb-4">
                      <h3
                        className="text-cyan-400 text-sm font-bold mb-2 text-center"
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        {t("good")} ({selectedGoodCount}/{maxGoodCharacters})
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.values(CHARACTERS)
                          .filter(
                            (c) => c.team === "good" && c.name !== "Knight",
                          )
                          .map((character) => {
                            const enabled = isCharacterEnabled(character);
                            return (
                              <div
                                key={character.name}
                                className="relative group"
                              >
                                <button
                                  onClick={() =>
                                    enabled && handleToggleRole(character.name)
                                  }
                                  disabled={!enabled}
                                  className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                                    !enabled
                                      ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                                      : isChecked(character.name)
                                        ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                        : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                                  }`}
                                >
                                  <img
                                    src={character.icon}
                                    alt={character.name}
                                    className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                                    onError={(e) =>
                                      (e.target.src = "/images/default.jpg")
                                    }
                                  />
                                  <span
                                    className={`text-xs font-semibold ${
                                      !enabled
                                        ? "text-zinc-500"
                                        : "text-cyan-200"
                                    }`}
                                    style={{ fontFamily: "MedievalSharp" }}
                                  >
                                    {character.name}
                                    {` (${character.minPlayers})`}
                                  </span>
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                                  <span className="text-cyan-400 block">
                                    {t(`${character.team}`)}
                                  </span>
                                  <span
                                    className="block mt-1"
                                    style={{ fontFamily: "MedievalSharp" }}
                                  >
                                    {t(
                                      `characters.descriptions.${character.name}`,
                                    )}
                                  </span>

                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Evil Characters Section */}
                    <div>
                      <h3
                        className="text-red-400 text-sm font-bold mb-2 text-center"
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        {t("evil")} ({selectedEvilCount}/{maxEvilCharacters})
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.values(CHARACTERS)
                          .filter(
                            (c) => c.team === "evil" && c.name !== "Thrall",
                          )
                          .map((character) => {
                            const enabled = isCharacterEnabled(character);
                            return (
                              <div
                                key={character.name}
                                className="relative group"
                              >
                                <button
                                  onClick={() =>
                                    enabled && handleToggleRole(character.name)
                                  }
                                  disabled={!enabled}
                                  className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                                    !enabled
                                      ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                                      : isChecked(character.name)
                                        ? "border-red-500 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                        : "border-zinc-700 bg-zinc-900/50 hover:border-red-500/50"
                                  }`}
                                >
                                  <img
                                    src={character.icon}
                                    alt={character.name}
                                    className="w-16 h-16 rounded-full mb-2 border border-red-500/30"
                                    onError={(e) =>
                                      (e.target.src = "/images/default.jpg")
                                    }
                                  />
                                  <span
                                    className={`text-xs font-semibold ${
                                      !enabled
                                        ? "text-zinc-500"
                                        : "text-red-200"
                                    }`}
                                    style={{ fontFamily: "MedievalSharp" }}
                                  >
                                    {character.name}
                                    {` (${character.minPlayers})`}
                                  </span>
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                                  <span className="text-red-400 block">
                                    {t(`${character.team}`)}
                                  </span>
                                  <span
                                    className="block mt-1"
                                    style={{ fontFamily: "MedievalSharp" }}
                                  >
                                    {t(
                                      `characters.descriptions.${character.name}`,
                                    )}
                                  </span>

                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "gameSettings" && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* English Flag Button */}
                    <button
                      onClick={() => i18n.changeLanguage("en")}
                      className={`flex flex-col items-center p-3 rounded-lg border transition ${
                        i18n.language === "en"
                          ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                      }`}
                    >
                      <img
                        src="images\gb.png"
                        alt="English"
                        className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                        onError={(e) => (e.target.src = "/images/default.jpg")}
                      />
                      <span
                        className="text-xs font-semibold text-cyan-200"
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        English
                      </span>
                    </button>

                    {/* Greek Flag Button */}
                    <button
                      onClick={() => i18n.changeLanguage("gr")}
                      className={`flex flex-col items-center p-3 rounded-lg border transition ${
                        i18n.language === "gr"
                          ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                      }`}
                    >
                      <img
                        src="images/gr.png"
                        alt="Greek"
                        className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                        onError={(e) => (e.target.src = "/images/default.jpg")}
                      />
                      <span
                        className="text-xs font-semibold text-cyan-200"
                        style={{ fontFamily: "MedievalSharp" }}
                      >
                        Ελληνικά
                      </span>
                    </button>
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
        <div className="bg-black border-2 border-purple-600/50 rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] w-[350px] flex flex-col text-white relative">
          {/* Corner decorations - purple style */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

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
                  ? "bg-zinc-900/50 text-purple-400 border-b-2 border-purple-500 shadow-[0_0_10px_rgba(150,50,150,0.4)]"
                  : "text-purple-400/50 hover:text-purple-400/80"
              }`}
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("oneDevice.heroes")}
            </button>
          </div>
          <div className="p-4">
            {activeTab === "characters" && (
              <>
                {/* Good Characters Section */}
                <div className="mb-4">
                  <h3
                    className="text-cyan-400 text-sm font-bold mb-2 text-center"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {t("good")} ({selectedGoodCount}/{maxGoodCharacters})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(CHARACTERS)
                      .filter((c) => c.team === "good" && c.name !== "Knight")
                      .map((character) => {
                        const enabled = isCharacterEnabled(character);
                        return (
                          <div key={character.name} className="relative group">
                            <button
                              onClick={() => handleToggleRole(character.name)}
                              disabled={!enabled}
                              className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                                !enabled
                                  ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                                  : isChecked(character.name)
                                    ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                    : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                              }`}
                            >
                              <img
                                src={character.icon}
                                alt={character.name}
                                className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                                onError={(e) =>
                                  (e.target.src = "/images/default.jpg")
                                }
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  !enabled ? "text-zinc-500" : "text-cyan-200"
                                }`}
                                style={{ fontFamily: "MedievalSharp" }}
                              >
                                {character.name}
                                {!enabled && ` (${character.minPlayers})`}
                              </span>
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                              <span className="text-cyan-400 block">
                                {t(`${character.team}`)}
                              </span>
                              <span
                                className="block mt-1"
                                style={{ fontFamily: "MedievalSharp" }}
                              >
                                {t(`characters.descriptions.${character.name}`)}
                              </span>

                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Evil Characters Section */}
                <div>
                  <h3
                    className="text-red-400 text-sm font-bold mb-2 text-center"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    {t("evil")} ({selectedEvilCount}/{maxEvilCharacters})
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(CHARACTERS)
                      .filter((c) => c.team === "evil" && c.name !== "Thrall")
                      .map((character) => {
                        const enabled = isCharacterEnabled(character);
                        return (
                          <div key={character.name} className="relative group">
                            <button
                              onClick={() => handleToggleRole(character.name)}
                              disabled={!enabled}
                              className={`flex flex-col items-center p-2 rounded-lg border transition w-full ${
                                !enabled
                                  ? "border-zinc-800 bg-zinc-900/30 opacity-40 cursor-not-allowed"
                                  : isChecked(character.name)
                                    ? "border-red-500 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    : "border-zinc-700 bg-zinc-900/50 hover:border-red-500/50"
                              }`}
                            >
                              <img
                                src={character.icon}
                                alt={character.name}
                                className="w-16 h-16 rounded-full mb-2 border border-red-500/30"
                                onError={(e) =>
                                  (e.target.src = "/images/default.jpg")
                                }
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  !enabled ? "text-zinc-500" : "text-red-200"
                                }`}
                                style={{ fontFamily: "MedievalSharp" }}
                              >
                                {character.name}
                                {!enabled && ` (${character.minPlayers})`}
                              </span>
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-purple-950/95 border border-purple-500/50 rounded-lg text-xs text-purple-200 whitespace-normal w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg text-center">
                              <span className="text-red-400 block">
                                {t(`${character.team}`)}
                              </span>
                              <span
                                className="block mt-1"
                                style={{ fontFamily: "MedievalSharp" }}
                              >
                                {t(`characters.descriptions.${character.name}`)}
                              </span>

                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-purple-500/50"></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
            {activeTab === "gameSettings" && (
              <div className="grid grid-cols-2 gap-4">
                {/* English Flag Button */}
                <button
                  onClick={() => i18n.changeLanguage("en")}
                  className={`flex flex-col items-center p-3 rounded-lg border transition ${
                    i18n.language === "en"
                      ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                      : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                  }`}
                >
                  <img
                    src="images\gb.png"
                    alt="English"
                    className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                    onError={(e) => (e.target.src = "/images/default.jpg")}
                  />
                  <span
                    className="text-xs font-semibold text-cyan-200"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    English
                  </span>
                </button>

                {/* Greek Flag Button */}
                <button
                  onClick={() => i18n.changeLanguage("gr")}
                  className={`flex flex-col items-center p-3 rounded-lg border transition ${
                    i18n.language === "gr"
                      ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                      : "border-zinc-700 bg-zinc-900/50 hover:border-cyan-500/50"
                  }`}
                >
                  <img
                    src="images/gr.png"
                    alt="Greek"
                    className="w-16 h-16 rounded-full mb-2 border border-cyan-500/30"
                    onError={(e) => (e.target.src = "/images/default.jpg")}
                  />
                  <span
                    className="text-xs font-semibold text-cyan-200"
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    Ελληνικά
                  </span>
                </button>
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
