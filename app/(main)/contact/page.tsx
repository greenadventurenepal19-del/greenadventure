"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle } from "lucide-react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { countryCodes } from "@/lib/country-codes";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
    <span className="bg-background px-6 py-3 rounded-full font-bold border border-border shadow-lg text-sm text-muted-foreground">Loading Map...</span>
  </div>
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    whatsappCountryCode: "+977",
    whatsappNumber: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({
    officeDesc: "Drop by our office in the heart of Kathmandu for a cup of tea and let's discuss your next adventure.",
    locationLine1: "Thamel, Kathmandu",
    locationLine2: "Bagmati Province, Nepal 44600",
    phonePrimary: "+977 1 4412345",
    emailPrimary: "info@greenadventure.com",
    emailSecondary: "bookings@greenadventure.com",
    mapLat: 27.7126,
    mapLng: 85.3145,
    mapZoom: 15
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "contact_info"));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching contact settings:", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { whatsappCountryCode, whatsappNumber, ...rest } = formData;
      await addDoc(collection(db, "contacts"), {
        ...rest,
        whatsapp: whatsappNumber ? `${whatsappCountryCode} ${whatsappNumber}` : "",
        status: "pending",
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", whatsappCountryCode: "+977", whatsappNumber: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image 
          src="/images/everest.png" 
          alt="Contact Us" 
          fill 
          className="object-cover"
          priority
        />
        <div className="container relative z-20 px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-200">
            Ready to start your adventure? Have questions? Our experts are here to help you plan the perfect Himalayan journey.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 items-start">
          
          {/* Contact Form */}
          <div className="bg-card p-8 md:p-10 rounded-3xl border border-border shadow-xl">
            <h2 className="text-3xl font-bold mb-8">Send us an Inquiry</h2>
            
            {isSuccess ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-brand-500 hover:underline font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                      placeholder="John Doe" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                      placeholder="john@example.com" 
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                      placeholder="Everest Base Camp Inquiry" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">WhatsApp Number (Optional)</label>
                    <div className="flex w-full">
                      <div className="relative w-[30%]" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full p-4 rounded-l-xl border border-r-0 border-border bg-background hover:bg-muted/30 outline-none transition-all font-medium text-sm text-left flex items-center justify-between cursor-pointer text-white/90 h-[58px] ${isDropdownOpen ? 'ring-2 ring-brand-500' : 'focus:ring-2 focus:ring-brand-500'}`}
                        >
                          <span className="truncate">{formData.whatsappCountryCode} {countryCodes.find(c => c.code === formData.whatsappCountryCode)?.iso}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-muted-foreground transition-transform shrink-0 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#0a0a0a] border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[350px]">
                            <div className="p-2 border-b border-border bg-[#0a0a0a] sticky top-0 z-10">
                              <input 
                                type="text" 
                                placeholder="Search country..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder:text-white/40"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              {countryCodes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery)).map(c => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, whatsappCountryCode: c.code }));
                                    setIsDropdownOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors ${formData.whatsappCountryCode === c.code ? 'bg-brand-500/10 text-brand-400 font-medium' : 'text-white/80'}`}
                                >
                                  <span className="truncate pr-4">{c.name}</span>
                                  <span className="text-white/40 shrink-0 font-mono text-xs">{c.code}</span>
                                </button>
                              ))}
                              {countryCodes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery)).length === 0 && (
                                <div className="p-6 text-center text-sm text-white/40">No countries found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <input 
                        type="tel" 
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        className="w-[70%] p-4 rounded-r-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all text-white/90 placeholder:text-white/40 h-[58px]"
                        placeholder="WhatsApp Number"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <textarea 
                    rows={5} 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" 
                    placeholder="How can we help you plan your trip?" 
                    required
                  />
                </div>
                <div className="space-y-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full p-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>

                  {settings.phoneWhatsapp && settings.phoneWhatsapp.trim() !== "" && (
                    <>
                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                      <a
                        href={`https://wa.me/${settings.phoneWhatsapp.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent("Hi Green Adventure Nepal! I am interested in planning a trip.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full p-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-3"
                      >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        Message us on WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Office</h2>
              <p className="text-muted-foreground text-lg mb-8 whitespace-pre-wrap">
                {settings.officeDesc}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Location</h3>
                  <p className="text-muted-foreground">{settings.locationLine1}<br />{settings.locationLine2}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Phone</h3>
                  <p className="text-muted-foreground">
                    {settings.phonePrimary}
                    {settings.phoneWhatsapp && <><br />{settings.phoneWhatsapp} (WhatsApp)</>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Email</h3>
                  <p className="text-muted-foreground">
                    {settings.emailPrimary}
                    {settings.emailSecondary && <><br />{settings.emailSecondary}</>}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl">Map Location</h3>
              </div>
              <div className="h-80 md:h-[400px] bg-muted rounded-3xl border border-border flex items-center justify-center relative overflow-hidden">
                <MapComponent 
                  lat={settings.mapLat || 27.7126} 
                  lng={settings.mapLng || 85.3145} 
                  zoom={settings.mapZoom || 15} 
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
