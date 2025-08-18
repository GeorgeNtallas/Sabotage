import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedWindow({
  triggerLabel = "Menu",
  totalTeamSize,
  gameCharacters,
}) {
  const [open, setOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const [activeTab, setActiveTab] = useState("option1");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [rulesSection, setRulesSection] = useState("goal");
  const handleOpen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonRect(rect);
    setOpen(true);
  };

  // Deduplicate by name
  const uniqueCharacters = Array.from(
    new Map(gameCharacters.map((c) => [c.name, c])).values()
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="px-4 py-2 rounded-md bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
      >
        {triggerLabel}
      </button>

      {/* Animated Window */}
      <AnimatePresence>
        {open && buttonRect && (
          <motion.div
            className="fixed z-50"
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
            <div className="w-[90%] max-h ml-5 mt-10  justify-center flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden">
              {/* Tab buttons */}
              <div className="flex gap-2 p-2 border-b border-slate-700 bg-slate-800">
                <button
                  onClick={() => setActiveTab("option1")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option1"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Phases Info
                </button>
                <button
                  onClick={() => setActiveTab("option2")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option2"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Characters
                </button>
                <button
                  onClick={() => setActiveTab("option3")}
                  className={`flex-1 py-2 rounded font-semibold transition ${
                    activeTab === "option3"
                      ? "bg-purple-700 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Rules and Tips
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 p-5 text-gray-200">
                {activeTab === "option1" && (
                  <div>
                    <h2 className="text-lg text-center font-bold text-purple-400 mb-2">
                      Number of Players in Each Quest
                    </h2>
                    {totalTeamSize && (
                      <div className="space-y-2 flex flex-col items-center mt-4">
                        {[1, 2, 3, 4, 5].map((phase) => (
                          <div
                            key={phase}
                            className="w-[60%] flex justify-center items-center gap-5 p-1 bg-slate-700 rounded"
                          >
                            <span className="font-semibold">
                              Phase {phase}:
                            </span>
                            <span className="text-amber-400">
                              {totalTeamSize[phase - 1]} players
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
                          Team: {selectedCharacter.team}
                        </p>
                        <p className="text-gray-300">
                          {selectedCharacter.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "option3" && (
                  <div>
                    {/* Rules navigation buttons */}
                    <div className="flex gap-1 mb-3">
                      <button
                        onClick={() => setRulesSection("goal")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "goal"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        Goal
                      </button>
                      <button
                        onClick={() => setRulesSection("howto")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "howto"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        How to Play
                      </button>
                      <button
                        onClick={() => setRulesSection("tips")}
                        className={`px-2 py-1 text-xs rounded transition ${
                          rulesSection === "tips"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        Strategy Tips
                      </button>
                    </div>

                    {/* Rules content */}
                    {rulesSection === "goal" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          Goal:
                        </h2>
                        <p className="mb-3 text-sm leading-relaxed">
                          Players are secretly either Loyal Knights (Good) or
                          Dark Knights of Kaelen (Evil). Good wins by
                          successfully completing three Quests, while Evil wins
                          if three Quests fail.
                        </p>
                        <p className="text-sm leading-relaxed">
                          Throughout the game, players can say anything they
                          want to. Use a mix of discussion, deception,
                          accusation, and logical deduction to achieve victory.
                        </p>
                      </div>
                    )}

                    {rulesSection === "howto" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          How to Play:
                        </h2>
                        <div className="mb-3">
                          <h3 className="text-base font-semibold text-purple-400 mb-1">
                            1. Team Building
                          </h3>
                          <p className="text-sm leading-relaxed mb-2">
                            All players vote for the players they want on the
                            next Quest. The Leader chooses a group and all
                            players vote to approve or reject this team.
                          </p>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-purple-400 mb-1">
                            2. Quest
                          </h3>
                          <p className="text-sm leading-relaxed">
                            The approved team decides if the Quest succeeds or
                            fails. A single Evil player can cause failure.
                            Choose your team carefully!
                          </p>
                        </div>
                      </div>
                    )}

                    {rulesSection === "tips" && (
                      <div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">
                          Strategy Tip: Trust No One
                        </h2>
                        <p className="text-sm leading-relaxed mb-3">
                          It's a mistake to approve a team unless you're
                          confident about every single player on it. Don't be
                          afraid to reject a proposal—doing so doesn't make you
                          look Evil.
                        </p>
                        <p className="text-sm leading-relaxed">
                          Pay close attention to who votes "yes" and ask them to
                          explain their reasoning. Sometimes, Evil players will
                          approve a team because they know another Evil player
                          is on it.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Close button */}
              <div className="p-2 border-t border-slate-700 flex justify-end bg-slate-800">
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
