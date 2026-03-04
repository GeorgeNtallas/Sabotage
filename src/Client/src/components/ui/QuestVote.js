import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SparkParticles from "../ui/SparkParticles";
import socket from "../../socket";

const QuestVote = ({
  setShowQuestVoting,
  roomSessionKey,
  playerSessionKey,
  phase,
  show, // boolean prop to control visibility
}) => {
  const { t } = useTranslation();
  const [pressedButton, setPressedButton] = useState(null);
  const [buttonOrder] = useState(() => {
    const buttons = ["success", "fail"];
    return buttons.sort(() => Math.random() - 0.5);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundImage:
              "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SparkParticles />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/80"></div>
          {/* Purple tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-950/30 to-black/60"></div>

          {/* Ambient fog effect at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(60, 20, 80, 0.4) 0%, transparent 100%)",
            }}
          ></div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Title */}
            <h2
              className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-500"
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("modals.chooseYourDestiny")}
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {buttonOrder.map((voteType) => {
                const isSuccess = voteType === "success";
                return (
                  <button
                    key={voteType}
                    onClick={() => {
                      setShowQuestVoting(false);
                      socket.emit("result_votes", {
                        roomSessionKey,
                        playerSessionKey,
                        vote: voteType,
                        phase,
                      });
                    }}
                    onMouseDown={() => setPressedButton(voteType)}
                    onMouseUp={() => setPressedButton(null)}
                    onMouseLeave={() => setPressedButton(null)}
                    onTouchStart={() => setPressedButton(voteType)}
                    onTouchEnd={() => setPressedButton(null)}
                    className={`w-56 h-28 text-3xl font-bold rounded-xl shadow-[0_0_30px_rgba(150,50,150,0.4)] hover:scale-105 hover:shadow-[0_0_50px_rgba(150,50,150,0.6)] transition-all border-2 ${
                      pressedButton === voteType ? "scale-95 brightness-75" : ""
                    } ${
                      isSuccess
                        ? "bg-gradient-to-r from-amber-900 via-yellow-700 to-amber-900 border-amber-500/50 hover:border-amber-400"
                        : "bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-red-800/50 hover:border-red-700"
                    }`}
                    style={{ fontFamily: "MedievalSharp" }}
                  >
                    <span
                      className={isSuccess ? "text-amber-300" : "text-red-300"}
                    >
                      {isSuccess ? t("modals.success") : t("modals.fail")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Decorative text */}
            <p
              className="text-purple-300/70 text-center text-sm mt-4"
              style={{ fontFamily: "MedievalSharp" }}
            >
              {t("modals.questVoteHint")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestVote;
