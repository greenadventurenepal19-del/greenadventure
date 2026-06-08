"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, Compass, Tent, ArrowUpRight } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FooterSettings {
  tagline: string;
  description: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

const DEFAULT_FOOTER: FooterSettings = {
  tagline: "",
  description: "",
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  tiktok: "",
};

export function Footer() {
  const [contact, setContact] = useState({
    locationLine1: "",
    locationLine2: "",
    phonePrimary: "",
    emailPrimary: "",
  });
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [contactSnap, footerSnap] = await Promise.all([
          getDoc(doc(db, "settings", "contact_info")),
          getDoc(doc(db, "settings", "footer_settings")),
        ]);
        if (contactSnap.exists()) {
          setContact(prev => ({ ...prev, ...contactSnap.data() }));
        }
        if (footerSnap.exists()) {
          setFooter(prev => ({ ...prev, ...footerSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    }
    fetchSettings();
  }, []);

  const taglineTrimmed = footer.tagline ? footer.tagline.trim() : "";
  const showTagline = taglineTrimmed !== "" && taglineTrimmed !== ".";

  const descTrimmed = footer.description ? footer.description.trim() : "";
  const showDesc = descTrimmed !== "" && descTrimmed !== ".";

  const cleanLocation1 = contact.locationLine1 ? contact.locationLine1.trim() : "";
  const cleanLocation2 = contact.locationLine2 ? contact.locationLine2.trim() : "";
  const showLoc1 = cleanLocation1 !== "" && cleanLocation1 !== ".";
  const showLoc2 = cleanLocation2 !== "" && cleanLocation2 !== ".";
  const hasLocation = showLoc1 || showLoc2;
  const hasPhone = !!contact.phonePrimary && contact.phonePrimary.trim() !== "" && contact.phonePrimary.trim() !== ".";
  const hasEmail = !!contact.emailPrimary && contact.emailPrimary.trim() !== "" && contact.emailPrimary.trim() !== ".";
  const hasAnyContact = hasLocation || hasPhone || hasEmail;

  const socialLinks = [
    {
      label: "Facebook",
      href: footer.facebook || "#",
      show: !!footer.facebook && footer.facebook.trim() !== "" && footer.facebook.trim() !== ".",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: footer.twitter || "#",
      show: !!footer.twitter && footer.twitter.trim() !== "" && footer.twitter.trim() !== ".",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: footer.instagram || "#",
      show: !!footer.instagram && footer.instagram.trim() !== "" && footer.instagram.trim() !== ".",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: footer.youtube || "#",
      show: !!footer.youtube && footer.youtube.trim() !== "" && footer.youtube.trim() !== ".",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: footer.tiktok || "#",
      show: !!footer.tiktok && footer.tiktok.trim() !== "" && footer.tiktok.trim() !== ".",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
        </svg>
      ),
    },
  ].filter(s => s.show);

  return (
    <footer className="footer-container relative pt-16 pb-6 overflow-hidden mt-16 rounded-t-[2.5rem] border-t">
      <style>{`
        .footer-container {
          --f-bg: #fafafa;
          --f-text: #0f172a;
          --f-heading: #042f1a;
          --f-muted: #2f3f35; /* forest green-tinted charcoal for beautiful high-contrast text */
          --f-border: rgba(0, 0, 0, 0.08);
          --f-card-bg: rgba(255, 255, 255, 0.75);
          --f-card-hover: #16a34a; /* brand-600 */
          --f-icon: #16a34a;
          --f-icon-hover: #ffffff;
          --f-grad-bottom: rgba(250, 250, 250, 0.3);
          --f-grad-mid: rgba(250, 250, 250, 0.1);
          --f-grad-top: rgba(250, 250, 250, 0.0);
          --f-image-op: 0.85;
          --f-blend: normal;
          --f-stroke: rgba(0, 0, 0, 0.32);
          --f-tri-color: #0284c7; /* sky-600 */
          --f-techies-color: #0f172a; /* slate-900 (black) */
          --f-arrow-color: #64748b; /* slate-500 */
          background-color: var(--f-bg);
          color: var(--f-text);
          border-color: var(--f-border);
        }
        .dark .footer-container {
          --f-bg: #050c05;
          --f-text: #f1f5f9;
          --f-heading: #ffffff;
          --f-muted: #94a3b8;
          --f-border: rgba(255, 255, 255, 0.05);
          --f-card-bg: rgba(255, 255, 255, 0.05);
          --f-card-hover: #16a34a;
          --f-icon: #22c55e; /* brand-500 */
          --f-icon-hover: #ffffff;
          --f-grad-bottom: rgba(5, 12, 5, 0.95);
          --f-grad-mid: rgba(5, 12, 5, 0.5);
          --f-grad-top: rgba(5, 12, 5, 0.1);
          --f-image-op: 0.7;
          --f-blend: lighten;
          --f-stroke: rgba(255, 255, 255, 0.35);
          --f-tri-color: #38bdf8; /* sky-400 */
          --f-techies-color: #fafafa; /* slate-50 (white) */
          --f-arrow-color: #94a3b8; /* slate-400 */
        }

        .tritechies-btn {
          background-color: transparent !important;
          border-color: var(--f-border) !important;
          transition: all 0.3s ease !important;
        }
        .tritechies-btn:hover {
          border-color: var(--f-card-hover) !important;
          transform: scale(1.03) !important;
        }
        .tritechies-arrow {
          color: var(--f-arrow-color);
          transition: all 0.3s ease !important;
        }
        .tritechies-btn:hover .tritechies-arrow {
          color: var(--f-card-hover);
          transform: translate(2px, -2px) !important;
        }

        .footer-bg-desktop-light { display: none; }
        .footer-bg-desktop-dark { display: none; }
        .footer-bg-mobile-light { display: block; }
        .footer-bg-mobile-dark { display: none; }

        .dark .footer-bg-mobile-light { display: none; }
        .dark .footer-bg-mobile-dark { display: block; }

        @media (min-width: 768px) {
          .footer-bg-desktop-light { display: block; }
          .footer-bg-desktop-dark { display: none; }
          .footer-bg-mobile-light { display: none; }
          .footer-bg-mobile-dark { display: none; }

          .dark .footer-bg-desktop-light { display: none; }
          .dark .footer-bg-desktop-dark { display: block; }
          .dark .footer-bg-mobile-light { display: none; }
          .dark .footer-bg-mobile-dark { display: none; }
        }
      `}</style>

      {/* Background Images — responsive to media (mobile/desktop) and theme (light/dark) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-500"
        style={{ opacity: 'var(--f-image-op)', mixBlendMode: 'var(--f-blend)' as any }}
      >
        {/* Desktop Light Mode Background */}
        <div className="footer-bg-desktop-light absolute inset-0">
          <Image
            src="/images/footer-desktop-light.png"
            alt="Mountain Background"
            fill
            className="object-cover object-bottom"
          />
        </div>

        {/* Desktop Dark Mode Background */}
        <div className="footer-bg-desktop-dark absolute inset-0">
          <Image
            src="/images/footer-desktop-dark.png"
            alt="Mountain Background"
            fill
            className="object-cover object-bottom"
          />
        </div>

        {/* Mobile Light Mode Background */}
        <div className="footer-bg-mobile-light absolute inset-0">
          <Image
            src="/images/footer-mobile-light.png"
            alt="Mountain Background"
            fill
            className="object-cover object-bottom"
          />
        </div>

        {/* Mobile Dark Mode Background */}
        <div className="footer-bg-mobile-dark absolute inset-0">
          <Image
            src="/images/footer-mobile-dark.png"
            alt="Mountain Background"
            fill
            className="object-cover object-bottom"
          />
        </div>
      </div>

      {/* Gradient Mask to ensure text readability */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--f-grad-bottom), var(--f-grad-mid), var(--f-grad-top))' }}
      />

      {/* Subtle light-mode brand tint */}
      <div className="absolute inset-0 z-0 pointer-events-none dark:opacity-0 transition-opacity duration-500 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-500/10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-8">
          {/* Brand & Get In Touch */}
          <div className="lg:col-span-5 space-y-8 lg:pr-8">
            <div>
              <h3 className="font-black tracking-widest uppercase text-xs mb-4 text-brand-600 dark:text-brand-500">
                Get in Touch
              </h3>
              {showTagline && (
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--f-heading)' }}>
                  {footer.tagline}
                </h2>
              )}
              {showDesc && (
                <p className="text-base font-medium leading-relaxed max-w-sm drop-shadow-sm mb-6" style={{ color: 'var(--f-muted)' }}>
                  {footer.description}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                {socialLinks.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    title={s.label}
                    className="p-3.5 rounded-2xl transition-all shadow-sm hover:shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:-translate-y-1"
                    style={{
                      backgroundColor: 'var(--f-card-bg)',
                      borderColor: 'var(--f-border)',
                      borderWidth: '1px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--f-card-hover)';
                      e.currentTarget.style.color = 'var(--f-icon-hover)';
                      e.currentTarget.querySelector('svg')!.style.color = 'var(--f-icon-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--f-card-bg)';
                      e.currentTarget.style.color = 'var(--f-text)';
                      e.currentTarget.querySelector('svg')!.style.color = 'var(--f-icon)';
                    }}
                  >
                    <span className="sr-only">{s.label}</span>
                    <span style={{ color: 'var(--f-icon)', transition: 'color 0.2s' }}>{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Explore + Support — side-by-side on mobile, separate cols on desktop */}
          <div className="grid grid-cols-2 gap-8 lg:contents">
            {/* Explore */}
            <div className="lg:col-span-2">
              <h3 className="font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2" style={{ color: 'var(--f-heading)' }}>
                <Tent className="w-4 h-4 text-brand-600 dark:text-brand-500" /> Explore
              </h3>
              <ul className="space-y-4">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Destinations", href: "/destinations" },
                  { name: "Trekking Packages", href: "/trekking" },
                  { name: "Tour Packages", href: "/tours" },
                  { name: "Travel Blog", href: "/blog" },
                  { name: "Contact Us", href: "/contact" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-brand-600 dark:hover:text-white hover:translate-x-1 inline-block font-medium text-sm transition-all" style={{ color: 'var(--f-muted)' }}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="lg:col-span-2">
              <h3 className="font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2" style={{ color: 'var(--f-heading)' }}>
                <Compass className="w-4 h-4 text-brand-600 dark:text-brand-500" /> Support
              </h3>
              <ul className="space-y-4">
                {[
                  { name: "FAQs", href: "/faqs" },
                  { name: "Booking Terms", href: "/booking-terms" },
                  { name: "Cancellation Policy", href: "/cancellation-policy" },
                  { name: "Privacy Policy", href: "/privacy-policy" },
                  { name: "Visa Info", href: "/visa-info" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-brand-600 dark:hover:text-white hover:translate-x-1 inline-block font-medium text-sm transition-all" style={{ color: 'var(--f-muted)' }}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-bold tracking-wide uppercase text-sm mb-6 flex items-center gap-2" style={{ color: 'var(--f-heading)' }}>
              <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-500" /> Contact
            </h3>
            {hasAnyContact ? (
              <ul className="space-y-5">
                {hasLocation && (
                  <li className="flex items-start gap-4 text-sm font-medium group cursor-pointer" style={{ color: 'var(--f-muted)' }}>
                    <div
                      className="p-2.5 rounded-xl border transition-all shrink-0"
                      style={{ backgroundColor: 'var(--f-card-bg)', borderColor: 'var(--f-border)' }}
                    >
                      <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                    <span className="pt-1.5 leading-relaxed group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {showLoc1 && contact.locationLine1}
                      {showLoc1 && showLoc2 && <br />}
                      {showLoc2 && contact.locationLine2}
                    </span>
                  </li>
                )}
                {hasPhone && (
                  <li className="flex items-center gap-4 text-sm font-medium group cursor-pointer" style={{ color: 'var(--f-muted)' }}>
                    <div
                      className="p-2.5 rounded-xl border transition-all shrink-0"
                      style={{ backgroundColor: 'var(--f-card-bg)', borderColor: 'var(--f-border)' }}
                    >
                      <Phone className="h-4 w-4 text-brand-600 dark:text-brand-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                    <a href={`tel:${contact.phonePrimary.replace(/[^0-9+]/g, "")}`} className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {contact.phonePrimary}
                    </a>
                  </li>
                )}
                {hasEmail && (
                  <li className="flex items-center gap-4 text-sm font-medium group cursor-pointer" style={{ color: 'var(--f-muted)' }}>
                    <div
                      className="p-2.5 rounded-xl border transition-all shrink-0"
                      style={{ backgroundColor: 'var(--f-card-bg)', borderColor: 'var(--f-border)' }}
                    >
                      <Mail className="h-4 w-4 text-brand-600 dark:text-brand-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                    <a href={`mailto:${contact.emailPrimary}`} className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors break-all">
                      {contact.emailPrimary}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--f-muted)' }}>Contact details coming soon.</p>
            )}
          </div>
        </div>

        {/* Big Text Hover Animation */}
        <div className="w-full flex items-center justify-start overflow-hidden relative z-20 mix-blend-multiply dark:mix-blend-screen pointer-events-auto mt-2 mb-2">
          <TextHoverEffect text="Greenadventure" duration={0.5} />
        </div>

        {/* Footer Bottom */}
        <div
          className="mt-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 border-t"
          style={{ borderColor: 'var(--f-border)' }}
        >
          <p className="text-sm font-black tracking-wide" style={{ color: 'var(--f-text)' }}>
            © {new Date().getFullYear()} Green Adventure Treks &amp; Expeditions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold" style={{ color: 'var(--f-muted)' }}>GreenAdventure by</span>
            <a
              href="http://tritechies.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="tritechies-btn group flex items-center gap-1.5 px-5 py-2.5 border rounded-2xl text-sm font-black shadow-sm shrink-0"
            >
              <span className="font-extrabold tracking-tight transition-colors">
                <span className="transition-colors" style={{ color: 'var(--f-tri-color)' }}>tri</span>
                <span className="transition-colors" style={{ color: 'var(--f-techies-color)' }}>Techies.</span>
              </span>
              <ArrowUpRight className="tritechies-arrow w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
