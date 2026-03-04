import React, { useEffect, useRef } from "react";

const FloatingEmbers = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
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
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.3;
        this.fadeSpeed = Math.random() * 0.001 + 0.0005;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.01 + 0.005;

        // Ember colors - purple to violet to magenta (mystical)
        const colors = [
          "rgba(180, 100, 255, ", // Light purple
          "rgba(150, 50, 200, ", // Purple
          "rgba(120, 50, 180, ", // Violet
          "rgba(200, 150, 255, ", // Light violet
          "rgba(160, 100, 220, ", // Medium purple
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;

        // Fade out as it approaches the top
        if (this.y < canvas.height * 0.3) {
          this.opacity = Math.max(
            0,
            (this.y / (canvas.height * 0.3)) * (Math.random() * 0.4 + 0.3),
          );
        }

        this.size *= 0.999;

        if (this.opacity <= 0 || this.y < -50 || this.size < 0.5) {
          this.reset();
        }
      }

      draw() {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 4,
        );
        glowGradient.addColorStop(0, this.colorBase + this.opacity * 0.8 + ")");
        glowGradient.addColorStop(
          0.3,
          this.colorBase + this.opacity * 0.4 + ")",
        );
        glowGradient.addColorStop(1, this.colorBase + "0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Inner bright core
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

    // Create initial embers
    for (let i = 0; i < 25; i++) {
      const ember = new Ember();
      ember.y = canvas.height + Math.random() * canvas.height * 0.5;
      ember.opacity = Math.random() * 0.5 + 0.2;
      embers.push(ember);
    }

    const animate = () => {
      // Clear with slight fade for trails
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

export default FloatingEmbers;
