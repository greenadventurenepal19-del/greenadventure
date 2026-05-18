"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, where, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TripCard, { EmptyTripsState, type TripCardData } from "@/components/TripCard";
import { Loader2 } from "lucide-react";

const TOUR_TYPES = ["Tour", "Tours"];

const DEFAULT_HERO = {
  title: "Our Tours",
  subtitle:
    "Curated cultural, wildlife and scenic tour packages — handpicked by our team to give you the perfect Himalayan experience.",
  bgImage: "/images/hero.png",
  tags: [] as string[],
  tabs: [] as string[],
};

export default function ToursPage() {
  const [tours, setTours] = React.useState<TripCardData[]>([]);
  const [loading, setLoading] = React.useState(true);
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
        if (data?.tours) {
          setHero((prev: any) => ({
            title: data.tours.title || prev.title,
            subtitle: data.tours.subtitle || prev.subtitle,
            bgImage: data.tours.bgImage || prev.bgImage, bgImages: Array.isArray(data.tours.bgImages) ? data.tours.bgImages : prev.bgImages || [],
            tags: data.tours.tags || prev.tags,
            tabs: data.tours.tabs || prev.tabs,
          }));
        }
      }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    async function load() {
      try {
        const qTrips = query(collection(db, "trips"), where("tripType", "in", TOUR_TYPES));
        const snap = await getDocs(qTrips);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TripCardData[];
        setTours(data);
      } catch (err) {
        console.error("Error loading tours from Firestore:", err);
        setTours([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        if (label) set.add(label);
      });
    });
    return ["All", ...Array.from(set).slice(0, 8)];
  }, [tours]);

  const visibleTours = React.useMemo(() => {
    if (activeCategory === "All") return tours;
    return tours.filter((t) =>
      (t.tags || []).some((tag) => {
        const label = typeof tag === "string" ? tag : tag.label;
        return label === activeCategory;
      }),
    );
  }, [tours, activeCategory]);

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src={hero.bgImage}
          alt="Our Tours"
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto mb-10 text-gray-200 font-medium"
          >
            {hero.subtitle}
          </motion.p>

          {/* Categories (built from real tags in DB) */}
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
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[150px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
          ) : visibleTours.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <EmptyTripsState kind="Tours" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTours.map((tour, i) => (
                <TripCard
                  key={tour.id || tour.slug || i}
                  trip={tour}
                  index={i}
                  basePath="tours"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
