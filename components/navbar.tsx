"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ChevronDown, MapPin, Compass } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ThemeToggle } from "./theme-toggle";

type DropdownItem = { name: string; href: string; desc: string };
type NavLink = {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
};

const STATIC_DESTINATIONS: DropdownItem[] = [
  { name: "Nepal", href: "/destinations/nepal", desc: "The land of the Himalayas" },
  { name: "Bhutan", href: "/destinations/bhutan", desc: "The Last Shangri-La" },
  { name: "India", href: "/destinations/india", desc: "Incredible diversity" },
];

const FALLBACK_TOURS: DropdownItem[] = [
  { name: "Kathmandu Valley Tour", href: "/tours/kathmandu-valley-tour", desc: "4 Days • Cultural & Historical" },
  { name: "Pokhara Adventure Escape", href: "/tours/pokhara-adventure-escape", desc: "4 Days • Scenic & Relaxing" },
  { name: "Chitwan Jungle Safari", href: "/tours/chitwan-jungle-safari", desc: "3 Days • Wildlife & Nature" },
];

const FALLBACK_TREKS: DropdownItem[] = [
  { name: "Everest Base Camp", href: "/trekking/everest-base-camp-trek", desc: "14 Days • Hard Trekking" },
  { name: "Annapurna Base Camp", href: "/trekking/annapurna-base-camp-trek", desc: "12 Days • Moderate Trekking" },
  { name: "Langtang Valley", href: "/trekking/langtang-valley-trek", desc: "8 Days • Scenic & Cultural" },
];

const buildDesc = (trip: any) => {
  const parts: string[] = [];
  if (trip.duration) parts.push(String(trip.duration));
  if (trip.difficulty) parts.push(String(trip.difficulty));
  return parts.join(" • ") || "View details";
};

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [tourItems, setTourItems] = React.useState<DropdownItem[]>(FALLBACK_TOURS);
  const [trekItems, setTrekItems] = React.useState<DropdownItem[]>(FALLBACK_TREKS);

  const pathname = usePathname();
  const { scrollY } = useScroll();

  React.useEffect(() => {
    let cancelled = false;
    async function loadDropdowns() {
      try {
        const tourQuery = query(
          collection(db, "trips"),
          where("tripType", "in", ["Tour", "Tours"]),
        );
        const trekQuery = query(
          collection(db, "trips"),
          where("tripType", "==", "Trekking"),
        );
        const [tourSnap, trekSnap] = await Promise.all([getDocs(tourQuery), getDocs(trekQuery)]);
        if (cancelled) return;

        const tourTrips = tourSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        const trekTrips = trekSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

        const featuredTours = tourTrips.filter((t: any) => t.isFeatured);
        const featuredTreks = trekTrips.filter((t: any) => t.isFeatured);
        const tourPick = (featuredTours.length > 0 ? featuredTours : tourTrips).slice(0, 3);
        const trekPick = (featuredTreks.length > 0 ? featuredTreks : trekTrips).slice(0, 3);

        if (tourPick.length > 0) {
          setTourItems(
            tourPick.map((t: any) => ({
              name: t.title || "Untitled Tour",
              href: `/tours/${t.slug || t.id}`,
              desc: buildDesc(t),
            })),
          );
        }
        if (trekPick.length > 0) {
          setTrekItems(
            trekPick.map((t: any) => ({
              name: t.title || "Untitled Trek",
              href: `/trekking/${t.slug || t.id}`,
              desc: buildDesc(t),
            })),
          );
        }
      } catch (err) {
        console.error("Error loading navbar dropdown data:", err);
      }
    }
    loadDropdowns();
    return () => {
      cancelled = true;
    };
  }, []);

  const navLinks: NavLink[] = React.useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Destinations", href: "/destinations", dropdown: STATIC_DESTINATIONS },
      { name: "Tours", href: "/tours", dropdown: tourItems },
      { name: "Trekking", href: "/trekking", dropdown: trekItems },
      { name: "Travel Blogs", href: "/blog" },
    ],
    [tourItems, trekItems],
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest < 50) {
      setHidden(false);
      setIsScrolled(false);
    } else {
      setIsScrolled(true);
      if (latest > previous && latest > 150) {
        setHidden(true);
        setActiveDropdown(null);
      } else {
        setHidden(false);
      }
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Define routes that have a dark hero image at the top
  const hasHeroImage = pathname === "/";

  const isTransparent = !isScrolled && !isOpen && hasHeroImage;

  return (
    <motion.header 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ 
        duration: hidden ? 0.4 : 0.2,
        delay: hidden ? 0.3 : 0,
        ease: "easeInOut" 
      }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 pointer-events-none ${
        isScrolled ? "pt-4" : "pt-6"
      }`}
    >
      <div 
        className={`pointer-events-auto flex items-center justify-between transition-all duration-500 w-full ${
          isTransparent
            ? "max-w-7xl bg-transparent border-transparent pl-0 pr-2"
            : "max-w-5xl bg-background/90 dark:bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-full px-3 py-1.5 md:py-2"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className={`relative h-11 w-11 md:h-12 md:w-12 rounded-full overflow-hidden ring-2 transition-all shrink-0 ${
              isTransparent
                ? "ring-white/40 group-hover:ring-white/70 shadow-lg shadow-black/20"
                : "ring-brand-500/30 dark:ring-brand-500/40 group-hover:ring-brand-500/60 shadow-md"
            }`}>
              <Image
                src="/images/logo.png"
                alt="Green Adventure Nepal logo"
                fill
                sizes="48px"
                className="object-cover scale-[1.35]"
                priority
              />
            </div>
            <span className={`text-lg md:text-xl font-bold tracking-tight transition-colors ${
              isTransparent ? "text-white drop-shadow-md" : "text-foreground"
            }`}>
              Green<span className={isTransparent ? "text-brand-300 drop-shadow-sm" : "text-brand-600 dark:text-brand-500"}>Adventure</span>
            </span>
          </Link>

        <nav className="hidden md:flex items-center justify-end gap-2 ml-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.dropdown && pathname.startsWith(link.href));
            const hasDropdown = !!link.dropdown;
            
            return (
              <div 
                key={link.name} 
                className="relative group px-1"
                onMouseEnter={() => hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
                    isTransparent 
                      ? isActive ? "text-white drop-shadow-md" : "text-white/90 hover:text-white drop-shadow-md"
                      : isActive ? "text-brand-600 dark:text-brand-500" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`absolute inset-0 rounded-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 -z-10 ${
                    isTransparent ? "bg-white/10 backdrop-blur-md" : "bg-brand-500/10 dark:bg-brand-500/20"
                  }`} />
                  
                  {link.name}
                  {hasDropdown && <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />}
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                        isTransparent ? "bg-brand-400" : "bg-brand-600 dark:bg-brand-500"
                      }`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>

                {hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[320px]"
                      >
                        <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 overflow-hidden flex flex-col gap-1">
                          {link.dropdown?.map((item) => (
                            <Link 
                              key={item.name} 
                              href={item.href}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors group/item"
                            >
                              <div className="mt-0.5 p-1.5 rounded-md bg-background border border-border shadow-sm group-hover/item:text-brand-500 transition-colors">
                                {link.name === "Destinations" ? <MapPin className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground group-hover/item:text-brand-600 dark:group-hover/item:text-brand-500 transition-colors">{item.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                              </div>
                            </Link>
                          ))}
                          <div className="p-3 border-t border-border/50 mt-1">
                            <Link href={link.href} className="text-xs font-bold text-brand-600 dark:text-brand-500 hover:underline flex items-center gap-1 justify-center">
                              View all {link.name} &rarr;
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-4 pl-4 ml-2 border-l border-border/50">
            <div>
              <ThemeToggle />
            </div>
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <div>
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 transition-colors text-foreground"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-in Sidebar */}
      <motion.div
        key="mobile-sidebar"
        initial={false}
        animate={isOpen ? { x: 0 } : { x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-[85vw] max-w-[320px] z-[60] md:hidden pointer-events-auto flex flex-col bg-background border-r border-border shadow-2xl"
      >
        {/* Sidebar Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-brand-500/30 shadow-md">
              <Image src="/images/logo.png" alt="Green Adventure Nepal" fill sizes="36px" className="object-cover scale-[1.35]" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Green<span className="text-brand-600 dark:text-brand-500">Adventure</span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.dropdown && pathname.startsWith(link.href));
            const hasDropdown = !!link.dropdown;
            const isDropdownOpen = activeDropdown === link.name;

            return (
              <div key={link.name} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Link
                    href={link.href}
                    onClick={() => { if (!hasDropdown) setIsOpen(false); }}
                    className={`flex-1 py-3 px-4 rounded-2xl text-base font-bold transition-colors ${
                      isActive
                        ? "bg-brand-500/10 text-brand-600 dark:text-brand-500"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {hasDropdown && (
                    <button
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : link.name)}
                      className="p-3 rounded-xl ml-2 bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {hasDropdown && isDropdownOpen && (
                  <div className="flex flex-col gap-1 pl-3 pr-2 py-2 border-l-2 border-brand-500/20 ml-4 mt-1">
                    {link.dropdown?.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 px-3 rounded-xl text-foreground/70 hover:text-brand-600 hover:bg-brand-500/5 transition-colors font-medium text-sm flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-foreground/90">{item.name}</span>
                        {item.desc && <span className="text-xs text-muted-foreground">{item.desc}</span>}
                      </Link>
                    ))}
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="mt-1 py-2 px-3 rounded-xl text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider hover:bg-brand-500/5 transition-colors"
                    >
                      View all {link.name} →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer CTA */}
        <div className="p-4 border-t border-border/60">
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block p-4 text-center rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 text-sm tracking-wide"
          >
            Book Now
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
}
