import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import { AnimatePresence, motion } from "framer-motion";
import socket from "../../socket";

const PhaseResult = ({
  votes,
  setShowResultScreen,
  roomSessionKey,
  playerSessionKey,
  show, // boolean to control visibility
}) => {
  const [flippedCards, setFlippedCards] = useState([]);
  const [currentFlipping, setCurrentFlipping] = useState(-1);

  useEffect(() => {
    if (!votes || !show) return;

    const cards = [];

    for (let i = 0; i < votes.success; i++)
      cards.push({ id: i, type: "success" });
    for (let i = 0; i < votes.fail; i++)
      cards.push({ id: votes.success + i, type: "fail" });

    const shuffled = cards;

    // Start all cards blinking immediately
    setCurrentFlipping(-2); // Special value to make all cards blink

    shuffled.forEach((card, index) => {
      setTimeout(
        () => {
          setFlippedCards((prev) => [...prev, card.id]);
          if (index === shuffled.length - 1) {
            setCurrentFlipping(-1);
            // Emit next_phase after all cards are shown
            setTimeout(() => {
              socket.emit("next_phase", { roomSessionKey, playerSessionKey });
              setShowResultScreen(false);
            }, 3000);
          }
        },
        index === shuffled.length - 1
          ? index * 1500 + 5000 + 4000
          : index * 1500 + 4000 // 4 seconds of blinking
      );
    });

    setFlippedCards([]);

    return () => {
      // Cleanup handled by individual timeouts
    };
  }, [votes, show, playerSessionKey, roomSessionKey, setShowResultScreen]);

  if (!votes) return null;

  const cards = [];
  for (let i = 0; i < votes.success; i++)
    cards.push({ id: i, type: "success" });
  for (let i = 0; i < votes.fail; i++)
    cards.push({ id: votes.success + i, type: "fail" });
  const shuffled = cards;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-4">
            {shuffled.map((card) => (
              <ReactCardFlip
                key={card.id}
                isFlipped={flippedCards.includes(card.id)}
                flipDirection="horizontal"
              >
                <div
                  className={`w-48 h-72 bg-purple-700 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                    currentFlipping === -2 ||
                    currentFlipping ===
                      shuffled.findIndex((c) => c.id === card.id)
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  ?
                </div>
                <div
                  className={`w-48 h-72 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                    card.type === "success" ? "bg-amber-600" : "bg-red-600"
                  }`}
                >
                  {card.type === "success" ? "✓" : "✗"}
                </div>
              </ReactCardFlip>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhaseResult;
