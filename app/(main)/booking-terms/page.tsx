import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Terms & Conditions | Green Adventure",
  description: "Read the booking terms and conditions for reserving your trekking and adventure trips with Green Adventure.",
};

export default function BookingTermsPage() {
  const sections = [
    {
      title: "1. The Contract",
      body: "By booking a trip with Green Adventure Treks & Expeditions, you are agreeing to these Terms and Conditions. The booking is accepted and becomes definite only from the date when we send a confirmation invoice or email. It is at this point that a contract between Green Adventure and the Client comes into existence.",
    },
    {
      title: "2. Deposit Requirement",
      body: "To secure your booking, a non-refundable deposit of 20% of the total trip cost is required per person. This deposit is used to secure your domestic flights, hotel bookings, and necessary trekking permits in advance. The remaining balance must be paid upon your arrival in Kathmandu before the trip departs.",
    },
    {
      title: "3. Medical Conditions & Fitness",
      body: "Clients must be in good physical and mental health to participate in our treks. Any pre-existing medical conditions, disabilities, or dietary requirements must be disclosed at the time of booking. The client acknowledges that the trips involve traveling to remote regions where medical facilities may be limited.",
    },
    {
      title: "4. Travel Insurance",
      body: "Comprehensive travel insurance is mandatory for all clients undertaking a trek or expedition. Your insurance policy must cover personal injury, medical expenses, repatriation expenses, and emergency helicopter evacuation up to the maximum altitude of your chosen itinerary.",
    },
    {
      title: "5. Unforeseen Circumstances & Itinerary Changes",
      body: "While we strive to adhere strictly to the planned itinerary, weather conditions in the Himalayas can be unpredictable. Flight cancellations, landslides, or trail conditions may necessitate changes to the itinerary. Green Adventure reserves the right to alter or cancel any trip due to such unforeseen circumstances. We are not responsible for additional expenses incurred due to delays.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Booking Terms & Conditions</h1>
          <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
        </div>

        <div className="space-y-6">
          {sections.map((s, idx) => (
            <section
              key={idx}
              className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{s.title}</h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
