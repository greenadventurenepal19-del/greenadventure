"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export default function LiquidSlider({ 
  slides, 
  currentIndex,
  nextIndex,
  isHovered,
  isMouseDown
}: { 
  slides: string[], 
  currentIndex: number,
  nextIndex: number,
  isHovered: boolean,
  isMouseDown?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates globally to keep track even if they exit and re-enter quickly
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoothly follow the mouse with springs
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20, mass: 0.5 });
  
  // We manage our own displayed slides so we can animate out of them when the parent changes currentIndex
  const [displayBaseIdx, setDisplayBaseIdx] = useState(currentIndex);
  const [displayRevealIdx, setDisplayRevealIdx] = useState(nextIndex);
  const [isResetting, setIsResetting] = useState(false);
  
  // Circle radius
  const size = useMotionValue(0);
  const smoothSize = useSpring(size, { stiffness: 60, damping: 15, mass: 0.5 });
  const sizeScale = useTransform(smoothSize, s => Math.max(0, s / 100));
  
  // Trail droplets for liquid splash effect
  const trail1X = useSpring(mouseX, { stiffness: 80, damping: 25, mass: 0.6 });
  const trail1Y = useSpring(mouseY, { stiffness: 80, damping: 25, mass: 0.6 });
  const trail1Size = useTransform(smoothSize, v => v * 0.7);

  const trail2X = useSpring(mouseX, { stiffness: 60, damping: 30, mass: 0.7 });
  const trail2Y = useSpring(mouseY, { stiffness: 60, damping: 30, mass: 0.7 });
  const trail2Size = useTransform(smoothSize, v => v * 0.5);

  const trail3X = useSpring(mouseX, { stiffness: 40, damping: 35, mass: 0.8 });
  const trail3Y = useSpring(mouseY, { stiffness: 40, damping: 35, mass: 0.8 });
  const trail3Size = useTransform(smoothSize, v => v * 0.3);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    // If the parent slide changed (a click happened)
    if (currentIndex !== displayBaseIdx) {
      // 1. Expand the circle to cover the screen (increased to 1.8 to overcome gooey shrink)
      const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.8;
      size.set(maxRadius);
      
      // 2. Wait for it to cover the screen, then swap background images and reset circle
      const timeout = setTimeout(() => {
        setIsResetting(true);
        
        // Now the base image is the one we just revealed
        setDisplayBaseIdx(currentIndex);
        // And the reveal image is the next one
        setDisplayRevealIdx((currentIndex + 1) % slides.length);
        
        // Reset the circle
        size.set(isHovered ? 180 : 0);
        if (typeof smoothSize.jump === "function") {
          smoothSize.jump(isHovered ? 180 : 0);
        }
        
        // Re-enable the reveal layer after a short delay
        setTimeout(() => setIsResetting(false), 50);
      }, 700); // 700ms gives the spring time to expand fully
      
      return () => clearTimeout(timeout);
    } else {
      // Normal hover behaviour
      if (!isResetting) {
        if (isHovered) {
          size.set(isMouseDown ? 800 : 180);
        } else {
          size.set(0);
        }
      }
    }
  }, [currentIndex, isHovered, isMouseDown, displayBaseIdx, slides.length, size, smoothSize, isResetting]);

  return (
    <div ref={ref} className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      
      {/* SVG Definitions for Gooey Water Splash Mask */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquid-splash" x="-20%" y="-20%" width="140%" height="140%">
            {/* Generate random amoeba-like noise */}
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            {/* Displace the circles using the noise */}
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            {/* Gooey blur to merge droplets and smooth out the distortion */}
            <feGaussianBlur in="displaced" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
          </filter>

          <mask id="splash-mask">
            <rect width="100vw" height="100vh" fill="black" />
            <g filter="url(#liquid-splash)">
              {/* Splat cluster following mouse */}
              <motion.g style={{ x: smoothX, y: smoothY, scale: sizeScale }}>
                {/* Central mass */}
                <circle cx="0" cy="0" r="45" fill="white" />
                {/* Arms */}
                <circle cx="-40" cy="-30" r="25" fill="white" />
                <circle cx="35" cy="-40" r="20" fill="white" />
                <circle cx="45" cy="20" r="25" fill="white" />
                <circle cx="-30" cy="40" r="22" fill="white" />
                {/* Splashes */}
                <circle cx="-70" cy="-50" r="12" fill="white" />
                <circle cx="60" cy="-60" r="10" fill="white" />
                <circle cx="70" cy="30" r="14" fill="white" />
                <circle cx="-50" cy="65" r="10" fill="white" />
                <circle cx="10" cy="65" r="12" fill="white" />
                {/* Detached drops */}
                <circle cx="-90" cy="-20" r="6" fill="white" />
                <circle cx="85" cy="-10" r="5" fill="white" />
                <circle cx="-10" cy="-80" r="7" fill="white" />
              </motion.g>

              {/* Trailing detached drops for motion effect */}
              <motion.circle cx={trail1X} cy={trail1Y} r={trail1Size} fill="white" />
              <motion.circle cx={trail2X} cy={trail2Y} r={trail2Size} fill="white" />
              <motion.circle cx={trail3X} cy={trail3Y} r={trail3Size} fill="white" />
            </g>
          </mask>
        </defs>
      </svg>

      {/* Layer 1: Base Image (Full width/height) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={slides[displayBaseIdx]}
          alt="Base slider image"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Layer 2: Reveal Image (Masked by dynamic liquid) */}
      {!isResetting && (
        <motion.div 
          className="absolute inset-0 w-full h-full z-10"
          style={{ 
            mask: "url(#splash-mask)", 
            WebkitMask: "url(#splash-mask)",
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6)) drop-shadow(0 8px 16px rgba(0,0,0,0.4)) drop-shadow(0 0 2px rgba(0,0,0,0.8))"
          }}
        >
          <Image
            src={slides[displayRevealIdx]}
            alt="Reveal slider image"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}
    </div>
  );
}
