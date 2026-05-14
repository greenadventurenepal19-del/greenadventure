"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { countryCodes } from "@/lib/country-codes";
import { ChevronDown, Send, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TripBookingWidgetProps {
  tripTitle: string;
  tripSlug: string;
  price: string;
  initialFormType?: "booking" | "inquiry" | null;
  initialDate?: string;
  initialTravelers?: string;
  onClose?: () => void;
}

export default function TripBookingWidget({ 
  tripTitle, 
  tripSlug, 
  price, 
  initialFormType = null,
  initialDate = "",
  initialTravelers = "1 Person",
  onClose
}: TripBookingWidgetProps) {
  const [date, setDate] = useState(initialDate);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [formType, setFormType] = useState<"booking" | "inquiry" | null>(initialFormType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+977",
    whatsapp: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCountryCodes = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form
      if (formType === "inquiry" && !formData.name) {
        throw new Error("Please provide your name.");
      }
      if (!formData.email) {
        throw new Error("Please provide your email address.");
      }
      if (formType === "inquiry" && !date) {
        throw new Error("Please select a travel date.");
      }

      await addDoc(collection(db, "contacts"), {
        type: formType,
        tripTitle,
        tripSlug,
        tripDate: date || "To be decided",
        travelers,
        name: formType === "inquiry" ? formData.name : "Booking Contact",
        email: formData.email,
        whatsapp: formType === "inquiry" && formData.whatsapp ? `${formData.countryCode} ${formData.whatsapp}` : "",
        message: formType === "inquiry" ? formData.message : "",
        createdAt: serverTimestamp(),
        status: "pending",
        subject: formType === "booking" ? `Booking Request: ${tripTitle}` : `Inquiry: ${tripTitle}`
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center relative">
        {onClose && (
           <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
             <X className="h-6 w-6" />
           </button>
        )}
        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
          <CheckCircle className="w-8 h-8 text-brand-600 dark:text-brand-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Request Sent!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for reaching out about the <span className="font-semibold text-foreground">{tripTitle}</span>. Our team will get back to you shortly.
        </p>
        <button 
          onClick={() => {
            setIsSuccess(false);
            if (initialFormType === null) {
               setFormType(null);
            }
            setFormData({ ...formData, message: "" });
          }}
          className="w-full p-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-bold transition-all"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  // SIDEBAR MODE (initialFormType is null)
  if (initialFormType === null) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <h3 className="text-2xl font-bold mb-2">Book This Trip</h3>
        <p className="text-muted-foreground mb-6">Secure your spot for the {tripTitle}</p>
        
        <div className="text-3xl font-bold mb-6 border-b border-border pb-6">
          {price} <span className="text-base font-normal text-muted-foreground">/ person</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Select Date <span className="text-brand-500">*</span></label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none" 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Travelers <span className="text-brand-500">*</span></label>
            <select 
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option>1 Person</option>
              <option>2 Persons</option>
              <option>3-5 Persons</option>
              <option>6-10 Persons</option>
              <option>10+ Persons</option>
            </select>
          </div>

          <div className="pt-2 space-y-4">
            <button 
              type="button" 
              onClick={() => {
                if (!date) {
                   setError("Please select a date first.");
                   return;
                }
                setError("");
                setFormType("booking");
              }}
              className="w-full p-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/25 cursor-pointer"
            >
              Book Now
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (!date) {
                   setError("Please select a date first.");
                   return;
                }
                setError("");
                setFormType("inquiry");
              }}
              className="w-full p-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-bold transition-all cursor-pointer"
            >
              Inquire / Customize
            </button>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Modal Overlay triggered from Sidebar */}
        {mounted && formType && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <div className={`relative w-full mx-auto transition-all ${formType === 'inquiry' ? 'max-w-4xl' : 'max-w-md'}`}>
              <button 
                onClick={() => setFormType(null)}
                className="absolute -top-12 right-0 md:-right-12 text-white hover:text-gray-300 transition-colors p-2 z-[10000]"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="bg-card rounded-3xl shadow-2xl relative z-[10005] max-h-full overflow-hidden">
                <TripBookingWidget 
                  tripTitle={tripTitle}
                  tripSlug={tripSlug}
                  price={price}
                  initialFormType={formType}
                  initialDate={date}
                  initialTravelers={travelers}
                  onClose={() => setFormType(null)}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // MODAL / EXPANDED FORM MODE
  return (
    <div className="p-8">
      
      <div className="mb-6">
         <h4 className="font-bold text-2xl mb-2">
           {formType === "booking" ? "Complete Your Booking" : "Send Us Your Inquiry"}
         </h4>
         <p className="text-muted-foreground">
           {tripTitle}
         </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {formType === "booking" ? (
          // ONLY ASK FOR EMAIL ON BOOKING
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address <span className="text-brand-500">*</span></label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email to secure booking"
                required
                className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none text-lg" 
              />
              <p className="text-sm text-muted-foreground mt-2">We will contact you shortly to complete the payment and booking details.</p>
            </div>
          </div>
        ) : (
          // HORIZONTAL LAYOUT FOR INQUIRY
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Date <span className="text-brand-500">*</span></label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Travelers <span className="text-brand-500">*</span></label>
              <select 
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option>1 Person</option>
                <option>2 Persons</option>
                <option>3-5 Persons</option>
                <option>6-10 Persons</option>
                <option>10+ Persons</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name <span className="text-brand-500">*</span></label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address <span className="text-brand-500">*</span></label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">WhatsApp / Phone</label>
              <div className="flex gap-2 relative">
                <div className="w-[35%] min-w-[120px] md:w-[25%] relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none flex items-center justify-between"
                  >
                    <span className="truncate mr-2">{formData.countryCode}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-[300px] bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCountryCodes.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, countryCode: c.code });
                              setIsDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center justify-between"
                          >
                            <span className="truncate mr-2">{c.name}</span>
                            <span className="text-muted-foreground">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/[^0-9]/g, "") })}
                  placeholder="Enter phone number"
                  className="flex-1 p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                How can we customize this for you? <span className="text-brand-500">*</span>
              </label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your preferences, dates, number of people, etc."
                required
                rows={4}
                className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          {onClose && (
             <button 
               type="button"
               onClick={onClose}
               className="px-6 py-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-bold transition-all"
             >
               Cancel
             </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 p-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Sending..." : (
              <>
                <Send className="w-4 h-4" /> 
                {formType === "booking" ? "Submit Booking Request" : "Send Inquiry"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
