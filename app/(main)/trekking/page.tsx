"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, where, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TripCard, { EmptyTripsState, type TripCardData } from "@/components/TripCard";
import { Loader2 } from "lucide-react";

const DEFAULT_HERO = {
  title: "Himalayan Trekking",
  subtitle:
    "From the iconic trails of Everest to the hidden valleys of Annapurna — every trek below is curated and added by our team of local guides.",
  bgImage: "/images/hero-snow.jpg",
  tags: [],
  tabs: [],
};

let treksCache = {
  isLoaded: false,
  treks: [] as TripCardData[],
};

export default function TrekkingPage() {
  const [treks, setTreks] = React.useState<TripCardData[]>(treksCache.treks);
  const [loading, setLoading] = React.useState(!treksCache.isLoaded);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [activeBgIndex, setActiveBgIndex] = React.useState(0);
  const [hero, setHero] = React.useState(DEFAULT_HERO);

  React.useEffect(() => {
    const bgList = ((hero as any).bgImages && (hero as any).bgImages.length > 0) ? (hero as any).bgImages : [hero.bgImage];
    if (bgList.length > 1) {
      const interval = setInterval(() => {
        setActiveBgIndex(prev => (prev + 1) % bgList.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [(hero as any).bgImages, hero.bgImage]);
  
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "pages_hero"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data?.trekking) {
          setHero((prev: any) => ({
            title: data.trekking.title || prev.title,
            subtitle: data.trekking.subtitle || prev.subtitle,
            bgImage: data.trekking.bgImage || prev.bgImage, bgImages: Array.isArray(data.trekking.bgImages) ? data.trekking.bgImages : prev.bgImages || [],
            tags: Array.isArray(data.trekking.tags) && data.trekking.tags.length > 0 ? data.trekking.tags : prev.tags,
            tabs: Array.isArray(data.trekking.tabs) && data.trekking.tabs.length > 0 ? data.trekking.tabs : prev.tabs,
          }));
        }
      }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (treksCache.isLoaded) {
      return;
    }
    async function load() {
      try {
        const qTrips = query(collection(db, "trips"), where("tripType", "==", "Trekking"));
        const snap = await getDocs(qTrips);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TripCardData[];
        setTreks(data);
        treksCache.treks = data;
        treksCache.isLoaded = true;
      } catch (err) {
        console.error("Error loading treks from Firestore:", err);
        setTreks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = React.useMemo(() => {
    if (hero.tabs && hero.tabs.length > 0) {
      return ["All", ...hero.tabs];
    }
    const set = new Set<string>();
    treks.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        if (label) set.add(label);
      });
    });
    return ["All", ...Array.from(set).slice(0, 8)];
  }, [treks, hero.tabs]);

  const visibleTreks = React.useMemo(() => {
    if (activeCategory === "All") return treks;
    return treks.filter((t) =>
      (t.tags || []).some((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        return label === activeCategory;
      }),
    );
  }, [treks, activeCategory]);

  return (
    <div className="pb-24 overflow-hidden">
      {/* Header */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src={hero.bgImage}
          alt="Trekking in the Himalayas"
          fill
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase"
          >
            {hero.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
              {hero.title.split(" ").slice(-1)[0]}
            </span>
          </motion.h1>
          
          {hero.tags && hero.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap justify-center gap-2 mb-6"
            >
              {hero.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto mb-10 text-gray-200 font-medium"
          >
            {hero.subtitle}
          </motion.p>

          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 md:gap-3"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 md:px-6 py-2 rounded-full font-semibold text-xs md:text-sm transition-all border ${
                    activeCategory === cat
                      ? "bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/30"
                      : "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 relative">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-500/10 dark:bg-teal-500/15 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
          ) : visibleTreks.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <EmptyTripsState kind="Treks" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTreks.map((trek, i) => (
                <TripCard
                  key={trek.id || trek.slug || i}
                  trip={trek}
                  index={i}
                  basePath="trekking"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
