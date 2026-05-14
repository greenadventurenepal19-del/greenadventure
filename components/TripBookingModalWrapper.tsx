"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TripBookingWidget from "./TripBookingWidget";
import { X, MessageCircle } from "lucide-react";

interface TripBookingModalWrapperProps {
  tripTitle: string;
  tripSlug: string;
  price: string;
  contactSettings: any;
}

export default function TripBookingModalWrapper({
  tripTitle,
  tripSlug,
  price,
  contactSettings
}: TripBookingModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "inquiry" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = (tab: "booking" | "inquiry") => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => openModal("booking")} 
          className="px-8 py-3 rounded-full bg-white text-black font-semibold transition-all hover:bg-gray-100 active:scale-95 shadow-xl cursor-pointer"
        >
          Book Now
        </button>
        <button 
          onClick={() => openModal("inquiry")} 
          className="px-8 py-3 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 border border-white/20 backdrop-blur-md text-white font-semibold transition-all shadow-xl cursor-pointer"
        >
          Customize Trip
        </button>
        {contactSettings?.phoneWhatsapp && (
          <a
            href={`https://wa.me/${contactSettings.phoneWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in the ${tripTitle} trip.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-[#25D366]/80 hover:bg-[#25D366] border border-[#25D366]/20 backdrop-blur-md text-white font-semibold transition-all shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="h-5 w-5" /> WhatsApp
          </a>
        )}
      </div>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
          <div className={`relative w-full mx-auto transition-all ${activeTab === 'inquiry' ? 'max-w-4xl' : 'max-w-md'}`}>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-gray-300 transition-colors p-2 z-[10000]"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="bg-card rounded-3xl shadow-2xl relative z-[10005] max-h-full">
               <TripBookingWidget 
                 tripTitle={tripTitle} 
                 tripSlug={tripSlug} 
                 price={price} 
                 initialFormType={activeTab}
                 onClose={() => setIsOpen(false)}
               />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
