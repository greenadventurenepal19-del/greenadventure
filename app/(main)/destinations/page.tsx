"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Mountain, Loader2, Compass, Globe } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

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

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "regions"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const dbRegions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
        setDestinations([...merged, ...extraRegions]);
      } else {
        setDestinations(defaultDestinations);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-brand-500/30">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Himalayan Destinations"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-black/50 to-background" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white flex flex-col items-center">
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

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl"
          >
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Destinations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 font-medium leading-relaxed"
          >
            Choose your next adventure from our carefully curated destinations across the majestic Himalayas and beyond.
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
      <section className="py-32 relative overflow-hidden mx-4 md:mx-12 rounded-[4rem] mb-16 shadow-[0_30px_100px_-20px_rgba(var(--brand-500),0.4)]">
        <div className="absolute inset-0 bg-brand-600 dark:bg-brand-900 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-400/40 via-transparent to-transparent opacity-60 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat" />

        <div className="container mx-auto px-4 relative z-20 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Mountain className="w-16 h-16 mb-6 mx-auto text-brand-200 opacity-80" />
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter drop-shadow-2xl">
              PLAN YOUR <br />
              <span className="text-brand-200">HIMALAYAN</span> JOURNEY
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto text-brand-50 font-medium leading-relaxed drop-shadow-lg">
              Get in touch with our experts to plan your perfect itinerary.
              Make memories that will last a lifetime.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-white text-brand-700 font-black tracking-widest uppercase text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-white/20 group"
            >
              Inquire Now
              <span className="bg-brand-100 text-brand-600 p-2 rounded-full group-hover:rotate-45 transition-transform duration-300">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
