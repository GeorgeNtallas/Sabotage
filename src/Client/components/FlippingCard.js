import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import socket from "../../socket";

const FlippingCard = ({ votes, setShowResultScreen, roomId }) => {
  const [flippedCards, setFlippedCards] = useState([]);
  const [currentFlipping, setCurrentFlipping] = useState(0);

  useEffect(() => {
    if (!votes) return;

    const totalVotes = votes.success + votes.fail;
    const cards = [];

    // Create success cards
    for (let i = 0; i < votes.success; i++) {
      cards.push({ id: i, type: "success" });
    }

    // Create fail cards
    for (let i = 0; i < votes.fail; i++) {
      cards.push({ id: votes.success + i, type: "fail" });
    }

    // Success votes first, then shuffle
    const shuffled = cards;

    // Reveal cards one by one from left to right
    shuffled.forEach((card, index) => {
      setTimeout(
        () => {
          setCurrentFlipping(index);
          setTimeout(() => {
            setFlippedCards((prev) => [...prev, card.id]);
            if (index === shuffled.length - 1) {
              setCurrentFlipping(-1); // Stop flipping when last card is revealed
            }
          }, 5000); // Flip for 2 seconds then reveal
        },
        index === shuffled.length - 1 ? index * 7000 : index * 6500
      ); // Last card starts after double time
    });

    setFlippedCards([]);

    setCurrentFlipping(-1);
    const time = (cards.length - 1) * 5000 + 7000 + 1000;
    setTimeout(() => socket.emit("next_phase", { roomId }), time);

    const timer5 = setTimeout(() => {
      setShowResultScreen(false);
    }, time);
  }, [roomId, setShowResultScreen, votes]);

  if (!votes) return null;

  const totalVotes = votes.success + votes.fail;
  const cards = [];

  for (let i = 0; i < votes.success; i++) {
    cards.push({ id: i, type: "success" });
  }
  for (let i = 0; i < votes.fail; i++) {
    cards.push({ id: votes.success + i, type: "fail" });
  }

  const shuffled = cards;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
      <div className="flex gap-4">
        {shuffled.map((card) => (
          <ReactCardFlip
            key={card.id}
            isFlipped={flippedCards.includes(card.id)}
            flipDirection="horizontal"
          >
            <div
              className={`w-48 h-72 bg-purple-950 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                currentFlipping === shuffled.findIndex((c) => c.id === card.id)
                  ? "animate-pulse"
                  : ""
              }`}
            >
              ?
            </div>
            <div
              className={`w-48 h-72 rounded-lg flex items-center justify-center text-white text-6xl font-bold ${
                card.type === "success" ? "bg-blue-600" : "bg-red-600"
              }`}
            >
              {card.type === "success" ? "✓" : "✗"}
            </div>
          </ReactCardFlip>
        ))}
      </div>
    </div>
  );
};

export default FlippingCard;
