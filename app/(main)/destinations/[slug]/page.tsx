"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { 
  Mountain, MapPin, Calendar, Users, 
  ArrowRight, Cloud, Leaf, Heart,
  Compass, Camera, Sun, Info
} from "lucide-react";
import Lottie from "lottie-react";

// Helper component for Lottie animations from public URLs
function DynamicLottie({ url, className }: { url: string, className?: string }) {
  const [animationData, setAnimationData] = React.useState<any>(null);
  
  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error fetching lottie", err));
  }, [url]);

  if (!animationData) return (
    <div className={`animate-pulse bg-brand-500/10 rounded-full flex items-center justify-center ${className}`}>
      <div className="w-1/2 h-1/2 bg-brand-500/20 rounded-full" />
    </div>
  );
  
  return <Lottie animationData={animationData} loop={true} className={className} />;
}

// Interactive 3D Trip Card Component
function TripCard({ tour, index }: { tour: any, index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
      style={{ perspective: 1200 }}
      className="h-full"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_30px_60px_-15px_rgba(var(--brand-500),0.2)] transition-shadow duration-500 flex flex-col transform-gpu"
      >
        {/* Image Section */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden">
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20">
            {tour.difficulty}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 relative z-10 -mt-6 bg-gradient-to-b from-transparent to-card/95">
          <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-brand-600 transition-all duration-300 line-clamp-1">
            {tour.title}
          </h3>
          
          <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">
            {tour.desc}
          </p>
          
          {/* Details List */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 bg-background/50 p-2.5 rounded-xl">
              <MapPin className="h-4 w-4 text-brand-500 shrink-0" /> <span className="truncate">{tour.region}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 bg-background/50 p-2.5 rounded-xl">
              <Calendar className="h-4 w-4 text-brand-500 shrink-0" /> {tour.duration}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 bg-background/50 p-2.5 rounded-xl col-span-2">
              <Users className="h-4 w-4 text-brand-500 shrink-0" /> {tour.groupSize}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-5 mt-auto flex items-end justify-between border-t border-border/30">
            <div>
              <span className="text-[9px] font-black text-brand-500 uppercase tracking-[0.2em] block mb-1">Starting From</span>
              <span className="text-3xl font-black text-foreground leading-none">{tour.price}</span>
            </div>
            <Link 
              href={`/trips/${tour.slug}`}
              className="px-6 py-3 rounded-full bg-foreground text-background font-black text-xs hover:bg-brand-500 hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl hover:shadow-brand-500/25 flex items-center gap-2"
            >
              Explore <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mock data for destinations
const destinationData: Record<string, any> = {
  nepal: {
    name: "Nepal",
    image: "/images/everest.png",
    subtitle: "The land of the Himalayas, offering the world's most spectacular trekking routes and rich cultural heritage.",
    overview: "Nestled in the lap of the Himalayas, Nepal is a trekker's paradise. Home to eight of the world's ten tallest mountains, including Mount Everest, it offers unparalleled landscapes, diverse wildlife, and a deeply rooted spiritual culture. From the bustling streets of Kathmandu to the serene lakes of Pokhara, Nepal promises an adventure that touches the soul.",
    highlights: [
      { icon: Mountain, title: "8 highest peaks", desc: "Home to Everest, Annapurna, and more. Witness the majesty of the roof of the world.", size: "large" },
      { icon: Compass, title: "Rich Culture", desc: "Ancient temples, monasteries, and traditions.", size: "medium" },
      { icon: Camera, title: "Scenic Beauty", desc: "Lush valleys, serene lakes, and high passes.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "Spring (Mar-May) & Autumn (Sep-Nov).", size: "small" },
      { icon: Heart, title: "Warm Hospitality", desc: "Experience the legendary Sherpa culture.", size: "small" }
    ],
    trips: [
      { 
        title: "Everest Base Camp Trek", 
        image: "/images/everest.png", 
        price: "$1450", 
        duration: "14 days", 
        region: "Everest Region",
        groupSize: "Max 8 people",
        difficulty: "challenging",
        desc: "A journey to the base of the world's highest peak, offering spectacular views and rich Sherpa culture.",
        slug: "everest-base-camp-trek"
      },
      { 
        title: "Annapurna Base Camp", 
        image: "/images/annapurna.png", 
        price: "$1150", 
        duration: "12 days", 
        region: "Annapurna Region",
        groupSize: "Max 10 people",
        difficulty: "moderate",
        desc: "Trek into the heart of the Annapurna Sanctuary with breathtaking 360-degree mountain views.",
        slug: "annapurna-base-camp-trek"
      }
    ]
  },
  tibet: {
    name: "Tibet",
    image: "/images/hero.png",
    subtitle: "The Roof of the World, featuring mystical monasteries and vast plateaus.",
    overview: "Tibet, often referred to as the 'Roof of the World', is a place of profound spirituality and dramatic landscapes. It shares the northern face of Mount Everest and is home to the majestic Potala Palace in Lhasa. A journey to Tibet is as much a cultural awakening as it is a visual feast.",
    highlights: [
      { icon: Mountain, title: "High Altitude", desc: "Average elevation over 4,500 meters.", size: "large" },
      { icon: Compass, title: "Buddhism", desc: "Deeply rooted Tibetan Buddhist culture.", size: "medium" },
      { icon: Camera, title: "Stunning Monasteries", desc: "Potala Palace, Jokhang Temple.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "May to October.", size: "small" }
    ],
    trips: [
      { 
        title: "Lhasa to Everest Base Camp Tour", 
        image: "/images/hero.png", 
        price: "$1850", 
        duration: "8 days", 
        region: "Tibet",
        groupSize: "Max 6 people",
        difficulty: "moderate",
        desc: "An overland journey from the holy city of Lhasa to the North Face of Everest.",
        slug: "lhasa-ebc-tour"
      }
    ]
  },
  bhutan: {
    name: "Bhutan",
    image: "/images/annapurna.png",
    subtitle: "The Last Shangri-La, known for its pristine environment and Gross National Happiness.",
    overview: "Bhutan is a unique kingdom where tradition and natural beauty reign supreme. From the iconic Tiger's Nest Monastery clinging to a cliffside to its serene valleys and rich Buddhist culture, Bhutan offers a peaceful, untouched, and incredibly scenic getaway.",
    highlights: [
      { icon: Heart, title: "Happiness Index", desc: "Focuses on Gross National Happiness.", size: "large" },
      { icon: Compass, title: "Tiger's Nest", desc: "Iconic cliffside monastery.", size: "medium" },
      { icon: Leaf, title: "Carbon Negative", desc: "The world's only carbon-negative country.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "Spring & Autumn.", size: "small" }
    ],
    trips: [
      { 
        title: "Bhutan Cultural Tour", 
        image: "/images/annapurna.png", 
        price: "$2450", 
        duration: "7 days", 
        region: "Paro & Thimphu",
        groupSize: "Max 6 people",
        difficulty: "easy",
        desc: "Experience the highlights of Bhutan including the famous Tiger's Nest monastery.",
        slug: "bhutan-cultural-tour"
      }
    ]
  },
  india: {
    name: "India",
    image: "/images/everest.png",
    subtitle: "A land of incredible diversity, from the towering Indian Himalayas to vibrant cultures.",
    overview: "The Indian Himalayas stretch across the northern border, offering breathtaking treks, spiritual retreats, and thrilling adventure sports. Regions like Ladakh, Himachal Pradesh, and Uttarakhand provide majestic landscapes deeply intertwined with vibrant, ancient traditions.",
    highlights: [
      { icon: Mountain, title: "Indian Himalayas", desc: "Ladakh, Himachal, Uttarakhand.", size: "large" },
      { icon: Compass, title: "Spiritual Hubs", desc: "Rishikesh, Dharamshala.", size: "medium" },
      { icon: Camera, title: "Diverse Landscapes", desc: "From green valleys to high-altitude deserts.", size: "medium" },
      { icon: Sun, title: "Best Time to Visit", desc: "May to September.", size: "small" }
    ],
    trips: [
      { 
        title: "Markha Valley Trek", 
        image: "/images/everest.png", 
        price: "$1250", 
        duration: "9 days", 
        region: "Ladakh",
        groupSize: "Max 8 people",
        difficulty: "moderate",
        desc: "Trek through the stunning high-altitude desert of Ladakh, experiencing local villages and monasteries.",
        slug: "markha-valley-trek"
      }
    ]
  }
};

export default function DestinationDynamicPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug.toLowerCase() : '';
  const data = destinationData[slug] || destinationData['nepal']; 

  const { scrollY, scrollYProgress } = useScroll();
  const y1 = useTransform(scrollY, [0, 1500], [0, 600]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Animation variants
  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -45 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }
    })
  };

  if (!data) return <div>Loading...</div>;

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
            className="object-cover scale-110" // scale up slightly to allow parallax room
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
            <span className="text-white font-black uppercase tracking-[0.3em] text-sm mt-1">Destination</span>
          </motion.div>
          
          {/* Advanced Staggered Text Reveal */}
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black uppercase tracking-tighter leading-none mb-8 drop-shadow-2xl flex flex-wrap justify-center overflow-hidden perspective-[1000px]">
            {data.name.split('').map((char: string, i: number) => (
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

        {/* Animated Scroll Down Indicator (Lottie) */}
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
            {/* Left: Overview */}
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
                  Discover the magic of <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-400 via-brand-600 to-emerald-600 inline-block pb-2">
                    {data.name}
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground leading-[1.8] font-medium mb-12">
                  {data.overview}
                </p>

                {/* Integrating a globe/travel Lottie here to add movement to text area */}
                <div className="w-48 h-48 -ml-8 opacity-80 pointer-events-none">
                   <DynamicLottie url="https://assets2.lottiefiles.com/packages/lf20_mwc2xcdp.json" />
                </div>
              </motion.div>
            </div>

            {/* Right: Bento Box Grid */}
            <div className="xl:w-7/12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.highlights.map((highlight: any, idx: number) => {
                  let colSpanClass = "sm:col-span-1 lg:col-span-1";
                  
                  if (highlight.size === "large") {
                    colSpanClass = "sm:col-span-2 lg:col-span-2";
                  }

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
                      className={`${colSpanClass} bg-card/60 backdrop-blur-2xl border border-border/50 p-8 rounded-[2.5rem] shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(var(--brand-500),0.2)] hover:border-brand-500/40 transition-all duration-500 group flex flex-col relative overflow-hidden`}
                    >
                      {/* Decorative background gradient on hover */}
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
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED TRIPS (WITH 3D HOVER) */}
      <section className="py-32 bg-muted/20 border-y border-border/50 relative overflow-hidden">
        {/* Background decorative elements */}
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
                Featured in <br/>
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
                Explore our handpicked adventures and trekking routes tailored for the best experience. Hand-crafted for the ultimate explorer.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Link 
                href="/trips" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-background border-2 border-brand-500/30 text-foreground font-black tracking-widest text-xs uppercase hover:bg-brand-500 hover:border-brand-500 hover:text-white transition-all duration-300 group shadow-xl hover:shadow-brand-500/25 shrink-0"
              >
                View All Trips 
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.trips.map((tour: any, i: number) => (
              <TripCard key={i} tour={tour} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION (WITH ANIMATED BG) */}
      <section className="py-32 relative overflow-hidden my-16 mx-4 md:mx-12 rounded-[4rem] shadow-[0_30px_100px_-20px_rgba(var(--brand-500),0.4)]">
        {/* Animated Gradient Background */}
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
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')] bg-repeat opacity-5" />
        
        <div className="container mx-auto px-4 relative z-20 text-center text-white flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter drop-shadow-2xl">
              START YOUR <br/><span className="text-brand-200">{data.name}</span> ADVENTURE
            </h2>
            <p className="text-2xl mb-12 max-w-3xl mx-auto text-brand-50 font-medium leading-relaxed drop-shadow-lg">
              Get in touch with our experts to plan your perfect itinerary. Make memories that will last a lifetime.
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
