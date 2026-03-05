import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

const GameOver = ({ winner, roomSessionKey }) => {
  const [showContent, setShowContent] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isGoodWinner = winner === "good";
  const winnerText = isGoodWinner
    ? t("gameOver.goodWins")
    : t("gameOver.evilWins");

  // Team colors and styling
  const teamColors = {
    good: {
      primary: "from-amber-500 via-yellow-400 to-amber-600",
      glow: "shadow-[0_0_60px_rgba(245,158,11,0.6)]",
      text: "text-amber-400",
      border: "border-amber-500/50",
      icon: "🏆",
    },
    evil: {
      primary: "from-red-900 via-red-700 to-red-900",
      glow: "shadow-[0_0_60px_rgba(220,38,38,0.6)]",
      text: "text-red-500",
      border: "border-red-500/50",
      icon: "💀",
    },
  };

  const colors = teamColors[winner] || teamColors.evil;

  useEffect(() => {
    // Staggered reveal timeline
    const contentTimer = setTimeout(() => setShowContent(true), 500);
    const winnerTimer = setTimeout(() => setShowWinner(true), 1500);
    const buttonTimer = setTimeout(() => setShowButton(true), 2500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(winnerTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleExit = () => {
    socket.emit("exit_game", { roomSessionKey });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
      style={{
        backgroundImage: "url(/images/wp7007763-dark-castle-wallpapers.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlays for atmosphere */}
      <div className="absolute inset-0 bg-black/80 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-950/20 to-black/80 z-0" />

      {/* Floating embers background */}
      <div className="absolute inset-0 z-[1]">
        <FloatingEmbers winner={winner} />
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl">
        {/* Game Over Title */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
              }}
            >
              <h1
                className={`
                  text-5xl md:text-7xl font-black tracking-wider
                  bg-gradient-to-b ${colors.primary}
                  bg-clip-text text-transparent
                  drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]
                  uppercase
                  ${colors.glow}
                `}
                style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
              >
                {t("gameOver.gameOver")}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative divider */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
              className="w-64 h-1 my-8 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Winner Announcement */}
        <AnimatePresence>
          {showWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                stiffness: 100,
                damping: 15,
              }}
              className={`
                relative flex flex-col items-center
                ${colors.glow}
              `}
            >
              {/* Winner icon with glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  filter: [
                    "drop-shadow(0 0 20px rgba(245,158,11,0.5))",
                    "drop-shadow(0 0 40px rgba(245,158,11,0.8))",
                    "drop-shadow(0 0 20px rgba(245,158,11,0.5))",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-8xl md:text-9xl mb-4"
              >
                {colors.icon}
              </motion.div>

              {/* Winner text */}
              <div
                className={`
                text-4xl md:text-6xl font-black
                bg-gradient-to-r ${colors.primary}
                bg-clip-text text-transparent
                uppercase tracking-widest
                drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]
              `}
              >
                {winnerText}
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-purple-300/80 text-lg md:text-xl font-medium"
              >
                {isGoodWinner
                  ? "The forces of light have prevailed"
                  : "Darkness has consumed all"}
              </motion.p>

              {/* Decorative border */}
              <div
                className={`
                absolute -inset-8 rounded-2xl 
                border-2 ${colors.border}
                opacity-30
                animate-pulse
              `}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <motion.button
                onClick={handleExit}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="
                  px-10 py-4 
                  bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800
                  text-white text-xl font-bold
                  rounded-full
                  border border-purple-500/30
                  shadow-[0_0_20px_rgba(139,92,246,0.3)]
                  hover:border-purple-400/50
                  transition-all duration-300
                  uppercase tracking-wider
                "
              >
                {t("gameOver.exitToHome")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-purple-500/30 rounded-tl-3xl" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-4 border-t-4 border-purple-500/30 rounded-tr-3xl" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-4 border-b-4 border-purple-500/30 rounded-bl-3xl" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-purple-500/30 rounded-br-3xl" />
    </div>
  );
};

// Inline floating embers component for this screen
const FloatingEmbers = ({ winner }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let embers = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Ember {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 6 + 2;
        this.speedY = Math.random() * 1.2 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.002 + 0.001;

        // Winner-themed colors (gold for good, red for evil)
        const isGood = winner === "good";
        const colors = isGood
          ? [
              "rgba(251, 191, 36, ", // Amber
              "rgba(245, 158, 11, ", // Yellow
              "rgba(217, 119, 6, ", // Orange
            ]
          : [
              "rgba(239, 68, 68, ", // Red
              "rgba(220, 38, 38, ", // Dark red
              "rgba(185, 28, 28, ", // Deep red
            ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3;
        this.opacity -= this.fadeSpeed;

        if (this.opacity <= 0 || this.y < -20 || this.size < 0.5) {
          this.reset();
        }
      }

      draw() {
        // Glow effect
        const glowGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 3,
        );
        glowGradient.addColorStop(0, this.colorBase + this.opacity * 0.8 + ")");
        glowGradient.addColorStop(
          0.4,
          this.colorBase + this.opacity * 0.3 + ")",
        );
        glowGradient.addColorStop(1, this.colorBase + "0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Core
        const coreGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size,
        );
        coreGradient.addColorStop(
          0,
          "rgba(255, 255, 255, " + this.opacity + ")",
        );
        coreGradient.addColorStop(0.3, this.colorBase + this.opacity + ")");
        coreGradient.addColorStop(1, this.colorBase + "0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
      }
    }

    // Create embers
    for (let i = 0; i < 30; i++) {
      const ember = new Ember();
      ember.y = Math.random() * canvas.height;
      embers.push(ember);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      embers.forEach((ember) => {
        ember.update();
        ember.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [winner]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default GameOver;
