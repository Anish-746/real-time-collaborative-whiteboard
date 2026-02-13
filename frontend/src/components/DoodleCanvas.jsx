import { useEffect, useRef } from "react";

export default function DoodleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      
      draw();
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Clear and set background
      ctx.fillStyle = "#fdfcf7";
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const centerX = w / 2;
      const centerY = h / 2;

      // Helper for hand-drawn effect
      const jitter = () => (Math.random() - 0.5) * 2;

      const drawLine = (x1, y1, x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x1 + jitter(), y1 + jitter());
        ctx.lineTo(x2 + jitter(), y2 + jitter());
        ctx.stroke();
      };

      const drawCircle = (x, y, radius) => {
        ctx.beginPath();
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const px = x + Math.cos(angle) * radius + jitter();
          const py = y + Math.sin(angle) * radius + jitter();
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      };

      const drawSquiggle = (x, y, length, amplitude, frequency) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 0; i <= length; i += 5) {
          const wave = Math.sin(i * frequency) * amplitude;
          ctx.lineTo(x + i + jitter(), y + wave + jitter());
        }
        ctx.stroke();
      };

      const drawStar = (x, y, size) => {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? size : size / 2;
          const px = x + Math.cos(angle - Math.PI / 2) * radius + jitter();
          const py = y + Math.sin(angle - Math.PI / 2) * radius + jitter();
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      };

      const drawArrow = (x, y, angle, length) => {
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        drawLine(x, y, endX, endY);
        
        const arrowSize = 12;
        drawLine(
          endX,
          endY,
          endX - Math.cos(angle - 0.5) * arrowSize,
          endY - Math.sin(angle - 0.5) * arrowSize
        );
        drawLine(
          endX,
          endY,
          endX - Math.cos(angle + 0.5) * arrowSize,
          endY - Math.sin(angle + 0.5) * arrowSize
        );
      };

      const drawSpiral = (x, y, size) => {
        ctx.beginPath();
        let angle = 0;
        let radius = 0;
        ctx.moveTo(x, y);
        while (radius < size) {
          radius += 0.5;
          angle += 0.3;
          const px = x + Math.cos(angle) * radius + jitter();
          const py = y + Math.sin(angle) * radius + jitter();
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      };

      // TOP LEFT CORNER
      drawCircle(120, 100, 40);
      drawCircle(120, 100, 25);
      drawStar(60, 180, 20);
      drawSquiggle(40, 250, 100, 15, 0.1);
      drawSpiral(100, 320, 30);
      
      ctx.fillStyle = "#111";
      ctx.font = "bold 28px 'Comic Sans MS', cursive";

      // TOP RIGHT CORNER
      drawStar(w - 120, 80, 25);
      drawCircle(w - 80, 150, 35);
      drawSquiggle(w - 180, 50, 120, 12, 0.08);
      drawArrow(w - 150, 250, Math.PI / 4, 60);
      
      // Lightbulb
      drawCircle(w - 70, 320, 25);
      drawLine(w - 70, 345, w - 70, 375);
      drawLine(w - 85, 375, w - 55, 375);
      
      ctx.font = "bold 26px 'Comic Sans MS', cursive";

      // BOTTOM LEFT CORNER
      drawSpiral(100, h - 200, 35);
      drawStar(150, h - 250, 18);
      drawCircle(70, h - 100, 30);
      drawSquiggle(120, h - 80, 90, 10, 0.12);
      
      // Heart
      ctx.beginPath();
      const hx = 50;
      const hy = h - 300;
      ctx.moveTo(hx, hy + 8);
      ctx.bezierCurveTo(hx, hy + 3, hx - 10, hy - 5, hx - 15, hy);
      ctx.bezierCurveTo(hx - 20, hy - 5, hx - 20, hy + 8, hx - 20, hy + 8);
      ctx.bezierCurveTo(hx - 20, hy + 18, hx, hy + 28, hx, hy + 35);
      ctx.bezierCurveTo(hx, hy + 28, hx + 20, hy + 18, hx + 20, hy + 8);
      ctx.bezierCurveTo(hx + 20, hy + 8, hx + 20, hy - 5, hx + 15, hy);
      ctx.bezierCurveTo(hx + 10, hy - 5, hx, hy + 3, hx, hy + 8);
      ctx.stroke();
      
      ctx.font = "bold 24px 'Comic Sans MS', cursive";

      // BOTTOM RIGHT CORNER
      drawCircle(w - 100, h - 180, 45);
      drawCircle(w - 100, h - 180, 30);
      drawStar(w - 50, h - 80, 22);
      drawSquiggle(w - 220, h - 60, 110, 14, 0.09);
      drawSpiral(w - 150, h - 260, 28);
      
      // Coffee cup
      const cupX = w - 80;
      const cupY = h - 320;
      ctx.beginPath();
      ctx.moveTo(cupX - 20, cupY);
      ctx.lineTo(cupX - 18, cupY + 30);
      ctx.lineTo(cupX + 18, cupY + 30);
      ctx.lineTo(cupX + 20, cupY);
      ctx.lineTo(cupX - 20, cupY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cupX + 25, cupY + 15, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      drawSquiggle(cupX - 8, cupY - 15, 20, 3, 0.3);
      drawSquiggle(cupX + 8, cupY - 18, 20, 3, 0.3);
      
      ctx.font = "bold 25px 'Comic Sans MS', cursive";

      // CENTER DECORATIONS (around the login box)
      if (w > 600) {
        drawArrow(centerX - 250, centerY - 120, -Math.PI / 6, 50);
        drawStar(centerX + 240, centerY - 130, 20);
        drawCircle(centerX - 270, centerY - 30, 25);
        drawCircle(centerX + 280, centerY + 40, 30);
        drawSquiggle(centerX - 290, centerY + 80, 80, 12, 0.1);
        drawSquiggle(centerX + 250, centerY - 60, 70, 10, 0.11);
        drawSpiral(centerX - 230, centerY + 170, 25);
        drawStar(centerX + 250, centerY + 160, 18);
      }

      // Scattered small stars (with fixed seed for consistency)
      const stars = [
        [0.25, 0.4], [0.75, 0.35], [0.3, 0.7], [0.7, 0.65],
        [0.15, 0.55], [0.85, 0.5], [0.4, 0.2], [0.6, 0.8]
      ];
      
      stars.forEach(([xPct, yPct]) => {
        const sx = w * xPct;
        const sy = h * yPct;
        if (Math.abs(sx - centerX) > 220 || Math.abs(sy - centerY) > 220) {
          drawStar(sx, sy, 10);
        }
      });

      // Small dots for texture
      const dots = [
        [0.2, 0.25], [0.8, 0.22], [0.18, 0.75], [0.82, 0.72],
        [0.12, 0.5], [0.88, 0.48], [0.35, 0.15], [0.65, 0.85],
        [0.22, 0.82], [0.78, 0.18], [0.1, 0.35], [0.9, 0.6]
      ];
      
      ctx.fillStyle = "#111";
      dots.forEach(([xPct, yPct]) => {
        const dx = w * xPct;
        const dy = h * yPct;
        if (Math.abs(dx - centerX) > 220 || Math.abs(dy - centerY) > 220) {
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}