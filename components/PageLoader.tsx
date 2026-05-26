"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTheme } from "next-themes";

interface PageLoaderProps {
  isLoading: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Wait for hydration before reading theme — prevents dark flash on first load
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Keep visible for a tiny extra beat so the fade looks intentional
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  // Before hydration (mounted=false) OR when theme is light → use light styles
  // After hydration, if user has set dark → use dark styles
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: isDark ? "#050a0a" : "#ffffff" }}
        >
          {/* Background subtle gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-brand-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center mb-2"
          >
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl md:text-4xl font-black tracking-tighter"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                Green
              </span>
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-brand-600">
                Adventure
              </span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-0.5 w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent mt-1 origin-center"
            />
          </motion.div>

          {/* Lottie walking animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-52 h-52 md:w-64 md:h-64"
          >
            <DotLottieReact
              src="https://lottie.host/43c8b1b1-d62e-442e-afcf-c4165afd1623/ciDXiQS6f9.lottie"
              loop
              autoplay
            />
          </motion.div>

          {/* Loading text + animated dots */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative z-10 flex flex-col items-center gap-4 -mt-4"
          >
            <p
              className="text-sm font-bold md:font-medium tracking-[0.2em] uppercase"
              style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
            >
              Preparing your adventure
              <LoadingDots />
            </p>

            {/* Progress bar */}
            <div
              className="w-48 md:w-64 h-0.5 rounded-full overflow-hidden"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
