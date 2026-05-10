"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { 
  Mountain, ShieldCheck, MapPin, Users, Star, 
  ArrowRight, Search, Calendar, DollarSign, Quote,
  Clock, TrendingUp, Leaf, Cloud, Heart, Volume2, VolumeX,
  Globe, Plane, Compass
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ParachuteIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 250" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M 20 100 C 20 -20, 180 -20, 180 100" fill="currentColor" fillOpacity="0.2" />
    <path d="M 20 100 C 60 80, 140 80, 180 100" />
    <path d="M 60 100 C 60 85, 140 85, 140 100" />
    <line x1="20" y1="100" x2="100" y2="180" />
    <line x1="60" y1="100" x2="100" y2="180" />
    <line x1="140" y1="100" x2="100" y2="180" />
    <line x1="180" y1="100" x2="100" y2="180" />
    <circle cx="100" cy="190" r="10" fill="currentColor" />
    <line x1="100" y1="200" x2="100" y2="220" />
    <line x1="100" y1="205" x2="85" y2="190" />
    <line x1="100" y1="205" x2="115" y2="190" />
    <line x1="100" y1="220" x2="90" y2="245" />
    <line x1="100" y1="220" x2="110" y2="245" />
  </svg>
);

export default function HomePage() {
  const { scrollY, scrollYProgress } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const textY = useTransform(scrollY, [0, 1000], [0, 100]);

  // Scroll Parachute Animation Map
  const paraX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0],
    ["80vw", "5vw", "80vw", "5vw", "80vw", "40vw", "5vw"]
  );

  const paraY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0],
    ["20vh", "70vh", "20vh", "80vh", "30vh", "80vh", "-20vh"]
  );

  const paraRotate = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0],
    [0, -10, 10, -10, 10, 0, 15]
  );

  // Flip the parachute depending on travel direction
  // Assuming native image faces Left (1 = Left, -1 = Right)
  const paraScaleX = useTransform(
    scrollYProgress,
    [0, 0.19, 0.2, 0.39, 0.4, 0.59, 0.6, 0.79, 0.8, 0.89, 0.9, 1.0],
    [1, 1, -1, -1, 1, 1, -1, -1, 1, 1, 1, 1]
  );

  const paraScale = useTransform(
    scrollYProgress,
    [0, 0.2, 1],
    [2.5, 1, 1]
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Exact coordinates for Parachute
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(-1000); // Start off-screen
  const cursorY = useMotionValue(-1000);
  const smoothCursorX = useSpring(cursorX, { stiffness: 150, damping: 25, mass: 0.5 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 150, damping: 25, mass: 0.5 });
  const [isHoveringSection, setIsHoveringSection] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);

      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // Check if mouse is hovering this massive section
        const isHovering = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        setIsHoveringSection(isHovering);

        if (isHovering) {
          // Adjust by half the icon size (assuming ~80x100 rendered size)
          cursorX.set(e.clientX - rect.left - 40);
          cursorY.set(e.clientY - rect.top - 50);
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, cursorX, cursorY]);

  const trackerX = useTransform(smoothMouseX, [-1, 1], [-80, 80]);
  const trackerY = useTransform(smoothMouseY, [-1, 1], [-80, 80]);
  const trackerXFast = useTransform(smoothMouseX, [-1, 1], [-160, 160]);
  const trackerYFast = useTransform(smoothMouseY, [-1, 1], [-160, 160]);

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const [heroSlidesText, setHeroSlidesText] = React.useState({
    slide1Title: "NEPAL",
    slide1Subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas. The perfect start to your unforgettable journey.",
    slide2Title: "ANNAPURNA",
    slide2Subtitle: "Trek through lush valleys and traditional mountain villages to the heart of the majestic Annapurna sanctuary."
  });

  React.useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "hero_content"));
        if (docSnap.exists()) {
          setHeroSlidesText(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching hero settings:", error);
      }
    }
    fetchHeroSettings();
  }, []);

  const heroSlides = [
    {
      title: heroSlidesText.slide1Title,
      image: "/herovidoe.gif",
      subtitle: heroSlidesText.slide1Subtitle
    },
    {
      title: heroSlidesText.slide2Title,
      image: "/heroviode2.gif",
      subtitle: heroSlidesText.slide2Subtitle
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      // We intentionally do NOT change the video's mute state, so the video remains silent.
      if (audioRef.current) {
        if (!newMuted) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
      return newMuted;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 3D Scrolling Parachute */}
      <motion.div
        className="fixed z-[60] pointer-events-none drop-shadow-2xl"
        style={{
          x: paraX,
          y: paraY,
          scaleX: paraScaleX,
          scale: paraScale,
          rotate: paraRotate
        }}
      >
        <Image 
          src="/para3d.png" 
          alt="Parachute" 
          width={240} 
          height={300} 
          className="w-32 md:w-48 h-auto object-contain"
          priority
        />
      </motion.div>

      {/* 1. HERO SECTION (Advanced 3D Layered Parallax) */}
      <section className="relative h-[100svh] min-h-[700px] overflow-hidden flex flex-col justify-end pb-24 md:pb-32">
        
        {/* HERO TAGS (Floating over Hero top) */}
        <div className="absolute top-20 md:top-28 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="container mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col items-center gap-2.5 md:gap-4"
            >
              {/* Trip Detail Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
                <span className="flex items-center gap-1 md:gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <MapPin className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-white/70" /> Everest Region
                </span>
                <span className="flex items-center gap-1 md:gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Clock className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-white/70" /> 15 days
                </span>
                <span className="flex items-center gap-1 md:gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <TrendingUp className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-white/70" /> challenging
                </span>
              </div>

              {/* Sustainability Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
                <span className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Leaf className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> Zero Waste
                </span>
                <span className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Cloud className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> Low-carbon
                </span>
                <span className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Users className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> Local Hire
                </span>
                <span className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Heart className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> Inclusive Growth
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Layer 1: Background GIF Slideshow */}
        <motion.div style={{ y: bgY }} className="absolute -inset-[10%] z-0 pointer-events-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroSlides[currentSlide].image}
                alt="Hero background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Layer 2: Massive Typography */}
        <motion.div 
          style={{ y: textY }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden pb-32 md:pb-20"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[10rem] font-black text-white leading-none tracking-tighter uppercase select-none opacity-95 text-center px-4"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* Content (Bottom Controls & Right Content) - Top Layer */}
        <div className="container relative z-30 px-4 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 md:gap-12">
            
            {/* Left side: Slide Indicators */}
            <div className="flex flex-col gap-4 pb-2 w-full md:w-auto items-center md:items-start">
              {/* Slide Indicators */}
              <div className="flex gap-2.5 md:gap-3 justify-center md:justify-start">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 md:h-1.5 rounded-full transition-all duration-500 ${
                      i === currentSlide ? "w-8 md:w-12 bg-white" : "w-3 md:w-4 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right side: Text and Button */}
            <div className="max-w-md w-full mx-auto md:mx-0 md:ml-auto text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center md:items-start"
                >
                  <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-6 w-full">
                    {/* Sound Toggle */}
                    <button
                      onClick={toggleMute}
                      className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/10 shadow-xl group"
                      aria-label={isMuted ? "Unmute mountain sound" : "Mute mountain sound"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4 md:h-5 md:w-5 text-white/70 group-hover:text-white transition-colors" />
                      ) : (
                        <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-brand-400 group-hover:text-brand-300 transition-colors" />
                      )}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-1 md:flex-none">
                      <Link 
                        href="/trips" 
                        className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white text-black font-bold text-xs md:text-sm hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] flex-1 text-center"
                      >
                        Discover More
                      </Link>
                      <Link 
                        href="/trips"
                        className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg group"
                      >
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed font-medium px-2 md:px-0">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
        
        {/* Hidden Audio Element for Mountain Sound */}
        <audio ref={audioRef} src="/mountain-sound.ogg" loop />
      </section>

      {/* 2. MAIN CONTENT AREA with Unified Greenish Gradient Morphism Background */}
      <div ref={sectionRef} className="relative bg-background overflow-hidden">
        
        {/* Exact Cursor Tracker (Parachute) */}
        <AnimatePresence>
          {isHoveringSection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ x: smoothCursorX, y: smoothCursorY }}
              className="absolute top-0 left-0 z-50 pointer-events-none text-brand-500 drop-shadow-2xl"
            >
              <ParachuteIcon className="w-20 h-24" />
            </motion.div>
          )}
        </AnimatePresence>


        {/* Cursor tracking interactive background (Travel/Globe Theme) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Large Wireframe Text */}
          <motion.div
            style={{ x: trackerY, y: trackerX }} // Inverted slightly for parallax difference
            className="absolute top-[15%] left-0 right-0 flex justify-center opacity-5 dark:opacity-10"
          >
            <h2 
              className="text-[15vw] font-black uppercase tracking-tighter leading-none text-foreground text-center" 
              style={{ WebkitTextStroke: '1px currentColor', color: 'transparent' }}
            >
              ALWAYS<br/>EXPLORING
            </h2>
          </motion.div>

          {/* Wireframe Globe */}
          <motion.div 
            style={{ x: trackerX, y: trackerY }}
            className="absolute top-[5%] w-full flex items-center justify-center opacity-[0.04] dark:opacity-[0.06]"
          >
            <Globe className="w-[90vw] h-[90vw] text-foreground" strokeWidth={0.5} />
          </motion.div>
        </div>

        {/* Unified Glassmorphic Green Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Top Left Green Glow */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/20 blur-[120px] rounded-full mix-blend-normal" />
          {/* Middle Right Emerald Glow */}
          <div className="absolute top-[30%] right-[-20%] w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[150px] rounded-full mix-blend-normal" />
          {/* Bottom Center Teal Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 dark:bg-teal-500/15 blur-[150px] rounded-full mix-blend-normal" />
        </div>

        {/* 2. HIGHLIGHTS (Trust Section) */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase"
                >
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Us</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                >
                  We provide the best experiences for your Himalayan adventures with safety and reliability as our top priorities.
                </motion.p>
              </div>
              
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="hidden md:flex items-center gap-3 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 text-brand-700 dark:text-brand-300 px-6 py-4 rounded-full font-bold shadow-lg backdrop-blur-sm"
              >
                <Star className="h-5 w-5 text-brand-500 fill-brand-500" />
                Trusted by 10,000+ Explorers
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: ShieldCheck, title: "Safety & Trust", desc: "Expert licensed guides and prioritizing your safety above all else." },
                { icon: DollarSign, title: "Affordable Pricing", desc: "Best value packages without hidden costs or compromises." },
                { icon: Mountain, title: "Adventure Experiences", desc: "Curated itineraries to deliver breathtaking memories." },
                { icon: Users, title: "Custom Trips", desc: "Tailor-made holidays designed specifically for your group." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                  className="group relative p-8 md:p-10 rounded-[2.5rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-brand-500/30 transition-all duration-500 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.1)]"
                >
                  {/* Hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-8 shadow-sm group-hover:-translate-y-2 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-500">
                      <feature.icon className="h-8 w-8 text-foreground group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-500">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FEATURED TOURS */}
        <section id="featured" className="py-24 relative z-10 border-y border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase"
                >
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Tours</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                >
                  Discover our most popular trekking and tour packages highly rated by our travelers.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link 
                  href="/trips" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold hover:bg-brand-500 hover:text-white transition-all group border border-brand-500/20 shadow-md backdrop-blur-sm"
                >
                  View All Trips 
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: "Night with Nomads", 
                  image: "/images/everest.png", 
                  price: "$850", 
                  duration: "7 days", 
                  region: "Annapurna Region",
                  groupSize: "Max 6 people",
                  difficulty: "moderate",
                  desc: "Our unique Indigenous Experiences in Nepal offer more than just mountain trekking. We provide an immersive journey into traditional culture...",
                  tags: [
                    { icon: Cloud, label: "Low-carbon" },
                    { icon: Users, label: "Local Hire" },
                    { icon: Heart, label: "Inclusive Growth" }
                  ],
                  slug: "night-with-nomads"
                },
                { 
                  title: "Annapurna Circuit and Lakes", 
                  image: "/images/annapurna.png", 
                  price: "$1450", 
                  duration: "14 days", 
                  region: "Annapurna Region",
                  groupSize: "Max 8 people",
                  difficulty: "challenging",
                  desc: "The Annapurna Circuit Trek is a journey full of challenges that combines the classic Annapurna routes with stunning alpine lakes...",
                  tags: [
                    { icon: Leaf, label: "Zero Waste" },
                    { icon: Users, label: "Local Hire" },
                    { icon: Heart, label: "Inclusive Growth" }
                  ],
                  slug: "annapurna-circuit"
                },
                { 
                  title: "Manaslu Circuit Trek", 
                  image: "/images/everest.png", 
                  price: "$1650", 
                  duration: "11 days", 
                  region: "Manaslu Region",
                  groupSize: "Max 8 people",
                  difficulty: "challenging",
                  desc: "The Manaslu Circuit Trek is one of Nepal's most scenic and culturally rich trekking routes, offering breathtaking views of Mt. Manaslu...",
                  tags: [
                    { icon: Leaf, label: "Zero Waste" },
                    { icon: Cloud, label: "Low-carbon" },
                    { icon: Users, label: "Local Hire" }
                  ],
                  slug: "manaslu-circuit"
                }
              ].map((tour, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 transition-all duration-500 flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    {/* Glassmorphic Greenish Difficulty Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/40 to-brand-500/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
                      {tour.difficulty}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                      {tour.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                      {tour.desc}
                    </p>
                    
                    {/* Details List */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {tour.region}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4" /> {tour.duration}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Users className="h-4 w-4" /> {tour.groupSize}
                      </div>
                    </div>

                    {/* Sustainability Tags */}
                    <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                      {tour.tags.map((tag, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/60 backdrop-blur-md border border-border shadow-sm transition-transform hover:scale-105 cursor-default text-foreground">
                          <tag.icon className="h-3.5 w-3.5 opacity-70" /> {tag.label}
                        </span>
                      ))}
                    </div>

                    {/* Footer (Price & Button) */}
                    <div className="pt-6 border-t border-border/50 flex items-end justify-between">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">From</span>
                        <span className="text-3xl font-black text-foreground leading-none">{tour.price}</span>
                      </div>
                      <Link 
                        href={`/trips/${tour.slug}`}
                        className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/25"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. TESTIMONIALS PREVIEW */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Don&apos;t just take our word for it. Read reviews from travelers who experienced the Himalayas with us.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Sarah Jenkins", role: "Adventure Traveler", text: "The Everest Base Camp trek was impeccably organized. Our guide was incredibly knowledgeable and supportive throughout the journey." },
                { name: "David Chen", role: "Photographer", text: "Stunning landscapes and a beautifully paced itinerary. Green Adventure made sure we had enough time for acclimatization and photography." },
                { name: "Emma Thompson", role: "Solo Backpacker", text: "As a solo female traveler, safety was my main concern. The team made me feel secure and part of a family. Highly recommended!" }
              ].map((review, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative hover:shadow-xl transition-all duration-300"
                >
                  <Quote className="absolute top-8 right-8 h-12 w-12 text-muted/50" />
                  <div className="flex items-center gap-2 mb-6">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
                  </div>
                  <p className="text-lg text-foreground mb-8 relative z-10">&quot;{review.text}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold">{review.name}</h4>
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA BANNER */}
        <section className="p-8 md:p-12 lg:px-16 relative overflow-hidden z-[70] rounded-[3rem] mx-4 md:mx-12 mb-12 shadow-2xl bg-[#0c0c0c] border border-white/5 group">
          <div className="absolute -top-32 -right-12 text-[#161616] rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-1000 ease-out z-0">
            <Compass className="w-[500px] h-[500px]" />
          </div>
          
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col xl:flex-row items-center justify-between gap-8"
            >
              <div className="relative z-10 max-w-2xl xl:max-w-4xl text-center xl:text-left">
                <h2 className="text-3xl md:text-[3.25rem] xl:text-[3.5rem] font-black tracking-tight mb-4 text-white uppercase leading-[1.1]">
                  <span className="block md:inline whitespace-normal md:whitespace-nowrap">Ready for the <span className="text-[#22c55e]">adventure</span></span><br className="hidden md:block" />
                  <span className="block md:inline mt-2 md:mt-0">of a lifetime?</span>
                </h2>
                <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto xl:mx-0">
                  Book your Himalayan trek today and let us take care of all the details.
                </p>
              </div>
              <div className="relative z-10 shrink-0 mt-8 xl:mt-0 w-full sm:w-auto flex justify-center xl:justify-end">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 md:px-10 md:py-5 rounded-full bg-[#22c55e] hover:bg-[#1fae53] text-white font-black tracking-wide uppercase text-xs md:text-sm group/btn hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                >
                  Plan Your Trip Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
