import React, { useState, useEffect } from "react";
import socket from "../../socket";

const GameOver = ({ winner, roomSessionKey }) => {
  const [showGameOver, setShowGameOver] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    // Fade in "Game Over"
    setTimeout(() => setShowGameOver(true), 100);

    // Fade out "Game Over" after 5 seconds
    const timer1 = setTimeout(() => {
      setShowGameOver(true);
    }, 2000);

    // Fade in winner after 7 seconds
    const timer2 = setTimeout(() => {
      setShowWinner(true);
    }, 5000);

    setTimeout(() => {
      socket.emit("exit_game", { roomSessionKey });
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 space-y-12 px-6">
      {/* Game Over Text */}
      <div
        className={`text-white text-6xl font-bold transform transition-all duration-1000 ease-in ${
          showGameOver
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-20"
        }`}
      >
        Game Over
      </div>

      {/* Winner Text */}
      <div
        className={`text-white text-6xl font-bold transform transition-all duration-1000 ease-in delay-500 ${
          showWinner ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
        }`}
      >
        <div
          className={`${winner === "good" ? "text-blue-400" : "text-red-400"}`}
        >
          {winner === "good" ? "Good" : "Evil"} Wins!
        </div>
      </div>
    </div>
  );
};

export default GameOver;
