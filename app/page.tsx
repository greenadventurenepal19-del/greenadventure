"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Mountain, ShieldCheck, MapPin, Users, Star, 
  ArrowRight, Search, Calendar, DollarSign, Quote
} from "lucide-react";

export default function HomePage() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const textY = useTransform(scrollY, [0, 1000], [0, 100]);
  const fgY = useTransform(scrollY, [0, 1000], [0, -50]);

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const heroSlides = [
    {
      title: "NEPAL",
      image: "/images/hero.png",
      fgImage: "/images/hero_fg.png",
      subtitle: "Discover the breathtaking landscapes, vibrant culture, and ancient heritage of the Himalayas. The perfect start to your unforgettable journey."
    },
    {
      title: "ANNAPURNA",
      image: "/images/annapurna.png",
      fgImage: "/images/annapurna_fg.png",
      subtitle: "Trek through lush valleys and traditional mountain villages to the heart of the majestic Annapurna sanctuary."
    },
    {
      title: "EVEREST",
      image: "/images/everest.png",
      fgImage: "/images/everest_fg.png",
      subtitle: "Challenge yourself on the legendary trail to the base camp of the world's highest peak, surrounded by awe-inspiring glaciers."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Advanced 3D Layered Parallax) */}
      <section className="relative h-[100svh] min-h-[700px] overflow-hidden flex flex-col justify-end pb-24 md:pb-32">
        
        {/* Layer 1: Background Image */}
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
              <Image
                src={heroSlides[currentSlide].image}
                alt="Hero background"
                fill
                className="object-cover"
                priority={currentSlide === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Layer 2: Massive Typography (Sandwiched) */}
        <motion.div 
          style={{ y: textY }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden pb-20"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-[22vw] md:text-[18vw] lg:text-[14rem] font-black text-white leading-none tracking-tighter uppercase select-none opacity-95"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* Layer 3: Foreground Subject (The 3D Pop Effect) */}
        <motion.div style={{ y: fgY }} className="absolute -inset-[10%] z-20 pointer-events-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroSlides[currentSlide].fgImage}
                alt="Hero foreground cutout"
                fill
                className="object-cover"
                priority={currentSlide === 0}
              />
              {/* Bottom gradient matching the background layer to blend perfectly */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Content (Bottom Controls & Right Content) - Top Layer */}
        <div className="container relative z-30 px-4 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            
            {/* Left side: Slide Indicators */}
            <div className="flex gap-3 pb-2 w-full md:w-auto justify-center md:justify-start">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide ? "w-12 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Right side: Text and Button */}
            <div className="max-w-md w-full ml-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-start"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Link 
                      href="/trips" 
                      className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                      Discover More
                    </Link>
                    <Link 
                      href="/trips"
                      className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg group"
                    >
                      <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                    </Link>
                  </div>
                  <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 4. QUICK SEARCH (Floating over Hero bottom) */}
      <section className="relative z-30 -mt-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card shadow-2xl rounded-3xl p-4 md:p-8 border border-border/50 backdrop-blur-xl"
          >
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 ml-1">
                  <MapPin className="h-4 w-4 text-brand-500" /> Destination
                </label>
                <select className="w-full p-3.5 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium">
                  <option>Everest Region</option>
                  <option>Annapurna Region</option>
                  <option>Langtang Region</option>
                  <option>Tibet</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 ml-1">
                  <Calendar className="h-4 w-4 text-brand-500" /> Duration
                </label>
                <select className="w-full p-3.5 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium">
                  <option>1 - 7 Days</option>
                  <option>8 - 14 Days</option>
                  <option>15+ Days</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 ml-1">
                  <DollarSign className="h-4 w-4 text-brand-500" /> Price Range
                </label>
                <select className="w-full p-3.5 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium">
                  <option>Under $1000</option>
                  <option>$1000 - $2000</option>
                  <option>Over $2000</option>
                </select>
              </div>
              <button 
                type="button"
                className="w-full p-3.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-brand-500/20"
              >
                <Search className="h-5 w-5" /> Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. HIGHLIGHTS (Trust Section) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide the best experiences for your Himalayan adventures with safety and reliability as our top priorities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Safety & Trust", desc: "Expert licensed guides and prioritizing your safety above all else." },
              { icon: DollarSign, title: "Affordable Pricing", desc: "Best value packages without hidden costs or compromises." },
              { icon: Mountain, title: "Adventure Experiences", desc: "Curated itineraries to deliver breathtaking memories." },
              { icon: Users, title: "Custom Trips", desc: "Tailor-made holidays designed specifically for your group." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-muted/50 border border-border hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-brand-500 transition-all shadow-sm">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED TOURS */}
      <section id="featured" className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Tours</h2>
              <p className="text-muted-foreground max-w-2xl">Discover our most popular trekking and tour packages highly rated by our travelers.</p>
            </div>
            <Link href="/trips" className="flex items-center gap-2 text-brand-600 dark:text-brand-500 font-semibold hover:gap-3 transition-all">
              View All Trips <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                title: "Everest Base Camp Trek", 
                image: "/images/everest.png", 
                price: "$1,399", 
                duration: "14 Days", 
                difficulty: "Hard",
                slug: "everest-base-camp-trek"
              },
              { 
                title: "Annapurna Base Camp Trek", 
                image: "/images/annapurna.png", 
                price: "$1,150", 
                duration: "12 Days", 
                difficulty: "Moderate",
                slug: "annapurna-base-camp-trek"
              }
            ].map((tour, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative rounded-3xl overflow-hidden bg-card border border-border shadow-lg"
              >
                <Link href={`/trips/${tour.slug}`} className="block">
                  <div className="relative h-72 md:h-80 w-full overflow-hidden">
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.9
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold group-hover:text-brand-500 transition-colors">{tour.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                      <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg"><Calendar className="h-4 w-4"/> {tour.duration}</div>
                      <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg"><Mountain className="h-4 w-4"/> {tour.difficulty}</div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">From <span className="text-2xl font-bold text-foreground block">{tour.price}</span></div>
                      <button className="h-12 w-12 rounded-full bg-brand-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS PREVIEW */}
      <section className="py-24 bg-background overflow-hidden relative">
        <div className="absolute top-0 -left-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 -right-64 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
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
                className="bg-card p-8 rounded-3xl border border-border shadow-sm relative"
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-600 dark:bg-brand-900" />
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for the adventure of a lifetime?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-brand-50">
              Book your Himalayan trek today and let us take care of all the details.
            </p>
            <Link 
              href="/contact" 
              className="inline-block px-10 py-5 rounded-full bg-white text-brand-600 font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Plan Your Trip Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
