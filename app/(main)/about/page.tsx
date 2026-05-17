"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Mountain, Users, Award, Leaf, Star, Globe } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

const DEFAULT_ABOUT = {
  heroImage: "/images/annapurna.png",
  heroTitle: "About Green Adventure",
  heroSubtitle: "We are passionate about sharing the breathtaking beauty of the Himalayas while promoting responsible and sustainable tourism.",
  storyTitle: "Our Story",
  storyText1: "Founded in 2010 by a group of passionate local guides, Green Adventure started with a simple mission: to provide authentic, safe, and unforgettable Himalayan experiences while giving back to the local communities.",
  storyText2: "Over the years, we have grown from a small team organizing local hikes to one of Nepal's most trusted adventure travel companies. We pride ourselves on our deep local knowledge, exceptional safety standards, and commitment to sustainable tourism.",
  storyImage: "/images/annapurna.png",
  features: [
    "Licensed by Government of Nepal",
    "Members of TAAN & NMA",
    "100% Local Expert Guides",
    "Committed to Eco-Tourism",
  ],
};

const STATS = [
  { value: "15+", label: "Years of Experience" },
  { value: "10k+", label: "Happy Travelers" },
  { value: "200+", label: "Expeditions Completed" },
  { value: "98%", label: "Client Satisfaction" },
];

const VALUES = [
  { icon: Mountain, title: "Adventure First", desc: "We craft experiences that push boundaries and create lasting memories in the world's most stunning landscapes." },
  { icon: Leaf, title: "Eco-Conscious", desc: "Every trip we run leaves a minimal footprint. We actively support reforestation, waste reduction, and community initiatives." },
  { icon: Users, title: "Local Community", desc: "We hire, train, and invest in local guides, porters, and artisans — ensuring the economic benefits stay where they belong." },
  { icon: Award, title: "Safety Standards", desc: "From first aid trained guides to regular gear checks, safety is never an afterthought — it's built into every itinerary." },
];

export default function AboutPage() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [featuredReview, setFeaturedReview] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "about_page"), async (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setAbout((prev) => ({
          ...prev,
          ...data,
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features,
        }));
        // Load featured testimonial by ID
        if (data.featuredTestimonialId) {
          const reviewSnap = await getDoc(doc(db, "reviews", data.featuredTestimonialId));
          if (reviewSnap.exists()) setFeaturedReview({ id: reviewSnap.id, ...reviewSnap.data() });
          else setFeaturedReview(null);
        } else {
          setFeaturedReview(null);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-brand-500/30 overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={about.heroImage || "/images/annapurna.png"}
            alt={about.heroTitle}
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl"
          >
            <Globe className="h-5 w-5 text-brand-400" />
            <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Our Story</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl"
          >
            {about.heroTitle.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
              {about.heroTitle.split(" ").slice(-1)[0]}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 font-medium leading-relaxed"
          >
            {about.heroSubtitle}
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="relative z-20 -mt-10 py-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 text-center hover:border-brand-500/40 transition-all hover:shadow-lg hover:shadow-brand-500/10"
              >
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50">
              <Image
                src={about.storyImage || "/images/annapurna.png"}
                alt="Our Story"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(featuredReview?.rating || 5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-white/90 text-sm font-medium leading-relaxed">
                    &ldquo;{featuredReview?.message || "Green Adventure made our Himalayan dream a reality. Best travel company we've ever worked with!"}&rdquo;
                  </p>
                  <p className="text-[#4ade80] text-xs font-bold mt-2 uppercase tracking-wider">
                    — {featuredReview?.name || "Verified Traveler"}
                  </p>
                </div>
              </div>
            </div>
            {/* Floating accent */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <span className="text-brand-500 dark:text-brand-400 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Since 2010</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                {about.storyTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>{about.storyText1}</p>
                {about.storyText2 && <p>{about.storyText2}</p>}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {(about.features || DEFAULT_ABOUT.features).map((item: string) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl hover:border-brand-500/30 hover:bg-card/80 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  </div>
                  <span className="font-semibold text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values Grid ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-500 dark:text-brand-400 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">What We Stand For</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Values</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 group-hover:border-brand-500/40 transition-all">
                  <val.icon className="w-7 h-7 text-brand-500 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{val.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden mx-4 md:mx-12 rounded-[4rem] mb-16 shadow-[0_30px_100px_-20px_rgba(var(--brand-500),0.4)]">
        <div className="absolute inset-0 bg-brand-600 dark:bg-brand-900 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-400/40 via-transparent to-transparent opacity-60 mix-blend-overlay"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Mountain className="w-16 h-16 mb-6 mx-auto text-brand-200 opacity-80" />
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter drop-shadow-2xl">
              START YOUR<br />
              <span className="text-brand-200">HIMALAYAN</span> JOURNEY
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto text-brand-50 font-medium leading-relaxed drop-shadow-lg">
              Ready to explore the roof of the world? Our expert team is here to craft your perfect Himalayan experience.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-white text-brand-700 font-black tracking-widest uppercase text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-white/20 group"
            >
              Contact Us
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
