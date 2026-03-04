import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Animation from "../tools/Animation";

function Rules({ showRules, setShowRules }) {
  const { t } = useTranslation();
  const [rulesSection, setRulesSection] = useState("goal");

  const medievalFontStyle = {
    fontFamily: "MedievalSharp",
    fontWeight: 400,
  };

  if (!showRules) return null;

  return (
    <Animation show={showRules}>
      <div className="fixed inset-8 flex items-center justify-center z-50">
        <div className="bg-black/95 backdrop-blur-lg border-2 border-amber-600/50 rounded-xl shadow-[0_0_30px_rgba(200,100,50,0.3)] p-5 w-[600px] min-w-[320px] h-[600px] text-white flex flex-col relative">
          {/* Corner decorations - amber style */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h2
              className="text-xl font-bold text-amber-500"
              style={medievalFontStyle}
            >
              {t("info.rulesAndTips")}
            </h2>
            <button
              onClick={() => setShowRules(false)}
              className="text-amber-500 hover:text-red-400 text-2xl font-bold transition"
            >
              x
            </button>
          </div>

          {/* Rules navigation buttons */}
          <div className="flex gap-1 mb-4 flex-wrap justify-center">
            <button
              onClick={() => setRulesSection("goal")}
              className={`px-3 py-2 text-sm rounded-sm transition border ${
                rulesSection === "goal"
                  ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                  : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
              }`}
            >
              {t("info.goal")}
            </button>
            <button
              onClick={() => setRulesSection("howto")}
              className={`px-3 py-2 text-sm rounded-sm transition border ${
                rulesSection === "howto"
                  ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                  : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
              }`}
            >
              {t("info.howToPlay")}
            </button>
            <button
              onClick={() => setRulesSection("Stips")}
              className={`px-3 py-2 text-sm rounded-sm transition border ${
                rulesSection === "Stips"
                  ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                  : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
              }`}
            >
              {t("info.strategyTips")}
            </button>
            <button
              onClick={() => setRulesSection("tips")}
              className={`px-3 py-2 text-sm rounded-sm transition border ${
                rulesSection === "tips"
                  ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                  : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
              }`}
            >
              {t("info.tips")}
            </button>
            <button
              onClick={() => setRulesSection("characters")}
              className={`px-3 py-2 text-sm rounded-sm transition border ${
                rulesSection === "characters"
                  ? "bg-red-900/40 text-amber-400 border-amber-600/50"
                  : "bg-stone-900/80 text-stone-400 hover:text-amber-300 border-stone-700"
              }`}
            >
              {t("info.allCharacters")}
            </button>
          </div>

          {/* Rules content */}
          <div className="space-y-4 text-sm text-amber-100/80 flex-1 overflow-y-auto pr-2">
            {rulesSection === "goal" && (
              <div>
                <h2
                  className="text-lg font-bold text-amber-500 mb-2"
                  style={medievalFontStyle}
                >
                  {t("rules.goalTitle")}
                </h2>
                <p className="mb-3 leading-relaxed">{t("rules.goalText")}</p>
                <p className="leading-relaxed">{t("rules.gameplayText")}</p>
              </div>
            )}

            {rulesSection === "howto" && (
              <div>
                <h2
                  className="text-lg font-bold text-amber-500 mb-2"
                  style={medievalFontStyle}
                >
                  {t("rules.gameplayTitle")}
                </h2>
                <div className="mb-3">
                  <h3
                    className="text-base font-semibold text-orange-400 mb-1"
                    style={medievalFontStyle}
                  >
                    {t("rules.teamBuildingTitle")}
                  </h3>
                  <p className="leading-relaxed mb-2">
                    {t("rules.teamBuildingText")}
                  </p>
                </div>
                <div>
                  <h3
                    className="text-base font-semibold text-orange-400 mb-1"
                    style={medievalFontStyle}
                  >
                    {t("rules.questTitle")}
                  </h3>
                  <p className="leading-relaxed">{t("rules.questText")}</p>
                </div>
              </div>
            )}

            {rulesSection === "Stips" && (
              <div>
                <h2
                  className="text-lg font-bold text-amber-500 mb-2"
                  style={medievalFontStyle}
                >
                  {t("rules.strategyTitle")}
                </h2>
                <p className="leading-relaxed mb-3">
                  {t("rules.strategyText1")}
                </p>
                <p className="leading-relaxed">{t("rules.strategyText2")}</p>
              </div>
            )}

            {rulesSection === "tips" && (
              <div>
                <h2
                  className="text-lg font-bold text-amber-500 mb-2"
                  style={medievalFontStyle}
                >
                  {t("info.tips")}
                </h2>
                <p className="leading-relaxed mb-2">{t("tips.avoidComplex")}</p>
                <p className="leading-relaxed mb-2">{t("tips.bluffingKey")}</p>
                <p className="leading-relaxed mb-2">{t("tips.evilBlendIn")}</p>
                <p className="leading-relaxed mb-2">
                  {t("tips.evilVoteSuccess")}
                </p>
                <p className="leading-relaxed mb-2">{t("tips.thrallTip")}</p>
                <p className="leading-relaxed mb-2">{t("tips.shadeTip")}</p>
                <p className="leading-relaxed mb-2">{t("tips.seerTip")}</p>
                <p className="leading-relaxed">{t("tips.guardianTip")}</p>
              </div>
            )}

            {rulesSection === "characters" && (
              <div>
                <h2
                  className="text-lg font-bold text-yellow-400 mb-2"
                  style={medievalFontStyle}
                >
                  {t("characters.goodCharacters")}
                </h2>
                <div className="leading-relaxed mb-2">
                  <span className="text-yellow-300 font-semibold">Seer:</span>{" "}
                  {t("characters.seer")}
                </div>
                <p className="leading-relaxed mb-2">
                  <span className="text-yellow-300 font-semibold">
                    Guardian:
                  </span>{" "}
                  {t("characters.guardian")}
                </p>
                <p className="leading-relaxed mb-3">
                  <span className="text-yellow-300 font-semibold">
                    Knights:
                  </span>{" "}
                  {t("characters.knights")}
                </p>
                <h2
                  className="text-lg font-bold text-red-500 mb-2"
                  style={medievalFontStyle}
                >
                  {t("characters.evilCharacters")}
                </h2>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-400 font-semibold">Draven:</span>{" "}
                  {t("characters.draven")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-400 font-semibold">Seraphina:</span>{" "}
                  {t("characters.seraphina")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-400 font-semibold">Kaelen:</span>{" "}
                  {t("characters.kaelen")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-400 font-semibold">Shade:</span>{" "}
                  {t("characters.shade")}
                </p>
                <p className="leading-relaxed">
                  <span className="text-red-400 font-semibold">Thrall:</span>{" "}
                  {t("characters.thrall")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Animation>
  );
}

export default Rules;
