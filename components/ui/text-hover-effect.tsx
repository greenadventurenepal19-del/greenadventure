"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
 
export const TextHoverEffect = ({
  text,
  duration,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
 
  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null && hovered) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor, hovered]);
 
  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1350 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none"
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="75%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
 
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={
            hovered
              ? maskPosition
              : { cx: ["0%", "100%", "0%"], cy: "50%" }
          }
          transition={
            hovered
              ? { duration: duration ?? 0, ease: "easeOut" }
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="0%"
        y="50%"
        textAnchor="start"
        dominantBaseline="middle"
        stroke="var(--f-stroke, currentColor)"
        strokeWidth="1.5"
        fontSize="150"
        className="fill-transparent text-black/20 dark:text-white/30 font-[helvetica] font-bold transition-opacity duration-500"
        style={{ opacity: hovered ? 0 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="0%"
        y="50%"
        textAnchor="start"
        dominantBaseline="middle"
        stroke="var(--f-stroke, currentColor)"
        strokeWidth="1.5"
        fontSize="150"
        className="fill-transparent text-black/20 dark:text-white/30 font-[helvetica] font-bold transition-opacity duration-500"
        style={{ opacity: hovered ? 0.95 : 0.75 }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        whileInView={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="0%"
        y="50%"
        textAnchor="start"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="1"
        fontSize="150"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] font-bold transition-opacity duration-500"
      >
        {text}
      </text>
    </svg>
  );
};
