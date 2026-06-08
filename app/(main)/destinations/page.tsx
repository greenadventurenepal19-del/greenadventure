"use client";
import React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Mountain, Loader2, Compass, Globe } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";

const defaultDestinations = [
  {
    id: "nepal",
    title: "Nepal",
    subtitle: "The land of the Himalayas, offering the world's most spectacular trekking routes and rich cultural heritage.",
    desc: "Home to eight of the world's ten tallest mountains, Nepal is a trekker's paradise with rich cultural heritage.",
    image: "/images/everest.png",
    heroImage: "",
    tours: 45,
    featured: true,
    order: 1,
  },
  {
    id: "bhutan",
    title: "Bhutan",
    subtitle: "The Last Shangri-La, known for its pristine environment and Gross National Happiness.",
    desc: "A unique kingdom where tradition and natural beauty reign supreme with untouched landscapes.",
    image: "/images/annapurna.png",
    heroImage: "",
    tours: 8,
    featured: true,
    order: 2,
  },
  {
    id: "india",
    title: "India",
    subtitle: "A land of incredible diversity, from the towering Indian Himalayas to vibrant cultures.",
    desc: "The Indian Himalayas offer breathtaking treks, spiritual retreats, and thrilling adventure sports.",
    image: "/images/everest.png",
    heroImage: "",
    tours: 24,
    featured: true,
    order: 3,
  },
];

const DEFAULT_DEST_HERO = {
  title: "Our Destinations",
  subtitle: "Choose your next adventure from our carefully curated destinations across the majestic Himalayas and beyond.",
  bgImage: "/images/hero.png",
  tags: [],
  tabs: [],
};

let destsCache = {
  isLoaded: false,
  destinations: [] as any[],
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>(destsCache.destinations);
  const [loading, setLoading] = useState(!destsCache.isLoaded);
  const [activeBgIndex, setActiveBgIndex] = React.useState(0);
  const [destHero, setDestHero] = useState<any>(DEFAULT_DEST_HERO);

  
  React.useEffect(() => {
    const bgList = ((destHero as any).bgImages && (destHero as any).bgImages.length > 0) ? (destHero as any).bgImages : [destHero.bgImage];
    if (bgList.length > 1) {
      const interval = setInterval(() => {
        setActiveBgIndex(prev => (prev + 1) % bgList.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [(destHero as any).bgImages, destHero.bgImage]);
  
  React.useEffect(() => {
    const unsub2 = onSnapshot(doc(db, "settings", "pages_hero"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data?.destinations) {
          setDestHero((prev: any) => ({
            title: data.destinations.title || prev.title,
            subtitle: data.destinations.subtitle || prev.subtitle,
            bgImage: data.destinations.bgImage || prev.bgImage, bgImages: Array.isArray(data.destinations.bgImages) ? data.destinations.bgImages : prev.bgImages || [],
            tags: Array.isArray(data.destinations.tags) && data.destinations.tags.length > 0 ? data.destinations.tags : prev.tags,
            tabs: Array.isArray(data.destinations.tabs) && data.destinations.tabs.length > 0 ? data.destinations.tabs : prev.tabs,
          }));
        }
      }
    });

    if (destsCache.isLoaded) {
      return () => unsub2();
    }

    const q = query(collection(db, "regions"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const dbRegions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      let newDests = [];
      if (dbRegions.length > 0) {
        // Merge defaults: ensure Nepal/Bhutan/India always exist
        const defaultKeys = ["nepal", "bhutan", "india"];
        const merged = defaultDestinations.map((def) => {
          const dbMatch = dbRegions.find(
            (r: any) => r.title?.toLowerCase() === def.title.toLowerCase()
          );
          return dbMatch ? { ...def, ...dbMatch } : def;
        });
        // Add any extra regions from DB not in defaults
        const extraRegions = dbRegions.filter(
          (r: any) =>
            !defaultKeys.includes(r.title?.toLowerCase?.() || "")
        );
        newDests = [...merged, ...extraRegions];
      } else {
        newDests = defaultDestinations;
      }
      setDestinations(newDests);
      destsCache.destinations = newDests;
      destsCache.isLoaded = true;
      setLoading(false);
    });
    return () => { unsub(); unsub2(); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

    const bgList = ((destHero as any).bgImages && (destHero as any).bgImages.length > 0) ? (destHero as any).bgImages : [destHero.bgImage];
  const activeBgUrl = bgList[activeBgIndex % bgList.length] || destHero.bgImage;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-brand-500/30 overflow-hidden">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeBgUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={activeBgUrl}
                alt="Hero Background"
                fill
                className="object-cover scale-105"
                priority
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-black/50 to-background" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white flex flex-col items-center">
          {destHero.tags && destHero.tags.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-8"
            >
              {destHero.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl"
            >
              <Globe className="h-5 w-5 text-brand-400" />
              <span className="text-white font-black uppercase tracking-[0.3em] text-xs">
                Destinations
              </span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl"
          >
            {destHero.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
              {destHero.title.split(" ").slice(-1)[0]}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 font-medium leading-relaxed"
          >
            {destHero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8 flex items-center gap-2 text-white/50 text-sm font-medium"
          >
            <MapPin className="h-4 w-4" />
            <span>Nepal • Bhutan • India</span>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Destination Cards */}
      <section className="py-24 relative z-20 -mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {destinations.map((dest: any, i: number) => (
              <motion.div
                key={dest.id || i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Link
                  href={`/destinations/${(dest.title || "").toLowerCase()}`}
                  className="group block h-full"
                >
                  <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(var(--brand-500),0.25)] hover:border-brand-500/40 transition-all duration-500 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={dest.image || "/images/everest.png"}
                        alt={dest.title || "Destination"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Floating badge */}
                      {dest.tours > 0 && (
                        <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          {dest.tours} Packages
                        </div>
                      )}

                      {/* Country name overlay */}
                      <div className="absolute bottom-5 left-6">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                          {dest.title}
                        </h2>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1">
                      {dest.subtitle && (
                        <p className="text-sm text-brand-500 dark:text-brand-400 font-semibold mb-3 line-clamp-1">
                          {dest.subtitle}
                        </p>
                      )}
                      <p className="text-muted-foreground text-[15px] leading-relaxed mb-6 flex-1 line-clamp-3">
                        {dest.desc || dest.overview || dest.subtitle}
                      </p>

                      <div className="flex items-center justify-between pt-5 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Compass className="h-4 w-4" />
                          <span>Explore Trips</span>
                        </div>
                        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                          View All
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-8 md:p-12 lg:px-16 relative overflow-hidden z-30 rounded-[3rem] mx-4 md:max-w-5xl md:mx-auto mb-12 shadow-2xl bg-card border border-border group">
        <div className="absolute -top-32 -right-12 text-slate-100 dark:text-white/5 rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-1000 ease-out z-0">
          <Mountain className="w-[500px] h-[500px]" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
          >
            <div className="relative z-10 max-w-2xl md:max-w-3xl">
              <h2 className="text-3xl md:text-[3.25rem] xl:text-[3.5rem] font-black tracking-tight mb-4 text-foreground uppercase leading-[1.1]">
                START YOUR <span className="text-brand-600 dark:text-[#22c55e]">HIMALAYAN</span><br className="hidden md:block" /> JOURNEY
              </h2>
              <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                Ready to explore the roof of the world? Our expert team is here to craft your perfect Himalayan experience.
              </p>
            </div>
            <div className="relative z-10 shrink-0 mt-4 w-full sm:w-auto flex justify-center md:justify-end">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 rounded-full bg-[#22c55e] hover:bg-[#1fae53] text-white font-black tracking-wide uppercase text-xs md:text-sm group/btn hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-lg shadow-emerald-500/20"
              >
                Contact Us <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
