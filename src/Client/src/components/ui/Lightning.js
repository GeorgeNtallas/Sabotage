import React, { useEffect, useRef, useState } from "react";

const Lightning = () => {
  const canvasRef = useRef(null);
  const [lightningBolts, setLightningBolts] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class LightningBolt {
      constructor() {
        this.reset();
      }

      reset() {
        this.startX = Math.random() * canvas.width;
        this.startY = 0;
        this.endX = this.startX + (Math.random() - 0.5) * 300;
        this.endY = Math.random() * canvas.height * 0.7;
        this.segments = this.generateSegments(
          this.startX,
          this.startY,
          this.endX,
          this.endY,
          8,
        );
        this.opacity = 1;
        this.fadeSpeed = 0.008 + Math.random() * 0.008;
        this.branchProbability = 0.4;
        this.branches = this.generateBranches();
        this.width = Math.random() * 3 + 2;
        // Lightning colors - electric blue to white
        const colors = [
          "rgba(200, 220, 255, ", // Bright white-blue
          "rgba(150, 180, 255, ", // Light blue
          "rgba(100, 150, 255, ", // Blue
          "rgba(255, 255, 255, ", // Pure white
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      generateSegments(startX, startY, endX, endY, depth) {
        if (depth === 0)
          return [
            { x: startX, y: startY },
            { x: endX, y: endY },
          ];

        const midX =
          (startX + endX) / 2 + (Math.random() - 0.5) * (canvas.width * 0.15);
        const midY = (startY + endY) / 2;

        return [
          ...this.generateSegments(startX, startY, midX, midY, depth - 1).slice(
            0,
            -1,
          ),
          ...this.generateSegments(midX, midY, endX, endY, depth - 1),
        ];
      }

      generateBranches() {
        const branches = [];
        if (Math.random() > this.branchProbability) return branches;

        const branchStart =
          Math.floor(Math.random() * (this.segments.length - 2)) + 1;
        const startPoint = this.segments[branchStart];

        const branchEndX = startPoint.x + (Math.random() - 0.5) * 200;
        const branchEndY = startPoint.y + Math.random() * 150 + 50;

        branches.push({
          segments: this.generateSegments(
            startPoint.x,
            startPoint.y,
            branchEndX,
            branchEndY,
            6,
          ),
          width: this.width * 0.6,
        });

        return branches;
      }

      update() {
        this.opacity -= this.fadeSpeed;
        return this.opacity > 0;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Main bolt
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);

        for (let i = 1; i < this.segments.length; i++) {
          ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }

        ctx.strokeStyle = this.colorBase + this.opacity + ")";
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(150, 180, 255, 0.8)";
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = "rgba(255, 255, 255, " + this.opacity + ")";
        ctx.lineWidth = this.width * 0.4;
        ctx.shadowBlur = 30;
        ctx.stroke();

        // Draw branches
        this.branches.forEach((branch) => {
          ctx.beginPath();
          ctx.moveTo(branch.segments[0].x, branch.segments[0].y);

          for (let i = 1; i < branch.segments.length; i++) {
            ctx.lineTo(branch.segments[i].x, branch.segments[i].y);
          }

          ctx.strokeStyle = this.colorBase + this.opacity * 0.9 + ")";
          ctx.lineWidth = branch.width;
          ctx.shadowBlur = 15;
          ctx.stroke();
        });

        ctx.restore();
      }
    }

    let bolts = [];
    let lastBoltTime = 0;
    const minInterval = 8000; // Minimum 8 seconds between bolts
    const maxInterval = 18000; // Maximum 18 seconds between bolts

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Random lightning strike
      if (
        timestamp - lastBoltTime >
        minInterval + Math.random() * (maxInterval - minInterval)
      ) {
        // Create 1-3 bolts for one flash
        const boltCount =
          Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1;
        for (let i = 0; i < boltCount; i++) {
          bolts.push(new LightningBolt());
        }

        // Flash effect - brighten the background
        ctx.fillStyle = "rgba(30, 20, 50, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lastBoltTime = timestamp;
      }

      // Update and draw bolts
      bolts = bolts.filter((bolt) => {
        const alive = bolt.update();
        if (alive) {
          bolt.draw(ctx);
        }
        return alive;
      });

      // If no bolts, draw a subtle ambient flash occasionally
      if (bolts.length === 0 && Math.random() < 0.002) {
        ctx.fillStyle = "rgba(30, 20, 50, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-5"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default Lightning;
