import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function AnimatedWindow({
  triggerLabel = "Menu",
  totalTeamSize,
  gameCharacters,
  phaseVoters = {},
  players = [],
  disabled = false,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const [activeTab, setActiveTab] = useState("option1");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [rulesSection, setRulesSection] = useState("goal");
  const handleToggle = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonRect(rect);
    setOpen(!open);
  };

  // Deduplicate by name
  const uniqueCharacters = Array.from(
    new Map(gameCharacters.map((c) => [c.name, c])).values(),
  );

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Trigger button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`px-3 py-2 transition rounded-md font-bold relative z-[40] border ${
          disabled
            ? "bg-zinc-800/50 border-zinc-700/50 cursor-not-allowed opacity-50"
            : "bg-purple-900 hover:bg-purple-800 border-purple-500/50"
        }`}
      >
        {triggerLabel}
      </button>

      {/* Animated Window */}
      <AnimatePresence>
        {open && buttonRect && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            initial={{
              top: buttonRect.top,
              left: buttonRect.left,
              width: buttonRect.width,
              height: buttonRect.height,
              opacity: 0,
            }}
            animate={{
              top: "15%",
              left: "50%",
              x: "-50%",
              width: 420,
              height: 400,
              opacity: 1,
            }}
            exit={{
              top: buttonRect.top,
              left: buttonRect.left,
              width: buttonRect.width,
              height: buttonRect.height,
              opacity: 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div
              className="w-[80%] max-h ml-10 mt-10 justify-center flex flex-col rounded-2xl shadow-2xl bg-black/95 border border-purple-500/50 overflow-hidden pointer-events-auto"
              style={{
                background:
                  "linear-gradient(135deg, #1a0e1a 0%, #130d18 25%, #1a0e1a 50%, #130d18 75%, #1a0e1a 100%)",
              }}
            >
              {/* Tab buttons */}
              <div className="flex gap-2 p-2 border-b border-purple-500/30 bg-black/50">
                <button
                  onClick={() => setActiveTab("option1")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option1"
                      ? "bg-purple-900 text-white"
                      : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                  }`}
                >
                  {t("info.phasesInfo")}
                </button>
                <button
                  onClick={() => setActiveTab("option2")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option2"
                      ? "bg-purple-900 text-white"
                      : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                  }`}
                >
                  {t("info.characters")}
                </button>
                <button
                  onClick={() => setActiveTab("option3")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option3"
                      ? "bg-purple-900 text-white"
                      : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                  }`}
                >
                  {t("info.rulesAndTips")}
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 p-6 text-purple-200 overflow-y-auto max-h-[450px]">
                {activeTab === "option1" && (
                  <div>
                    <h2 className="text-lg text-center font-bold text-purple-400 mb-2">
                      {t("info.numberOfPlayersInEachQuest")}
                    </h2>
                    {totalTeamSize && (
                      <div className="space-y-2 flex flex-col items-center mt-4">
                        {/* Column titles */}
                        <div className="flex justify-between items-center px-3 mb-1 text-xs text-purple-400 font-semibold w-[94%]">
                          <span className="w-1/3">{t("info.phase")}</span>
                          <span className="w-1/3 text-center">
                            {t("info.players")}
                          </span>
                          <span className="w-1/3 text-center">
                            {t("info.failsNeeded")}
                          </span>
                        </div>
                        {[1, 2, 3, 4, 5].map((phase) => {
                          const voters = phaseVoters[phase] || [];
                          const voterNames = voters
                            .map(
                              (psk) =>
                                players.find((p) => p.playerSessionKey === psk)
                                  ?.name,
                            )
                            .filter(Boolean);

                          const playerCount = players.length;
                          let failsNeeded = 1;
                          if (
                            playerCount >= 7 &&
                            playerCount <= 10 &&
                            phase === 4
                          ) {
                            failsNeeded = 2;
                          }

                          return (
                            <div
                              key={phase}
                              className="flex justify-between items-center w-[94%] bg-purple-950/50 rounded p-2 mb-1"
                            >
                              <span className="w-1/3 font-semibold">
                                {t("info.phase")} {phase}
                              </span>
                              <span className="w-1/3 text-center text-amber-400">
                                {totalTeamSize[phase - 1]}
                              </span>
                              <span className="w-1/3 text-center text-red-400 text-xs">
                                {failsNeeded}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "option2" && (
                  <div className="flex flex-col items-center">
                    {/* Character buttons */}
                    <div className="flex flex-wrap gap-5 justify-center mb-2">
                      {uniqueCharacters.map((character) => (
                        <button
                          key={character.name}
                          onClick={() => setSelectedCharacter(character)}
                          className="w-16 h-16 rounded-full bg-black/80 shadow-lg hover:scale-110 transition flex items-center justify-center overflow-hidden border border-purple-500/30"
                        >
                          <img
                            src={`/images/${character.name}Icon.png`}
                            alt={character.name}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.src = "/images/defaultIcon.png")
                            }
                          />
                        </button>
                      ))}
                    </div>

                    {/* Info panel */}
                    {selectedCharacter && (
                      <div className="bg-black/80 text-white p-4 rounded-xl shadow-lg max-w-md text-center border border-purple-500/30">
                        <h3 className="text-2xl font-bold text-amber-400 mb-2">
                          {selectedCharacter.name}
                        </h3>
                        <p
                          className={`mb-2 ${
                            selectedCharacter.team === "good"
                              ? "text-blue-400"
                              : "text-red-400"
                          }`}
                        >
                          {t("game.team")}:{" "}
                          {t(`game.${selectedCharacter.team}`)}
                        </p>
                        <p className="text-purple-300">
                          {t(
                            `characters.descriptions.${selectedCharacter.name}`,
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "option3" && (
                  <div>
                    {/* Rules navigation buttons */}
                    <div className="flex gap-1 mb-2">
                      <button
                        onClick={() => setRulesSection("goal")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "goal"
                            ? "bg-purple-900 text-white"
                            : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                        }`}
                      >
                        {t("info.goal")}
                      </button>
                      <button
                        onClick={() => setRulesSection("howto")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "howto"
                            ? "bg-purple-900 text-white"
                            : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                        }`}
                      >
                        {t("info.howToPlay")}
                      </button>
                      <button
                        onClick={() => setRulesSection("Stips")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "Stips"
                            ? "bg-purple-900 text-white"
                            : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                        }`}
                      >
                        {t("info.strategyTips")}
                      </button>
                      <button
                        onClick={() => setRulesSection("tips")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "tips"
                            ? "bg-purple-900 text-white"
                            : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                        }`}
                      >
                        {t("info.tips")}
                      </button>
                      <button
                        onClick={() => setRulesSection("characters")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "characters"
                            ? "bg-purple-900 text-white"
                            : "bg-purple-950 text-purple-300 hover:bg-purple-900"
                        }`}
                      >
                        {t("info.allCharacters")}
                      </button>
                    </div>

                    {/* Rules content */}
                    {rulesSection === "goal" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          {t("rules.goalTitle")}
                        </h2>
                        <p className="mb-3 text-sm leading-relaxed">
                          {t("rules.goalText")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("rules.gameplayText")}
                        </p>
                      </div>
                    )}

                    {rulesSection === "howto" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          {t("rules.gameplayTitle")}
                        </h2>
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-purple-400 mb-1">
                            {t("rules.teamBuildingTitle")}
                          </h3>
                          <p className="text-sm leading-relaxed mb-2">
                            {t("rules.teamBuildingText")}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-purple-400 mb-1">
                            {t("rules.questTitle")}
                          </h3>
                          <p className="text-sm leading-relaxed">
                            {t("rules.questText")}
                          </p>
                        </div>
                      </div>
                    )}

                    {rulesSection === "Stips" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          {t("rules.strategyTitle")}
                        </h2>
                        <p className="text-sm leading-relaxed mb-3">
                          {t("rules.strategyText1")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("rules.strategyText2")}
                        </p>
                      </div>
                    )}
                    {rulesSection === "tips" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          {t("info.tips")}
                        </h2>
                        <p className="text-sm leading-relaxed mb-2">
                          {t("tips.avoidComplex")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          {t("tips.bluffingKey")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          {t("tips.evilBlendIn")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          {t("tips.evilVoteSuccess")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("tips.thrallTip")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("tips.shadeTip")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("tips.seerTip")}
                        </p>
                        <p className="text-sm leading-relaxed">
                          {t("tips.guardianTip")}
                        </p>
                      </div>
                    )}
                    {rulesSection === "characters" && (
                      <div>
                        <h2 className="text-lg font-bold text-blue-400 mb-2">
                          {t("characters.goodCharacters")}
                        </h2>
                        <div className="text-sm leading-relaxed mb-2">
                          <span className="text-blue-400 font-semibold">
                            Seer:
                          </span>{" "}
                          {t("characters.seer")}
                        </div>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-blue-400 font-semibold">
                            Guardian:
                          </span>{" "}
                          {t("characters.guardian")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-blue-400 font-semibold">
                            Knights:
                          </span>{" "}
                          {t("characters.knights")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-blue-400 font-semibold">
                            Zealot:
                          </span>{" "}
                          {t("characters.zealot")}
                        </p>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          {t("characters.evilCharacters")}
                        </h2>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Draven:
                          </span>{" "}
                          {t("characters.draven")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Seraphina:
                          </span>{" "}
                          {t("characters.seraphina")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Kaelen:
                          </span>{" "}
                          {t("characters.kaelen")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Shade:
                          </span>{" "}
                          {t("characters.shade")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Thrall:
                          </span>{" "}
                          {t("characters.thrall")}
                        </p>
                        <p className="text-sm leading-relaxed mb-2">
                          <span className="text-red-400 font-semibold">
                            Illusionist:
                          </span>{" "}
                          {t("characters.illusionist")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
