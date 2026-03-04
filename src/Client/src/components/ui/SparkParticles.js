import React, { useEffect, useRef } from "react";

const SparkParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;

        // Fire colors - orange, gold, red, yellow
        const colors = [
          "rgba(255, 150, 50, ", // Orange
          "rgba(255, 200, 100, ", // Gold
          "rgba(255, 80, 30, ", // Red
          "rgba(255, 220, 150, ", // Yellow
          "rgba(200, 100, 50, ", // Dark orange
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
        this.life -= this.decay;
        this.size *= 0.98;

        if (this.life <= 0 || this.y < canvas.height * 0.4 || this.size < 0.1) {
          this.reset();
        }
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 2,
        );
        gradient.addColorStop(0, this.colorBase + this.life + ")");
        gradient.addColorStop(0.4, this.colorBase + this.life * 0.6 + ")");
        gradient.addColorStop(1, this.colorBase + "0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create initial particles
    for (let i = 0; i < 80; i++) {
      const particle = new Particle();
      particle.y = Math.random() * canvas.height;
      particles.push(particle);
    }

    const animate = () => {
      // Semi-transparent clear for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

export default SparkParticles;
