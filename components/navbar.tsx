"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Mountain, ChevronDown, MapPin, Compass } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { name: "Home", href: "/" },
  { 
    name: "Destinations", 
    href: "/destinations",
    dropdown: [
      { name: "Nepal", href: "/destinations/nepal", desc: "The land of the Himalayas" },
      { name: "Tibet", href: "/destinations/tibet", desc: "The Roof of the World" },
      { name: "Bhutan", href: "/destinations/bhutan", desc: "The Last Shangri-La" },
      { name: "India", href: "/destinations/india", desc: "Incredible diversity" },
    ]
  },
  { 
    name: "Trips", 
    href: "/trips",
    dropdown: [
      { name: "Everest Base Camp", href: "/trips/everest-base-camp-trek", desc: "14 Days • Hard Trekking" },
      { name: "Annapurna Base Camp", href: "/trips/annapurna-base-camp-trek", desc: "12 Days • Moderate Trekking" },
      { name: "Langtang Valley", href: "/trips/langtang-valley-trek", desc: "8 Days • Scenic & Cultural" },
    ]
  },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  
  const pathname = usePathname();
  const { scrollY } = useScroll();

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

  const isTransparent = !isScrolled && !isOpen;

  return (
    <motion.header 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 pointer-events-none ${
        isScrolled ? "pt-4" : "pt-6"
      }`}
    >
      <div 
        className={`pointer-events-auto flex items-center justify-between transition-all duration-500 w-full ${
          isTransparent
            ? "max-w-7xl bg-transparent border-transparent px-2"
            : "max-w-5xl bg-background/85 dark:bg-background/70 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-full px-6 py-3"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`p-2 rounded-xl transition-colors ${
            isTransparent ? "bg-white/20 text-white group-hover:bg-white/30" : "bg-brand-500/10 text-brand-600 dark:text-brand-500 group-hover:bg-brand-500/20"
          }`}>
            <Mountain className="h-6 w-6" />
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${
            isTransparent ? "text-white" : "text-foreground"
          }`}>
            Green <span className={isTransparent ? "text-brand-300" : "text-brand-600 dark:text-brand-500"}>Adventure</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
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
                      ? isActive ? "text-white" : "text-white/80 hover:text-white"
                      : isActive ? "text-brand-600 dark:text-brand-500" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`absolute inset-0 rounded-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 -z-10 ${
                    isTransparent ? "bg-white/10" : "bg-brand-500/10 dark:bg-brand-500/20"
                  }`} />
                  
                  {link.name}
                  {hasDropdown && <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />}
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                        isTransparent ? "bg-white" : "bg-brand-600 dark:bg-brand-500"
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
          
          <div className={`flex items-center gap-4 pl-4 border-l ml-2 ${
            isTransparent ? "border-white/20" : "border-border/50"
          }`}>
            <div className={isTransparent ? "opacity-90 invert dark:invert-0" : ""}>
              <ThemeToggle />
            </div>
            <Link
              href="/contact"
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                isTransparent 
                  ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  : "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20"
              }`}
            >
              Book Now
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <div className={isTransparent ? "opacity-90 invert dark:invert-0" : ""}>
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 transition-colors ${
              isTransparent ? "text-white" : "text-foreground"
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-4 right-4 bg-background border border-border shadow-2xl rounded-3xl md:hidden flex flex-col p-4 gap-2 pointer-events-auto z-40 overflow-hidden origin-top max-h-[80vh] overflow-y-auto"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.dropdown && pathname.startsWith(link.href));
              const hasDropdown = !!link.dropdown;
              const isDropdownOpen = activeDropdown === link.name;
              
              return (
                <div key={link.name} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className={`flex-1 p-4 rounded-2xl text-lg font-bold transition-colors ${
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
                        className="p-4 rounded-xl ml-2 bg-muted/50 text-muted-foreground"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  
                  {hasDropdown && isDropdownOpen && (
                    <div className="flex flex-col gap-2 pl-4 pr-2 py-2 border-l-2 border-brand-500/20 ml-6 mt-1">
                      {link.dropdown?.map(item => (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          className="p-3 rounded-xl text-muted-foreground hover:text-brand-600 hover:bg-brand-500/5 transition-colors font-medium flex items-center justify-between"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              href="/contact"
              className="mt-4 p-4 text-center rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
            >
              Start Project
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
