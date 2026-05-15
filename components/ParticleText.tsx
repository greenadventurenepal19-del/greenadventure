"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  targetLife: number;
}

interface ParticleTextProps {
  text: string;
  className?: string;
}

const ParticleText: React.FC<ParticleTextProps> = ({ text, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const currentTextRef = useRef<string>("");
  const prevDimensionsRef = useRef({ w: 0, h: 0 });
  const fontReadyRef = useRef(false);

  const sampleTextParticles = useCallback(
    (canvas: HTMLCanvasElement, textStr: string): { x: number; y: number }[] => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.scale(dpr, dpr);

      // Responsive font size — smaller on mobile
      const baseFontSize = w < 480
        ? Math.min(w * 0.18, 80)   // mobile: max ~80px
        : w < 768
        ? Math.min(w * 0.22, 130)  // tablet: max ~130px
        : Math.min(w * 0.32, 200); // desktop: max 200px
      const fontSize = Math.max(baseFontSize, w < 480 ? 36 : 48);

      tempCtx.fillStyle = "#ffffff";
      tempCtx.font = `900 ${fontSize}px "Nunito", "Quicksand", "Varela Round", sans-serif`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText(textStr.toUpperCase(), w / 2, h / 2);

      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const points: { x: number; y: number }[] = [];
      const gap = w > 900 ? 3 : w > 600 ? 4 : w > 400 ? 4 : 3;

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const i = (y * canvas.width + x) * 4;
          if (pixels[i + 3] > 128) {
            points.push({ x: x / dpr, y: y / dpr });
          }
        }
      }
      return points;
    },
    []
  );

  const morphToText = useCallback(
    (canvas: HTMLCanvasElement, newText: string) => {
      const newPoints = sampleTextParticles(canvas, newText);
      const oldParticles = particlesRef.current;
      const newParticles: Particle[] = [];

      for (let i = 0; i < newPoints.length; i++) {
        const target = newPoints[i];
        if (i < oldParticles.length) {
          const p = oldParticles[i];
          p.originX = target.x;
          p.originY = target.y;
          p.targetLife = 1;
          // No velocity kick — just glide smoothly
          newParticles.push(p);
        } else {
          // New particles appear at their target position directly
          newParticles.push({
            x: target.x,
            y: target.y,
            originX: target.x,
            originY: target.y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.2 + 0.6,
            opacity: Math.random() * 0.4 + 0.6,
            life: 0,
            targetLife: 1,
          });
        }
      }

      // Excess particles just fade out in place
      for (let i = newPoints.length; i < oldParticles.length; i++) {
        const p = oldParticles[i];
        p.targetLife = 0;
        newParticles.push(p);
      }

      particlesRef.current = newParticles;
    },
    [sampleTextParticles]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    const buildInitial = () => {
      initCanvas();
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      prevDimensionsRef.current = { w, h };
      const points = sampleTextParticles(canvas, text);

      particlesRef.current = points.map((pt) => ({
        x: pt.x,
        y: pt.y,
        originX: pt.x,
        originY: pt.y,
        vx: 0,
        vy: 0,
        size: Math.random() * 1.2 + 0.6,
        opacity: Math.random() * 0.4 + 0.6,
        life: 1,
        targetLife: 1,
      }));
      currentTextRef.current = text;
    };

    // Wait for fonts to load before sampling text
    document.fonts.ready.then(() => {
      fontReadyRef.current = true;
      buildInitial();
    });

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
    };
    const handleTouchEnd = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Animation
    const animate = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const { x: mx, y: my } = mouseRef.current;
      const distortRadius = 130;
      const distortStrength = 14;

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01 || p.targetLife > 0);

      for (const p of particlesRef.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < distortRadius && dist > 0) {
          const force = ((distortRadius - dist) / distortRadius);
          const eased = force * force;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * eased * distortStrength;
          p.vy += Math.sin(angle) * eased * distortStrength;
        }

        const springForce = 0.035;
        p.vx += (p.originX - p.x) * springForce;
        p.vy += (p.originY - p.y) * springForce;

        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        p.life += (p.targetLife - p.life) * 0.06;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const glowIntensity = Math.min(speed / 6, 1);

        const r = 255;
        const g = Math.round(255 - glowIntensity * 55);
        const b = Math.round(255 - glowIntensity * 110);
        const a = p.opacity * p.life * (0.75 + glowIntensity * 0.25);

        if (a < 0.01) continue;

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + glowIntensity * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // On resize: recalculate canvas size and re-map all particles to new positions
    const handleResize = () => {
      if (!fontReadyRef.current) return;
      const oldW = prevDimensionsRef.current.w;
      const oldH = prevDimensionsRef.current.h;
      
      initCanvas();
      const newW = canvas.width / dpr;
      const newH = canvas.height / dpr;
      prevDimensionsRef.current = { w: newW, h: newH };

      // Re-sample text at new size
      const newPoints = sampleTextParticles(canvas, currentTextRef.current);
      
      // Scale existing particle positions proportionally to new canvas size
      const scaleX = oldW > 0 ? newW / oldW : 1;
      const scaleY = oldH > 0 ? newH / oldH : 1;
      
      const newParticles: Particle[] = [];
      for (let i = 0; i < newPoints.length; i++) {
        const target = newPoints[i];
        if (i < particlesRef.current.length) {
          const p = particlesRef.current[i];
          // Scale current position proportionally
          p.x = p.x * scaleX;
          p.y = p.y * scaleY;
          p.originX = target.x;
          p.originY = target.y;
          p.targetLife = 1;
          newParticles.push(p);
        } else {
          newParticles.push({
            x: target.x,
            y: target.y,
            originX: target.x,
            originY: target.y,
            vx: 0, vy: 0,
            size: Math.random() * 1.2 + 0.6,
            opacity: Math.random() * 0.4 + 0.6,
            life: 0.5,
            targetLife: 1,
          });
        }
      }
      // Excess particles fade out
      for (let i = newPoints.length; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.x = p.x * scaleX;
        p.y = p.y * scaleY;
        p.targetLife = 0;
        newParticles.push(p);
      }
      particlesRef.current = newParticles;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);


  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-auto ${className || ""}`}
      style={{ touchAction: "none" }}
    />
  );
};

export default ParticleText;
