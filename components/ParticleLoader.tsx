"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface LoaderParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const ParticleLoader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animFrame = 0;
    let particles: LoaderParticle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      buildParticles();
    };

    const buildParticles = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.scale(dpr, dpr);

      const fontSize = Math.min(w * 0.065, 52);

      tempCtx.fillStyle = "#ffffff";
      tempCtx.font = `900 ${fontSize}px "Nunito", "Quicksand", "Varela Round", sans-serif`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText("GreenAdventure", w / 2, h / 2);

      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      particles = [];
      const gap = w > 600 ? 3 : 4;

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const i = (y * canvas.width + x) * 4;
          if (pixels[i + 3] > 128) {
            const px = x / dpr;
            const py = y / dpr;

            particles.push({
              x: px,
              y: py,
              originX: px,
              originY: py,
              vx: 0,
              vy: 0,
              size: Math.random() * 1.0 + 0.5,
              opacity: Math.random() * 0.4 + 0.6,
            });
          }
        }
      }
    };

    // Wait for fonts to load before sampling text
    document.fonts.ready.then(() => {
      resize();
    });

    // Mouse interaction
    let mx = -9999,
      my = -9999;
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const handleLeave = () => {
      mx = -9999;
      my = -9999;
    };
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    let pulsePhase = 0;

    const animate = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      pulsePhase += 0.02;

      // Gentle pulse glow behind text
      const pulseAlpha = 0.03 + Math.sin(pulsePhase) * 0.015;
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.35);
      grad.addColorStop(0, `rgba(34, 197, 94, ${pulseAlpha * 2})`);
      grad.addColorStop(1, `rgba(34, 197, 94, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        // Mouse distortion (gentle)
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = ((80 - dist) / 80) * ((80 - dist) / 80);
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 6;
          p.vy += Math.sin(angle) * force * 6;
        }

        // Spring to origin
        p.vx += (p.originX - p.x) * 0.045;
        p.vy += (p.originY - p.y) * 0.045;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const distToOrigin = Math.sqrt((p.x - p.originX) ** 2 + (p.y - p.originY) ** 2);
        const arrivalProgress = Math.max(0, 1 - distToOrigin / 200);

        const greenTint = arrivalProgress * 0.3;
        
        let r, g, b;
        if (resolvedTheme === 'dark' || !resolvedTheme) {
            r = Math.round(255 - greenTint * 120);
            g = Math.round(255 - greenTint * 20);
            b = Math.round(255 - greenTint * 100);
        } else {
            // green color for light mode: roughly brand-600 (22, 163, 74)
            r = Math.round(22 + greenTint * 50);
            g = Math.round(163 - greenTint * 20);
            b = Math.round(74 + greenTint * 50);
        }

        const breathe = Math.sin(pulsePhase * 1.5 + p.originX * 0.01) * 0.1;
        const a = p.opacity * (arrivalProgress * 0.6 + 0.4 + breathe);

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [resolvedTheme]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 pointer-events-auto"
        style={{ touchAction: "none" }}
      />
      {/* Subtle loading indicator below */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <p className="text-black/40 dark:text-white/20 text-xs tracking-[0.3em] uppercase font-bold">Loading</p>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default ParticleLoader;

