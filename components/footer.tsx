"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, Compass, Tent, ArrowUpRight } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function Footer() {
  const [settings, setSettings] = useState({
    locationLine1: "Thamel, Kathmandu",
    locationLine2: "Bagmati Province, Nepal",
    phonePrimary: "+977 1 4412345",
    emailPrimary: "info@greenadventure.com"
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "contact_info"));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    }
    fetchSettings();
  }, []);
  return (
    <footer className="relative bg-[#050c05] dark:bg-[#050c05] text-slate-100 pt-24 pb-8 overflow-hidden mt-16 rounded-t-[2.5rem]">
      {/* Background Image - Dimmed */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-screen dark:mix-blend-lighten transition-all duration-500">
        <Image 
          src="/images/footer-bg-green.png" 
          alt="Green Mountain Background" 
          fill 
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c05] via-[#050c05]/60 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
          {/* Brand & Get In Touch */}
          <div className="lg:col-span-5 space-y-8 lg:pr-8">
            <div>
              <h3 className="font-black tracking-widest uppercase text-xs mb-4 text-brand-500">
                Get in Touch
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Ready to embark on the adventure of a lifetime?
              </h2>
              <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm drop-shadow-sm mb-6">
                Experience the breathtaking landscapes and vibrant cultures of the Himalayas. We craft sustainable and unforgettable mountain expeditions tailored for the true explorer.
              </p>
              
              <div className="flex items-center gap-4">
                {/* Social icons styled for dark mode */}
                <a href="#" className="p-3.5 rounded-2xl bg-white/5 hover:bg-brand-600 text-slate-300 hover:text-white transition-all border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:-translate-y-1">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="p-3.5 rounded-2xl bg-white/5 hover:bg-brand-600 text-slate-300 hover:text-white transition-all border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:-translate-y-1">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="p-3.5 rounded-2xl bg-white/5 hover:bg-brand-600 text-slate-300 hover:text-white transition-all border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:-translate-y-1">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="p-3.5 rounded-2xl bg-white/5 hover:bg-brand-600 text-slate-300 hover:text-white transition-all border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:-translate-y-1">
                  <span className="sr-only">YouTube</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h3 className="font-bold tracking-wide uppercase text-sm mb-6 text-white flex items-center gap-2">
              <Tent className="w-4 h-4 text-brand-500" /> Explore
            </h3>
            <ul className="space-y-4">
              {[
                { name: "About Us", href: "/about" },
                { name: "Destinations", href: "/destinations" },
                { name: "Trekking Packages", href: "/trips" },
                { name: "Travel Blog", href: "/blog" },
                { name: "Contact Us", href: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block font-medium text-sm transition-all">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="font-bold tracking-wide uppercase text-sm mb-6 text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-500" /> Support
            </h3>
            <ul className="space-y-4">
              {[
                { name: "FAQs", href: "/faqs" },
                { name: "Booking Terms", href: "/booking-terms" },
                { name: "Cancellation Policy", href: "/cancellation-policy" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Visa Info", href: "/visa-info" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block font-medium text-sm transition-all">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-bold tracking-wide uppercase text-sm mb-6 text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" /> Contact
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-sm text-slate-400 font-medium group cursor-pointer">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-brand-600 transition-all shrink-0">
                  <MapPin className="h-4 w-4 text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <span className="pt-1.5 leading-relaxed group-hover:text-brand-400 transition-colors">{settings.locationLine1}<br />{settings.locationLine2}</span>
              </li>
              <li className="flex items-center gap-4 text-sm text-slate-400 font-medium group cursor-pointer">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-brand-600 transition-all shrink-0">
                  <Phone className="h-4 w-4 text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-brand-400 transition-colors">{settings.phonePrimary}</span>
              </li>
              <li className="flex items-center gap-4 text-sm text-slate-400 font-medium group cursor-pointer">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-brand-600 transition-all shrink-0">
                  <Mail className="h-4 w-4 text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <span className="group-hover:text-brand-400 transition-colors">{settings.emailPrimary}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Big Text Hover Animation */}
        <div className="w-full flex items-center justify-start overflow-hidden relative z-20 mix-blend-screen pointer-events-auto mt-4 mb-4">
          <TextHoverEffect text="Greenadventure" duration={0.5} />
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Green Adventure Treks & Expeditions. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Affiliation badges */}
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-slate-300 hover:bg-brand-600 hover:text-white transition-all cursor-pointer">TAAN</div>
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-slate-300 hover:bg-brand-600 hover:text-white transition-all cursor-pointer">NMA</div>
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-slate-300 hover:bg-brand-600 hover:text-white transition-all cursor-pointer">NTB</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
