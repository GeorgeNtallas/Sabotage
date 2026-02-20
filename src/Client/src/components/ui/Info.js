import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function AnimatedWindow({
  triggerLabel = "Menu",
  totalTeamSize,
  gameCharacters,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const [activeTab, setActiveTab] = useState("option1");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [rulesSection, setRulesSection] = useState("goal");
  const handleToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonRect(rect);
    setOpen(!open);
  };

  // Deduplicate by name
  const uniqueCharacters = Array.from(
    new Map(gameCharacters.map((c) => [c.name, c])).values()
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
        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 transition rounded-md font-bold relative z-[60]"
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
            <div className="w-[90%] max-h ml-5 mt-10  justify-center flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden pointer-events-auto">
              {/* Tab buttons */}
              <div className="flex gap-2 p-2 border-b border-slate-700 bg-slate-800">
                <button
                  onClick={() => setActiveTab("option1")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option1"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {t("info.phasesInfo")}
                </button>
                <button
                  onClick={() => setActiveTab("option2")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option2"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {t("info.characters")}
                </button>
                <button
                  onClick={() => setActiveTab("option3")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option3"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {t("info.rulesAndTips")}
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 p-5 text-gray-200">
                {activeTab === "option1" && (
                  <div>
                    <h2 className="text-lg text-center font-bold text-purple-400 mb-2">
                      {t("info.numberOfPlayersInEachQuest")}
                    </h2>
                    {totalTeamSize && (
                      <div className="space-y-2 flex flex-col items-center mt-4">
                        {[1, 2, 3, 4, 5].map((phase) => (
                          <div
                            key={phase}
                            className="w-[60%] flex justify-center items-center gap-5 p-1 bg-slate-700 rounded"
                          >
                            <span className="font-semibold">
                              {t("info.phase")} {phase} :
                            </span>
                            <span className="text-amber-400">
                              {totalTeamSize[phase - 1]} {t("info.players")}
                            </span>
                          </div>
                        ))}
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
                          className="w-16 h-16 rounded-full bg-gray-800 shadow-lg hover:scale-110 transition flex items-center justify-center overflow-hidden"
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
                      <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg max-w-md text-center">
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
                        <p className="text-gray-300">
                          {t(
                            `characters.descriptions.${selectedCharacter.name}`
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
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        {t("info.goal")}
                      </button>
                      <button
                        onClick={() => setRulesSection("howto")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "howto"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        {t("info.howToPlay")}
                      </button>
                      <button
                        onClick={() => setRulesSection("Stips")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "Stips"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        {t("info.strategyTips")}
                      </button>
                      <button
                        onClick={() => setRulesSection("tips")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "tips"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        {t("info.tips")}
                      </button>
                      <button
                        onClick={() => setRulesSection("characters")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "characters"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
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
