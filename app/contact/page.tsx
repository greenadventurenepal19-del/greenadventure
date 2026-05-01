"use client";

import { MapPin, Phone, Mail, Send } from "lucide-react";

import Image from "next/image";

export default function ContactPage() {
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
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <div className="bg-card p-8 md:p-10 rounded-3xl border border-border shadow-xl">
            <h2 className="text-3xl font-bold mb-8">Send us an Inquiry</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <input type="text" className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <input type="email" className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <input type="text" className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Everest Base Camp Inquiry" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea rows={5} className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" placeholder="How can we help you plan your trip?" />
              </div>
              <button type="button" className="w-full p-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
                <Send className="h-5 w-5" /> Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Office</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Drop by our office in the heart of Kathmandu for a cup of tea and let's discuss your next adventure.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Location</h3>
                  <p className="text-muted-foreground">Thamel, Kathmandu<br />Bagmati Province, Nepal 44600</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Phone</h3>
                  <p className="text-muted-foreground">+977 1 4412345<br />+977 9801234567 (WhatsApp)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Email</h3>
                  <p className="text-muted-foreground">info@greenadventure.com<br />bookings@greenadventure.com</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 bg-muted rounded-3xl border border-border flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-background px-6 py-3 rounded-full font-bold border border-border shadow-lg">Google Maps Integration</span>
               </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
