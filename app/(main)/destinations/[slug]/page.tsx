"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Mountain,
  MapPin,
  ArrowRight,
  Leaf,
  Heart,
  Compass,
  Camera,
  Sun,
  Info,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import Lottie from "lottie-react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import TripCard, { type TripCardData } from "@/components/TripCard";

// Helper component for Lottie animations from public URLs.
// Defensive: many LottieFiles CDN URLs go stale and return an XML error page.
// We check the content-type and parse text safely so a bad response never throws.
function DynamicLottie({ url, className }: { url: string; className?: string }) {
  const [animationData, setAnimationData] = React.useState<object | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type") || "";
        const body = await res.text();
        // Reject anything that isn't JSON (e.g. XML error pages from S3/CloudFront).
        if (!contentType.includes("json") && !body.trim().startsWith("{")) {
          throw new Error("Non-JSON response");
        }
        const data = JSON.parse(body);
        if (!cancelled) setAnimationData(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed || !animationData)
    return (
      <div
        className={`animate-pulse bg-brand-500/10 rounded-full flex items-center justify-center ${className}`}
      >
        <div className="w-1/2 h-1/2 bg-brand-500/20 rounded-full" />
      </div>
    );

  return <Lottie animationData={animationData} loop={true} className={className} />;
}

type DestinationFallback = {
  name: string;
  image: string;
  subtitle: string;
  overview: string;
  highlights: { icon: LucideIcon; title: string; desc: string; size: "large" | "medium" | "small" }[];
};

// Fallback metadata only (no fake trips — those come from Firestore based on admin selection)
const destinationData: Record<string, DestinationFallback> = {
  nepal: {
    name: "Nepal",
    image: "/images/everest.png",
    subtitle:
      "The land of the Himalayas, offering the world's most spectacular trekking routes and rich cultural heritage.",
    overview:
      "Nestled in the lap of the Himalayas, Nepal is a trekker's paradise. Home to eight of the world's ten tallest mountains, including Mount Everest, it offers unparalleled landscapes, diverse wildlife, and a deeply rooted spiritual culture. From the bustling streets of Kathmandu to the serene lakes of Pokhara, Nepal promises an adventure that touches the soul.",
    highlights: [
      {
        icon: Mountain,
        title: "8 highest peaks",
        desc: "Home to Everest, Annapurna, and more. Witness the majesty of the roof of the world.",
        size: "large",
      },
      { icon: Compass, title: "Rich Culture", desc: "Ancient temples, monasteries, and traditions.", size: "medium" },
      { icon: Camera, title: "Scenic Beauty", desc: "Lush valleys, serene lakes, and high passes.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "Spring (Mar-May) & Autumn (Sep-Nov).", size: "small" },
      { icon: Heart, title: "Warm Hospitality", desc: "Experience the legendary Sherpa culture.", size: "small" },
    ],
  },
  bhutan: {
    name: "Bhutan",
    image: "/images/annapurna.png",
    subtitle: "The Last Shangri-La, known for its pristine environment and Gross National Happiness.",
    overview:
      "Bhutan is a unique kingdom where tradition and natural beauty reign supreme. From the iconic Tiger's Nest Monastery clinging to a cliffside to its serene valleys and rich Buddhist culture, Bhutan offers a peaceful, untouched, and incredibly scenic getaway.",
    highlights: [
      { icon: Heart, title: "Happiness Index", desc: "Focuses on Gross National Happiness.", size: "large" },
      { icon: Compass, title: "Tiger's Nest", desc: "Iconic cliffside monastery.", size: "medium" },
      { icon: Leaf, title: "Carbon Negative", desc: "The world's only carbon-negative country.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "Spring & Autumn.", size: "small" },
    ],
  },
  india: {
    name: "India",
    image: "/images/everest.png",
    subtitle: "A land of incredible diversity, from the towering Indian Himalayas to vibrant cultures.",
    overview:
      "The Indian Himalayas stretch across the northern border, offering breathtaking treks, spiritual retreats, and thrilling adventure sports. Regions like Ladakh, Himachal Pradesh, and Uttarakhand provide majestic landscapes deeply intertwined with vibrant, ancient traditions.",
    highlights: [
      { icon: Mountain, title: "Indian Himalayas", desc: "Ladakh, Himachal, Uttarakhand.", size: "large" },
      { icon: Compass, title: "Spiritual Hubs", desc: "Rishikesh, Dharamshala.", size: "medium" },
      { icon: Camera, title: "Diverse Landscapes", desc: "From green valleys to high-altitude deserts.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "May to September.", size: "small" },
    ],
  },
};

type DestinationData = DestinationFallback & {
  trips: TripCardData[];
};

export default function DestinationDynamicPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug.toLowerCase() : "";
  const [data, setData] = React.useState<DestinationData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const qRegion = query(collection(db, "regions"));
        const regionSnap = await getDocs(qRegion);
        const allRegions = regionSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

        const matchedRegion = allRegions.find(
          (r: any) => r.title?.toLowerCase() === slug,
        ) as any;

        const fallback = destinationData[slug];
        const baseInfo: DestinationFallback = matchedRegion
          ? {
              name: matchedRegion.title,
              image: matchedRegion.heroImage || matchedRegion.image || fallback?.image || "/images/everest.png",
              subtitle: matchedRegion.subtitle || fallback?.subtitle || matchedRegion.desc || "",
              overview: matchedRegion.overview || matchedRegion.desc || fallback?.overview || "",
              highlights: fallback?.highlights || [],
            }
          : fallback || {
              name: slug.replace(/\b\w/g, (l) => l.toUpperCase()),
              image: "/images/everest.png",
              subtitle: "",
              overview: "",
              highlights: [],
            };

        const qTrips = query(collection(db, "trips"));
        const tripsSnap = await getDocs(qTrips);
        const allTrips = tripsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

        const targetName = baseInfo.name.toLowerCase();
        const matchedTrips = allTrips.filter((t: any) => {
          const region = t.region?.toLowerCase?.() || "";
          // Exact match or substring (handles "Annapurna Region, Nepal" → Nepal)
          return region === targetName || region.includes(targetName);
        });

        setData({ ...baseInfo, trips: matchedTrips as TripCardData[] });
      } catch (error) {
        console.error("Error fetching destination data:", error);
        const fb = destinationData[slug];
        if (fb) {
          setData({ ...fb, trips: [] });
        } else {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const { scrollY, scrollYProgress } = useScroll();
  const y1 = useTransform(scrollY, [0, 1500], [0, 600]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -45 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as const },
    }),
  };

  if (loading || !data)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-brand-500/30">
      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 z-[100] origin-left"
      />

      {/* 1. HERO PARALLAX SECTION */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-black/40 to-background" />
        </motion.div>

        <motion.div
          style={{ y: y2, opacity }}
          className="container relative z-10 px-4 text-center text-white mt-20 flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl"
          >
            <MapPin className="h-5 w-5 text-brand-400" />
            <span className="text-white font-black uppercase tracking-[0.3em] text-sm mt-1">
              Destination
            </span>
          </motion.div>

          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black uppercase tracking-tighter leading-none mb-8 drop-shadow-2xl flex flex-wrap justify-center overflow-hidden perspective-[1000px]">
            {data.name.split("").map((char: string, i: number) => (
              <motion.span
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                key={i}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-3xl max-w-4xl mx-auto font-medium text-white/90 drop-shadow-lg leading-relaxed"
          >
            {data.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <DynamicLottie
            url="https://assets9.lottiefiles.com/packages/lf20_t2v9vj7a.json"
            className="w-20 h-20 opacity-80 hover:opacity-100 transition-opacity"
          />
        </motion.div>
      </section>

      {/* 2. OVERVIEW & BENTO BOX HIGHLIGHTS */}
      <section className="py-32 relative z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col xl:flex-row gap-20">
            <div className="xl:w-5/12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black tracking-widest text-xs uppercase mb-8 border border-brand-500/20">
                  <Info className="h-4 w-4" /> About {data.name}
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tight">
                  Discover the magic of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-400 via-brand-600 to-emerald-600 inline-block pb-2">
                    {data.name}
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground leading-[1.8] font-medium mb-12">
                  {data.overview}
                </p>

                <div className="w-48 h-48 -ml-8 opacity-80 pointer-events-none">
                  <DynamicLottie url="https://assets2.lottiefiles.com/packages/lf20_mwc2xcdp.json" />
                </div>
              </motion.div>
            </div>

            <div className="xl:w-7/12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.highlights.map((highlight, idx) => {
                  let colSpanClass = "sm:col-span-1 lg:col-span-1";
                  if (highlight.size === "large") colSpanClass = "sm:col-span-2 lg:col-span-2";

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
                      className={`${colSpanClass} bg-card/60 backdrop-blur-2xl border border-border/50 p-8 rounded-[2.5rem] shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.2)] hover:border-brand-500/40 transition-all duration-500 group flex flex-col relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="h-16 w-16 rounded-[1.5rem] bg-background shadow-inner flex items-center justify-center mb-6 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500 text-brand-600 dark:text-brand-400 relative z-10 group-hover:scale-110 group-hover:rotate-6">
                        <highlight.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black mb-3 tracking-tight relative z-10 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-base text-muted-foreground font-medium relative z-10 leading-relaxed">
                        {highlight.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED TRIPS — uses shared TripCard, filtered by admin selection */}
      <section className="py-32 bg-muted/20 border-y border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-3xl">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-black tracking-tight mb-6 uppercase leading-none"
              >
                Featured in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-emerald-600">
                  {data.name}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed"
              >
                Tours and treks our team has handpicked for {data.name}. Hand-crafted for the
                ultimate explorer.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/tours"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-background border-2 border-brand-500/30 text-foreground font-black tracking-widest text-xs uppercase hover:bg-brand-500 hover:border-brand-500 hover:text-white transition-all duration-300 group shadow-xl hover:shadow-brand-500/25 shrink-0"
              >
                View All Tours
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>

          {data.trips.length === 0 ? (
            <div className="text-center py-20 bg-brand-500/5 rounded-3xl border border-brand-500/10 max-w-3xl mx-auto">
              <Mountain className="w-16 h-16 text-brand-500/40 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground/70">
                No trips listed in {data.name} yet
              </h3>
              <p className="text-muted-foreground mt-2">
                Our team is curating new experiences here. Check back soon, or browse all tours and
                treks below.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <Link
                  href="/tours"
                  className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-colors shadow-lg"
                >
                  Browse Tours
                </Link>
                <Link
                  href="/trekking"
                  className="px-6 py-3 rounded-full bg-background border border-brand-500/30 text-foreground font-bold text-sm hover:bg-brand-500/10 transition-colors"
                >
                  Browse Trekking
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.trips.slice(0, 6).map((tour, i) => {
                const tripType = (tour as TripCardData & { tripType?: string }).tripType;
                const isTrek = tripType === "Trekking";
                return (
                  <TripCard
                    key={tour.id || tour.slug || i}
                    trip={tour}
                    index={i}
                    basePath={isTrek ? "trekking" : "tours"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. CALL TO ACTION (WITH ANIMATED BG) */}
      <section className="py-32 relative overflow-hidden my-16 mx-4 md:mx-12 rounded-[4rem] shadow-[0_30px_100px_-20px_rgba(var(--brand-500),0.4)]">
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

        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-repeat opacity-5" />

        <div className="container mx-auto px-4 relative z-20 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter drop-shadow-2xl">
              START YOUR <br />
              <span className="text-brand-200">{data.name}</span> ADVENTURE
            </h2>
            <p className="text-2xl mb-12 max-w-3xl mx-auto text-brand-50 font-medium leading-relaxed drop-shadow-lg">
              Get in touch with our experts to plan your perfect itinerary. Make memories that will
              last a lifetime.
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
