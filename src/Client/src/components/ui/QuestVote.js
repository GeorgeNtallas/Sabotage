import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import socket from "../../socket";

const QuestVote = ({
  setShowQuestVoting,
  roomSessionKey,
  playerSessionKey,
  phase,
  show, // boolean prop to control visibility
}) => {
  const [buttonOrder] = useState(() => {
    const buttons = ["success", "fail"];
    return buttons.sort(() => Math.random() - 0.5);
  });
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          style={{
            backgroundImage:
              "url(/images/3d-grunge-brick-interior-with-spotlight-shining-down.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ opacity: 0 }} // start invisible
          animate={{ opacity: 1 }} // fade in
          exit={{ opacity: 0 }} // fade out
          transition={{ duration: 0.3 }} // adjust speed
        >
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
                  className="w-48 h-20 text-2xl font-extrabold rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition"
                  style={{
                    backgroundImage: isSuccess
                      ? "url(/images/Crown2.jpg), linear-gradient(to right, #a18207, #ca8a04, #a18207)"
                      : "url(/images/NicePng_close-button-png_521965.png), linear-gradient(to right, #7a1d1d, #bf2c2c, #7a1d1d)",
                    backgroundSize: isSuccess ? "50px, auto" : "60px, auto",
                    backgroundPosition: "left",
                    backgroundRepeat: "no-repeat",
                    paddingLeft: isSuccess ? "2.5rem" : "1rem",
                  }}
                >
                  {isSuccess ? "Success" : "Fail"}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestVote;
