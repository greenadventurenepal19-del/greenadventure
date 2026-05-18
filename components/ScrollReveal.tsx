"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ScrollReveal({ 
  children, 
  className = "",
  delay = 0,
  yOffset = 40
}: { 
  children: React.ReactNode, 
  className?: string,
  delay?: number,
  yOffset?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
