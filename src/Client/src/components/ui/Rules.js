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
        <div className="bg-zinc-900 rounded-xl p-6 w-[600px] h-[600px] text-black flex flex-col relative">
          <button
            onClick={() => setShowRules(false)}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg font-bold z-10 border border-gray-800"
            style={medievalFontStyle}
          >
            {t("info.close")}
          </button>
          <h2
            className="text-2xl text-gray-200 font-bold mb-4"
            style={medievalFontStyle}
          >
            {t("info.rulesAndTips")}
          </h2>

          {/* Rules navigation buttons */}
          <div className="flex gap-1 mb-4 flex-wrap justify-center">
            <button
              onClick={() => setRulesSection("goal")}
              className={`px-3 py-2 text-sm rounded transition ${
                rulesSection === "goal"
                  ? "bg-red-600 text-white"
                  : "bg-slate-600 text-gray-300 hover:bg-slate-500"
              }`}
            >
              {t("info.goal")}
            </button>
            <button
              onClick={() => setRulesSection("howto")}
              className={`px-3 py-2 text-sm rounded transition ${
                rulesSection === "howto"
                  ? "bg-red-600 text-white"
                  : "bg-slate-600 text-gray-300 hover:bg-slate-500"
              }`}
            >
              {t("info.howToPlay")}
            </button>
            <button
              onClick={() => setRulesSection("Stips")}
              className={`px-3 py-2 text-sm rounded transition ${
                rulesSection === "Stips"
                  ? "bg-red-600 text-white"
                  : "bg-slate-600 text-gray-300 hover:bg-slate-500"
              }`}
            >
              {t("info.strategyTips")}
            </button>
            <button
              onClick={() => setRulesSection("tips")}
              className={`px-3 py-2 text-sm rounded transition ${
                rulesSection === "tips"
                  ? "bg-red-600 text-white"
                  : "bg-slate-600 text-gray-300 hover:bg-slate-500"
              }`}
            >
              {t("info.tips")}
            </button>
            <button
              onClick={() => setRulesSection("characters")}
              className={`px-3 py-2 text-sm rounded transition ${
                rulesSection === "characters"
                  ? "bg-red-600 text-white"
                  : "bg-slate-600 text-gray-300 hover:bg-slate-500"
              }`}
            >
              {t("info.allCharacters")}
            </button>
          </div>

          {/* Rules content */}
          <div className="space-y-4 text-sm text-gray-200 flex-1 overflow-y-auto">
            {rulesSection === "goal" && (
              <div>
                <h2 className="text-lg font-bold text-red-600 mb-2">
                  {t("rules.goalTitle")}
                </h2>
                <p className="mb-3 leading-relaxed">{t("rules.goalText")}</p>
                <p className="leading-relaxed">{t("rules.gameplayText")}</p>
              </div>
            )}

            {rulesSection === "howto" && (
              <div>
                <h2 className="text-lg font-bold text-red-600 mb-2">
                  {t("rules.gameplayTitle")}
                </h2>
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-purple-600 mb-1">
                    {t("rules.teamBuildingTitle")}
                  </h3>
                  <p className="leading-relaxed mb-2">
                    {t("rules.teamBuildingText")}
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-purple-600 mb-1">
                    {t("rules.questTitle")}
                  </h3>
                  <p className="leading-relaxed">{t("rules.questText")}</p>
                </div>
              </div>
            )}

            {rulesSection === "Stips" && (
              <div>
                <h2 className="text-lg font-bold text-red-600 mb-2">
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
                <h2 className="text-lg font-bold text-red-600 mb-2">
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
                <h2 className="text-lg font-bold text-blue-600 mb-2">
                  {t("characters.goodCharacters")}
                </h2>
                <div className="leading-relaxed mb-2">
                  <span className="text-blue-600 font-semibold">Seer:</span>{" "}
                  {t("characters.seer")}
                </div>
                <p className="leading-relaxed mb-2">
                  <span className="text-blue-600 font-semibold">Guardian:</span>{" "}
                  {t("characters.guardian")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-blue-600 font-semibold">Knights:</span>{" "}
                  {t("characters.knights")}
                </p>
                <h2 className="text-lg font-bold text-red-600 mb-2">
                  {t("characters.evilCharacters")}
                </h2>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-600 font-semibold">Draven:</span>{" "}
                  {t("characters.draven")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-600 font-semibold">Seraphina:</span>{" "}
                  {t("characters.seraphina")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-600 font-semibold">Kaelen:</span>{" "}
                  {t("characters.kaelen")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-600 font-semibold">Shade:</span>{" "}
                  {t("characters.shade")}
                </p>
                <p className="leading-relaxed mb-2">
                  <span className="text-red-600 font-semibold">Thrall:</span>{" "}
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
