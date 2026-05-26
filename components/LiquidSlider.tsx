"use client";

import React, { useRef, useState, useEffect, useRef as useRefAlias } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device — hover liquid effect is disabled on mobile
  useEffect(() => {
    const check = () => setIsTouchDevice(
      window.matchMedia("(hover: none) and (pointer: coarse)").matches
    );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  
  // Track mouse coordinates globally to keep track even if they exit and re-enter quickly
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoothly follow the mouse with springs
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20, mass: 0.5 });

  // Track whether a transition is in progress
  const [isTransitioning, setIsTransitioning] = useState(false);
  // isResetting: hide the reveal layer while we swap images to avoid flicker
  const [isResetting, setIsResetting] = useState(false);
  
  // The frozen images used during transitions – updated atomically to prevent flicker
  // baseImage: what's shown as the full-screen background
  // revealImage: what's shown under the liquid mask (the "next" slide preview)
  const [baseImage, setBaseImage] = useState(slides[currentIndex] || "");
  const [revealImage, setRevealImage] = useState(slides[nextIndex] || "");

  // Keep a ref of the previous currentIndex so we know when a real slide change happened
  const prevCurrentIndex = useRef(currentIndex);
  const prevSlides = useRef(slides);

  // When the slide index changes (click), kick off the liquid transition
  useEffect(() => {
    const prevIdx = prevCurrentIndex.current;
    const didSlideChange = currentIndex !== prevIdx;
    const didSlidesChange = slides !== prevSlides.current;

    if (didSlideChange) {
      // A click happened — start expanding the liquid circle
      prevCurrentIndex.current = currentIndex;
      prevSlides.current = slides;

      // The reveal layer should already show the image for currentIndex (it was the "next" preview)
      // Make sure it has the correct image right now
      setRevealImage(slides[currentIndex] || "");
      setIsTransitioning(true);

      // Expand circle
      const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.8;
      size.set(maxRadius);

      // After circle covers screen, atomically swap base→current, reveal→next
      const timeout = setTimeout(() => {
        setIsResetting(true);
        // Swap: base becomes the newly revealed slide
        setBaseImage(slides[currentIndex] || "");
        // Reveal becomes the next-next slide
        setRevealImage(slides[(currentIndex + 1) % slides.length] || "");

        // Collapse circle immediately (jump, no spring)
        size.set(isHovered ? 180 : 0);
        if (typeof smoothSize.jump === "function") {
          smoothSize.jump(isHovered ? 180 : 0);
        }

        // Brief pause so the image swap doesn't create a visible flicker
        setTimeout(() => {
          setIsResetting(false);
          setIsTransitioning(false);
        }, 50);
      }, 700);

      return () => clearTimeout(timeout);
    } else if (didSlidesChange) {
      // slides array content changed (e.g. activeBgIndex changed) but slide index didn't
      prevSlides.current = slides;
      // Only update the reveal image (which is the hover preview) – don't touch base
      setRevealImage(slides[nextIndex] || "");
      if (!isTransitioning) {
        setBaseImage(slides[currentIndex] || "");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, slides]);

  // Separate effect for hover/mousedown circle changes (not slide changes)
  // On touch devices, hover is fully disabled — only slide transitions animate
  useEffect(() => {
    if (isTransitioning) return; // let the transition effect own size during transitions
    if (!isResetting) {
      if (!isTouchDevice && isHovered) {
        size.set(isMouseDown ? 800 : 180);
      } else if (!isTransitioning) {
        size.set(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, isMouseDown, isResetting, isTransitioning, isTouchDevice]);

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
  
  // Set initial position to center of screen so the bubble doesn't start at top-left
  useEffect(() => {
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }
  }, [mouseX, mouseY]);

  useEffect(() => {
    const updateCoordinates = (clientX: number, clientY: number) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(clientX - rect.left);
        mouseY.set(clientY - rect.top);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCoordinates(e.clientX, e.clientY);
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        updateCoordinates(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, [mouseX, mouseY]);

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
            <rect x="0" y="0" width="100%" height="100%" fill="black" />
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

      {/* Layer 1: Base Image — smoothly cross-fades during auto-cycle, but swaps instantly during slide transition (resetting) */}
      <div className="absolute inset-0 w-full h-full bg-black">
        <AnimatePresence initial={false}>
          <motion.div
            key={baseImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: (isTransitioning || isResetting) ? 0 : 1.5 }
            }}
            transition={{ 
              duration: (isTransitioning || isResetting) ? 0 : 1.5,
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={baseImage}
              alt="Base slider image"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
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
            src={revealImage}
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
