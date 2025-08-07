import React, { useState, useEffect } from "react";
import socket from "../socket";

const VoteResult = ({ result, setShowResultScreen, roomId, phase }) => {
  const [currentColor, setCurrentColor] = useState("red");
  const [showText, setShowText] = useState(false);
  const lastResult = Array.isArray(result) ? result[result.length - 1] : result;

  useEffect(() => {
    // Start with red, then animate to blue, then to final result
    const timer1 = setTimeout(() => setCurrentColor("blue"), 1000);
    const timer2 = setTimeout(() => setCurrentColor("red"), 2000);
    const timer3 = setTimeout(() => setCurrentColor("blue"), 3000);
    const timer4 = setTimeout(() => {
      setCurrentColor(lastResult === "success" ? "blue" : "red");
      setShowText(true);
    }, 4000);
    const timer5 = setTimeout(() => {
      setShowResultScreen(false);
    }, 6000);

    setTimeout(() => socket.emit("next_phase", { roomId }));

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [lastResult, result, roomId, setShowResultScreen]);

  const bgColor = currentColor === "blue" ? "bg-blue-600" : "bg-red-600";

  return (
    <div
      className={`fixed inset-0 ${bgColor} transition-colors duration-1000 flex items-center justify-center z-50`}
    >
      {showText && (
        <div className="text-white text-6xl font-bold">
          {lastResult === "success" ? "SUCCESS" : "FAILED"}
        </div>
      )}
    </div>
  );
};

export default VoteResult;
