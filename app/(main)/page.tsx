"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { 
  Mountain, MapPin, Users, Star, 
  ArrowRight, Search, Calendar, Quote,
  Clock, TrendingUp, Leaf, Cloud, Heart, Volume2, VolumeX,
  Globe, Plane, Compass, BookOpen, Tag
} from "lucide-react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LiquidSlider from "@/components/LiquidSlider";
import ParticleText from "@/components/ParticleText";
import ReviewSubmitModal from "@/components/ReviewSubmitModal";
import PageLoader from "@/components/PageLoader";
import {
  DEFAULT_WHY_CHOOSE,
  resolveIcon,
  type WhyChooseSettings,
} from "@/lib/why-choose";

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

const defaultHeroSlides = [
  { title: "NEPAL", subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas.", image: "/images/hero-nepal.PNG", mobileImage: "", tabletImage: "", upperTags: ["Everest Region", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
  { title: "INDIA", subtitle: "Explore the diverse beauty of the Indian Himalayas, from spiritual journeys to thrilling treks.", image: "/images/hero-india.PNG", mobileImage: "", tabletImage: "", upperTags: ["Ladakh", "15 days", "Challenging"], lowerTags: ["Zero Waste", "Low-carbon", "Local Hire", "Inclusive Growth"] },
  { title: "BHUTAN", subtitle: "Experience the magic of the Land of the Thunder Dragon, with its pristine landscapes and ancient monasteries.", image: "/images/hero-bhutan.PNG", mobileImage: "", tabletImage: "", upperTags: ["Paro Valley", "7 days", "Moderate"], lowerTags: ["Eco-Friendly", "Cultural Preservation", "Local Hire", "Inclusive Growth"] },
];

let homeCache = {
  isLoaded: false,
  heroSlides: null as any,
  whyChoose: null as any,
  featuredTours: null as any,
  featuredTreks: null as any,
  featuredBlogs: null as any,
  dbRegions: null as any,
  approvedReviews: null as any,
};

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
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [activeBgIndex, setActiveBgIndex] = React.useState(0);

  const [heroSlides, setHeroSlides] = React.useState<any[]>(homeCache.heroSlides || defaultHeroSlides);

  // Device type detection for responsive hero images
  const [deviceType, setDeviceType] = React.useState<"mobile" | "tablet" | "desktop">("desktop");

  // Auto cycle background images for the active slide every 5 seconds
  React.useEffect(() => {
    const activeSlideData = heroSlides[currentSlide];
    let bgList = (activeSlideData?.bgImages && activeSlideData.bgImages.length > 0) ? activeSlideData.bgImages : [activeSlideData?.image];
    
    if (deviceType === "mobile") {
      bgList = (activeSlideData?.mobileBgImages && activeSlideData.mobileBgImages.length > 0) ? activeSlideData.mobileBgImages : (activeSlideData?.mobileImage ? [activeSlideData.mobileImage] : bgList);
    } else if (deviceType === "tablet") {
      bgList = (activeSlideData?.tabletBgImages && activeSlideData.tabletBgImages.length > 0) ? activeSlideData.tabletBgImages : (activeSlideData?.tabletImage ? [activeSlideData.tabletImage] : bgList);
    }
    
    const bgCount = bgList.length || 1;
    if (bgCount > 1) {
      const interval = setInterval(() => {
        setActiveBgIndex(prev => (prev + 1) % bgCount);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentSlide, heroSlides, deviceType]);


  const [featuredTours, setFeaturedTours] = React.useState<any[]>(homeCache.featuredTours || []);
  const [featuredTreks, setFeaturedTreks] = React.useState<any[]>(homeCache.featuredTreks || []);
  const [featuredBlogs, setFeaturedBlogs] = React.useState<any[]>(homeCache.featuredBlogs || []);
  const [dbRegions, setDbRegions] = React.useState<any[]>(homeCache.dbRegions || []);
  const [approvedReviews, setApprovedReviews] = React.useState<any[]>(homeCache.approvedReviews || []);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [whyChoose, setWhyChoose] = React.useState<WhyChooseSettings>(homeCache.whyChoose || DEFAULT_WHY_CHOOSE);
  const [pageLoaded, setPageLoaded] = React.useState(homeCache.isLoaded);
  const loadFlags = React.useRef({ hero: false, why: false, data: false, reviews: false });
  const markLoaded = React.useCallback((key: keyof typeof loadFlags.current) => {
    loadFlags.current[key] = true;
    if (Object.values(loadFlags.current).every(Boolean)) setPageLoaded(true);
  }, []);



  React.useEffect(() => {
    if (homeCache.isLoaded) {
      setHeroSlides(homeCache.heroSlides || defaultHeroSlides);
      setWhyChoose(homeCache.whyChoose || DEFAULT_WHY_CHOOSE);
      setFeaturedTours(homeCache.featuredTours || []);
      setFeaturedTreks(homeCache.featuredTreks || []);
      setFeaturedBlogs(homeCache.featuredBlogs || []);
      setDbRegions(homeCache.dbRegions || []);
      setApprovedReviews(homeCache.approvedReviews || []);
      setPageLoaded(true);
      return;
    }

    async function fetchHeroSettings() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "hero_content"));
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          if (Array.isArray(data.slides) && data.slides.length > 0) {
            const defaultImages = ["/images/hero-nepal.PNG", "/images/hero-india.PNG", "/images/hero-bhutan.PNG"];
            const slides = data.slides.map((s: any, i: number) => ({
              ...s,
              image: s.image || defaultImages[i] || defaultImages[0],
            }));
            setHeroSlides(slides);
            homeCache.heroSlides = slides;
          } else if (data.slide1Title) {
            const defaultImages = ["/images/hero-india.PNG", "/images/hero-nepal.PNG", "/images/hero-bhutan.PNG"];
            const migrated = [];
            let i = 1;
            while (data[`slide${i}Title`]) {
              migrated.push({
                title: data[`slide${i}Title`] || "",
                subtitle: data[`slide${i}Subtitle`] || "",
                image: data[`slide${i}Image`] || defaultImages[i - 1] || defaultImages[0],
                upperTags: data[`slide${i}UpperTags`] || [],
                lowerTags: data[`slide${i}LowerTags`] || [],
              });
              i++;
            }
            if (migrated.length > 0) {
              setHeroSlides(migrated);
              homeCache.heroSlides = migrated;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching hero settings:", error);
      } finally {
        markLoaded("hero");
      }
    }

    async function fetchWhyChoose() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "why_choose_us"));
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<WhyChooseSettings>;
          setWhyChoose(prev => {
            const newState = {
              ...prev,
              ...data,
              features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features,
            };
            homeCache.whyChoose = newState;
            return newState;
          });
        }
      } catch (error) {
        console.error("Error fetching Why Choose Us settings:", error);
      } finally {
        markLoaded("why");
      }
    }

    async function fetchData() {
      try {
        const qTrips = query(collection(db, "trips"), where("isFeatured", "==", true));
        const tripsSnap = await getDocs(qTrips);
        const tripsData = tripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const tours = tripsData.filter((t: any) => t.tripType === "Tour" || t.tripType === "Tours" || !t.tripType).slice(0, 3);
        const treks = tripsData.filter((t: any) => t.tripType === "Trekking").slice(0, 3);
        setFeaturedTours(tours);
        setFeaturedTreks(treks);
        homeCache.featuredTours = tours;
        homeCache.featuredTreks = treks;

        const qRegions = query(collection(db, "regions"));
        const regionsSnap = await getDocs(qRegions);
        const regionsData = regionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (regionsData.length > 0) {
          const sortedRegions = regionsData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setDbRegions(sortedRegions);
          homeCache.dbRegions = sortedRegions;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setFeaturedTours([]);
        setFeaturedTreks([]);
      } finally {
        markLoaded("data");
      }
    }

    async function fetchReviews() {
      try {
        const qReviews = query(collection(db, "reviews"), where("status", "==", "approved"));
        const snap = await getDocs(qReviews);
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
        setApprovedReviews(data);
        homeCache.approvedReviews = data;
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        markLoaded("reviews");
      }
    }

    async function fetchFeaturedBlogsData() {
      try {
        const q = query(
          collection(db, "blogs"),
          where("isFeatured", "==", true),
          where("status", "==", "published")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const blogs = data.slice(0, 3);
        setFeaturedBlogs(blogs);
        homeCache.featuredBlogs = blogs;
      } catch {
        setFeaturedBlogs([]);
      }
    }

    Promise.all([
      fetchHeroSettings(),
      fetchWhyChoose(),
      fetchData(),
      fetchReviews(),
      fetchFeaturedBlogsData()
    ]).then(() => {
      homeCache.isLoaded = true;
    });

  }, []);


  // Detect device type on mount and resize for responsive hero images
  React.useEffect(() => {
    const checkDevice = () => {
      const w = window.innerWidth;
      if (w < 768) setDeviceType("mobile");
      else if (w < 1024) setDeviceType("tablet");
      else setDeviceType("desktop");
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Helper to pick the right image per slide based on device
  const getResponsiveImage = React.useCallback((slide: any, slideIdx: number) => {
    let baseImg = slide.image;
    let bgList = (Array.isArray(slide.bgImages) && slide.bgImages.length > 0) ? slide.bgImages : [baseImg];
    
    if (deviceType === "mobile") {
      baseImg = slide.mobileImage || baseImg;
      bgList = (Array.isArray(slide.mobileBgImages) && slide.mobileBgImages.length > 0) ? slide.mobileBgImages : (slide.mobileImage ? [slide.mobileImage] : bgList);
    } else if (deviceType === "tablet") {
      baseImg = slide.tabletImage || baseImg;
      bgList = (Array.isArray(slide.tabletBgImages) && slide.tabletBgImages.length > 0) ? slide.tabletBgImages : (slide.tabletImage ? [slide.tabletImage] : bgList);
    }
    
    if (slideIdx === currentSlide) {
      return bgList[activeBgIndex % bgList.length] || baseImg;
    } else {
      return bgList[0] || baseImg;
    }
  }, [deviceType, currentSlide, activeBgIndex]);

  React.useEffect(() => {
    // Liquid slider is now user-controlled via hover and click, 
    // no auto-sliding interval.
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      if (!newMuted) {
        audioRef.current.volume = 1;
        audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageLoader isLoading={!pageLoaded} />
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
      <section 
        className="relative h-[100svh] min-h-[700px] overflow-hidden flex flex-col justify-end pb-24 md:pb-32 cursor-pointer"
        style={{ WebkitTapHighlightColor: "transparent" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsMouseDown(false); }}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onClick={() => {
          setActiveBgIndex(0);
          setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }}
      >
        
        {/* HERO TAGS (Floating over Hero top) */}
        <div className="absolute top-20 md:top-28 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="container mx-auto max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tags-${currentSlide}`}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center gap-2.5 md:gap-4"
              >
                {/* Trip Detail Tags (Upper) */}
                {heroSlides[currentSlide]?.upperTags?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
                    {heroSlides[currentSlide].upperTags.map((tag: string, i: number) => {
                      // Smart icon selection based on tag content
                      const lowerTag = tag.toLowerCase();
                      let IconComp = MapPin;
                      if (lowerTag.includes("day")) IconComp = Clock;
                      else if (["easy", "moderate", "challenging", "strenuous", "extreme"].some(d => lowerTag.includes(d))) IconComp = TrendingUp;
                      else if (["trek", "adventure"].some(d => lowerTag.includes(d))) IconComp = Mountain;
                      else if (["tour", "cultural", "pilgrimage"].some(d => lowerTag.includes(d))) IconComp = Compass;
                      else if (["safari", "wildlife"].some(d => lowerTag.includes(d))) IconComp = Globe;
                      else if (["spring", "summer", "autumn", "winter", "year-round"].some(d => lowerTag.includes(d))) IconComp = Calendar;
                      
                      return (
                        <span key={i} className="flex items-center gap-1 md:gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                          <IconComp className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-white/70" /> {tag}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Sustainability Tags (Lower) */}
                {heroSlides[currentSlide]?.lowerTags?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
                    {heroSlides[currentSlide].lowerTags.map((tag: string, i: number) => {
                      const lowerTag = tag.toLowerCase();
                      let IconComp = Leaf;
                      if (["carbon", "low-carbon", "carbon neutral", "renewable"].some(d => lowerTag.includes(d))) IconComp = Cloud;
                      else if (["local", "community", "fair"].some(d => lowerTag.includes(d))) IconComp = Users;
                      else if (["inclusive", "cultural", "responsible"].some(d => lowerTag.includes(d))) IconComp = Heart;
                      else if (["water", "plastic"].some(d => lowerTag.includes(d))) IconComp = Globe;
                      
                      return (
                        <span key={i} className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-medium shadow-xl pointer-events-auto transition-transform hover:scale-105 cursor-default">
                          <IconComp className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" /> {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Layer 1: Background Liquid Slider */}
        <motion.div style={{ y: bgY }} className="absolute -inset-[10%] z-0 pointer-events-none">
          <LiquidSlider 
            slides={heroSlides.map((s, i) => getResponsiveImage(s, i))}
            currentIndex={currentSlide}
            nextIndex={(currentSlide + 1) % heroSlides.length}
            isHovered={isHovered}
            isMouseDown={isMouseDown}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10 pointer-events-none" />
        </motion.div>

        {/* Layer 2: Massive Particle Typography */}
        <motion.div 
          style={{ y: textY }}
          className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pb-32 md:pb-20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ParticleText text={heroSlides[currentSlide].title} />
            </motion.div>
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
                    onClick={() => { setActiveBgIndex(0); setCurrentSlide(i); }}
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
                        href="/tours" 
                        className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white text-black font-bold text-xs md:text-sm hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] flex-1 text-center"
                      >
                        Discover More
                      </Link>
                      <Link 
                        href="/tours"
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
        <audio ref={audioRef} src="/audio.mp3" preload="auto" loop />
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


        {/* Unified Glassmorphic Green Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Top Left Green Glow */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/20 blur-[120px] rounded-full mix-blend-normal" />
          {/* Middle Right Emerald Glow */}
          <div className="absolute top-[30%] right-[-20%] w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[150px] rounded-full mix-blend-normal" />
          {/* Bottom Center Teal Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 dark:bg-teal-500/15 blur-[150px] rounded-full mix-blend-normal" />
        </div>

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
                  href="/tours" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold hover:bg-brand-500 hover:text-white transition-all group border border-brand-500/20 shadow-md backdrop-blur-sm"
                >
                  View All Tours 
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.length > 0 ? (
                featuredTours.map((tour, i) => (
                  <motion.div 
                    key={tour.id || i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group relative rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 transition-all duration-500 flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={tour.image || "/images/everest.png"}
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
                    <div className="p-5 md:p-6 flex flex-col flex-1">
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
                        {tour.groupSize && (
                          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                            <Users className="h-4 w-4" /> {tour.groupSize}
                          </div>
                        )}
                      </div>

                      {/* Sustainability Tags */}
                      {tour.tags && tour.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                          {tour.tags.map((tag: any, idx: number) => {
                            const isString = typeof tag === 'string';
                            const label = isString ? tag : tag.label;
                            const tagStr = label.toLowerCase();
                            let Icon = Leaf;
                            if (tagStr.includes('cultur') || tagStr.includes('local') || tagStr.includes('histor')) Icon = Compass;
                            else if (tagStr.includes('spirit') || tagStr.includes('well') || tagStr.includes('honeymoon')) Icon = Heart;
                            else if (tagStr.includes('wild') || tagStr.includes('animal')) Icon = Cloud;
                            else if (tagStr.includes('famil') || tagStr.includes('group')) Icon = Users;
                            else if (!isString && tag.icon) Icon = tag.icon;

                            return (
                              <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/60 backdrop-blur-md border border-border shadow-sm transition-transform hover:scale-105 cursor-default text-foreground">
                                <Icon className="h-3.5 w-3.5 opacity-70" /> {label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {(!tour.tags || tour.tags.length === 0) && (
                        <div className="mt-auto mb-8"></div>
                      )}

                      {/* Footer (Price & Button) */}
                      <div className="pt-5 border-t border-border/50 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Pay Level</span>
                          <span className="text-xl font-black text-foreground leading-none">
                            ${tour.price?.replace(/usd|\$|per person|\/ person/gi, '').trim()} <span className="text-[13px] font-semibold text-muted-foreground">/ person</span>
                          </span>
                        </div>
                        <Link 
                          href={`/tours/${tour.slug || tour.id}`}
                          className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-[13px] hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/25"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-brand-500/5 rounded-3xl border border-brand-500/10">
                  <Mountain className="w-16 h-16 text-brand-500/40 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground/70">More Adventures Coming Soon</h3>
                  <p className="text-muted-foreground mt-2">We are currently curating the best experiences for you.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3.5. FEATURED TREKKING */}
        <section id="featured-trekking" className="py-24 relative z-10 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase"
                >
                  Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Trekking</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                >
                  Embark on an unforgettable journey through the majestic trails of the Himalayas.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link 
                  href="/trekking" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold hover:bg-brand-500 hover:text-white transition-all group border border-brand-500/20 shadow-md backdrop-blur-sm"
                >
                  View All Treks 
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTreks.length > 0 ? (
                featuredTreks.map((trek, i) => (
                  <motion.div 
                    key={trek.id || i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group relative rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.15)] hover:border-brand-500/30 transition-all duration-500 flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={trek.image || "/images/everest.png"}
                        alt={trek.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      {/* Glassmorphic Greenish Difficulty Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/40 to-brand-500/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
                        {trek.difficulty}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 md:p-6 flex flex-col flex-1">
                      <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                        {trek.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                        {trek.desc}
                      </p>
                      
                      {/* Details List */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {trek.region}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                          <Calendar className="h-4 w-4" /> {trek.duration}
                        </div>
                        {trek.groupSize && (
                          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                            <Users className="h-4 w-4" /> {trek.groupSize}
                          </div>
                        )}
                      </div>

                      {/* Sustainability Tags */}
                      {trek.tags && trek.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                          {trek.tags.map((tag: any, idx: number) => {
                            const isString = typeof tag === 'string';
                            const label = isString ? tag : tag.label;
                            const tagStr = label.toLowerCase();
                            let Icon = Leaf;
                            if (tagStr.includes('cultur') || tagStr.includes('local') || tagStr.includes('histor')) Icon = Compass;
                            else if (tagStr.includes('spirit') || tagStr.includes('well') || tagStr.includes('honeymoon')) Icon = Heart;
                            else if (tagStr.includes('wild') || tagStr.includes('animal')) Icon = Cloud;
                            else if (tagStr.includes('famil') || tagStr.includes('group')) Icon = Users;
                            else if (!isString && tag.icon) Icon = tag.icon;

                            return (
                              <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/60 backdrop-blur-md border border-border shadow-sm transition-transform hover:scale-105 cursor-default text-foreground">
                                <Icon className="h-3.5 w-3.5 opacity-70" /> {label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {(!trek.tags || trek.tags.length === 0) && (
                        <div className="mt-auto mb-8"></div>
                      )}

                      {/* Footer (Price & Button) */}
                      <div className="pt-5 border-t border-border/50 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Pay Level</span>
                          <span className="text-xl font-black text-foreground leading-none">
                            ${trek.price?.replace(/usd|\$|per person|\/ person/gi, '').trim()} <span className="text-[13px] font-semibold text-muted-foreground">/ person</span>
                          </span>
                        </div>
                        <Link 
                          href={`/trekking/${trek.slug || trek.id}`}
                          className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-[13px] hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand-500/25"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-brand-500/5 rounded-3xl border border-brand-500/10">
                  <Mountain className="w-16 h-16 text-brand-500/40 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground/70">More Treks Coming Soon</h3>
                  <p className="text-muted-foreground mt-2">We are currently curating the best trekking experiences for you.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. TREKKING & EXPEDITIONS */}
        <section className="py-24 relative z-10 border-b border-border/30 bg-brand-500/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">HIMALAYAN</span> ADVENTURES
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
              >
                Treks, Cultural Escapes & Spiritual Journeys<br/>
                <span className="text-foreground font-bold mt-2 inline-block">Nepal • Bhutan • India</span>
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(() => {
                const defaults = [
                  { key: "nepal", title: "Nepal Himalayan Treks", image: "/images/everest.png", desc: "Annapurna, Everest, Manaslu & more" },
                  { key: "bhutan", title: "Bhutan Cultural Escapes", image: "/images/hero-snow.jpg", desc: "Tiger's Nest, Thimphu & Paro Valley" },
                  { key: "india", title: "India Spiritual Journeys", image: "/images/hero-night.jpg", desc: "Varanasi, Kerala, Goa, Sikkim & Darjeeling" }
                ];
                // Merge defaults with DB regions, respecting `featured` flag
                const merged = defaults.map(def => {
                  const dbMatch = dbRegions.find((r: any) =>
                    typeof r.title === "string" && r.title.toLowerCase().includes(def.key)
                  );
                  return dbMatch ? { ...dbMatch, key: def.key } : { ...def, id: def.key };
                });
                // Filter to only featured regions (if at least one has featured set)
                const hasFeaturedFlag = merged.some((r: any) => r.featured === true || r.featured === false);
                const filtered = hasFeaturedFlag
                  ? merged.filter((r: any) => r.featured !== false)
                  : merged;
                return filtered.length > 0 ? filtered : merged;
              })().map((region: any, i: number) => (
                <motion.div
                  key={region.key || region.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative h-[22rem] rounded-[2.5rem] overflow-hidden group cursor-pointer"
                >
                  <Image src={region.image} alt={region.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl font-black text-white mb-2">{region.title}</h3>
                    <p className="text-white/80 font-medium">{region.desc}</p>
                    <Link href={`/destinations/${region.key || region.title.toLowerCase().split(" ")[0]}`} className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold transition-all border border-white/20 group/btn">
                      Explore Region <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. FEATURED BLOG POSTS */}
        {featuredBlogs.length > 0 && (
          <section className="py-24 relative z-10 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
            </div>
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold uppercase tracking-[0.3em] mb-4"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> From Our Blog
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black tracking-tight uppercase"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">TRAVEL</span> STORIES
                  </motion.h2>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brand-500/40 text-brand-500 font-bold text-sm hover:bg-brand-500/10 transition-all group"
                  >
                    View All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              {/* Blog Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredBlogs.map((post: any, i: number) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className="group flex flex-col bg-card rounded-[2rem] overflow-hidden border border-border/60 hover:border-brand-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2"
                  >
                    {/* Image */}
                    <Link href={`/blog/${post.slug || post.id}`} className="block">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={post.image || "/images/hero.png"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="absolute top-4 left-4 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          {post.category || "Blog"}
                        </span>
                        {post.readTime && (
                          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                            <Clock className="w-3 h-3" /> {post.readTime}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Body */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Tags */}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                              <Tag className="w-2.5 h-2.5" />{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link href={`/blog/${post.slug || post.id}`}>
                        <h3 className="text-base font-black text-foreground mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-5 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <Link
                        href={`/blog/${post.slug || post.id}`}
                        className="mt-auto inline-flex items-center gap-2 text-brand-500 font-bold text-sm hover:gap-3 transition-all"
                      >
                        Read Article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Share Your Story CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-14 flex justify-center"
              >
                <Link href="/blog#write-for-us"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414V18h1.586a2 2 0 001.414-.586l6.586-6.586" /></svg>
                  Share Your Story
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </section>
        )}

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
                  {whyChoose.title}
                  {whyChoose.titleHighlight && (
                    <>
                      {" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
                        {whyChoose.titleHighlight}
                      </span>
                    </>
                  )}
                </motion.h2>
                {whyChoose.description && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                  >
                    {whyChoose.description}
                  </motion.p>
                )}
              </div>

              {/* Trust Badge */}
              {whyChoose.trustBadge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="hidden md:flex items-center gap-3 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 text-brand-700 dark:text-brand-300 px-6 py-4 rounded-full font-bold shadow-lg backdrop-blur-sm"
                >
                  <Star className="h-5 w-5 text-brand-500 fill-brand-500" />
                  {whyChoose.trustBadge}
                </motion.div>
              )}
            </div>

            {whyChoose.features.length > 0 && (
              <div
                className={`grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 ${
                  whyChoose.features.length >= 4 ? "lg:grid-cols-4" : whyChoose.features.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
                }`}
              >
                {whyChoose.features.map((feature, i) => {
                  const Icon = resolveIcon(feature.iconName);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                      className="group relative p-8 md:p-10 rounded-[2.5rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-brand-500/30 transition-all duration-500 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.1)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10">
                        <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-8 shadow-sm group-hover:-translate-y-2 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-500">
                          <Icon className="h-8 w-8 text-foreground group-hover:text-white transition-colors duration-500" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-500">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground font-medium leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        
        {/* 6. TESTIMONIALS PREVIEW */}

        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Don&apos;t just take our word for it. Read reviews from travelers who experienced the Himalayas with us.</p>
            </div>

            {approvedReviews.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-16 px-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/40">
                <Quote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Be the first to share your story</h3>
                <p className="text-muted-foreground">
                  Approved client reviews will appear here. Share yours below and our team will publish it after a quick check.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {approvedReviews.map((review: any, i: number) => (
                  <motion.div
                    key={review.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative hover:shadow-xl transition-all duration-300"
                  >
                    <Quote className="absolute top-8 right-8 h-12 w-12 text-muted/50" />
                    <div className="flex items-center gap-2 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`h-5 w-5 ${j < (review.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-lg text-foreground mb-8 relative z-10">&quot;{review.message}&quot;</p>
                    <div className="flex items-center gap-4">
                      {review.photo ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
                          <Image src={review.photo} alt={review.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {review.name?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold">{review.name}</h4>
                        {review.role && <p className="text-sm text-muted-foreground">{review.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Share Your Story CTA */}
            <div className="text-center mt-16">
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-500/25"
              >
                <Star className="h-4 w-4 fill-white" />
                Share Your Story
              </button>
              <p className="text-xs text-muted-foreground mt-3">
                Reviews appear after a quick check by our team.
              </p>
            </div>
          </div>
        </section>

        {/* 6. CTA BANNER */}
        <section className="p-8 md:p-12 lg:px-16 relative overflow-hidden z-[70] rounded-[3rem] mx-4 md:mx-12 mb-12 shadow-2xl bg-card border border-border group">
          <div className="absolute -top-32 -right-12 text-slate-200 dark:text-white opacity-[0.25] dark:opacity-[0.07] md:opacity-[0.45] md:dark:opacity-[0.15] pointer-events-none rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-1000 ease-out z-0">
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
                <h2 className="text-3xl md:text-[3.25rem] xl:text-[3.5rem] font-black tracking-tight mb-4 text-foreground uppercase leading-[1.1]">
                  <span className="block md:inline whitespace-normal md:whitespace-nowrap">Ready for the <span className="text-brand-600 dark:text-[#22c55e]">adventure</span></span><br className="hidden md:block" />
                  <span className="block md:inline mt-2 md:mt-0">of a lifetime?</span>
                </h2>
                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto xl:mx-0">
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

      {/* Review Submission Modal */}
      <ReviewSubmitModal open={showReviewModal} onClose={() => setShowReviewModal(false)} />
    </div>
  );
}
