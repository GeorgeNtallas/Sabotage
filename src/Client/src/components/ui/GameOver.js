import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../socket";

const GameOver = ({ winner, roomSessionKey }) => {
  const [showScroll, setShowScroll] = useState(false);
  const [gameOverText, setGameOverText] = useState("");
  const [winnerText, setWinnerText] = useState("");

  const fullGameOver = "Game Over";
  const fullWinner = winner === "good" ? "Good Wins" : "Evil Wins";

  // small typing helper
  const typeText = (text, setText, speed = 150, onFinish) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        if (onFinish) onFinish();
      }
    }, speed);
    return interval;
  };

  useEffect(() => {
    const scrollTimer = setTimeout(() => setShowScroll(true), 300);

    // type "Game Over" first, then winner
    const typeTimer = setTimeout(() => {
      typeText(fullGameOver, setGameOverText, 200, () => {
        typeText(fullWinner, setWinnerText, 150);
      });
    }, 900);

    const timer = setTimeout(() => {
      socket.emit("exit_game", { roomSessionKey });
    }, 10000);

    setGameOverText(""); // Reset text before typing
    setWinnerText("");

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(typeTimer);
      clearTimeout(timer);
    };
  }, [fullWinner, roomSessionKey, winner]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      style={{
        backgroundImage: "url(/images/peakpx.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="relative flex items-center justify-center w-full max-w-4xl px-6">
        {/* Scroll image */}
        <AnimatePresence>
          {showScroll && (
            <motion.img
              src="/images/2302.w058.n003.249B.p1.249-removebg-preview.png"
              alt="Scroll"
              className="w-full max-w-3xl"
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Text written onto scroll */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-bold text-black drop-shadow-lg">
            {gameOverText}
          </div>
          <div
            className={`text-5xl font-bold mt-6 drop-shadow-lg ${
              winner === "good" ? "text-black" : "text-black"
            }`}
          >
            {winnerText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
