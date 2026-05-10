import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Terms & Conditions | Green Adventure",
  description: "Read the booking terms and conditions for reserving your trekking and adventure trips with Green Adventure.",
};

export default function BookingTermsPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Booking Terms & Conditions</h1>
        <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-a:text-brand-500 space-y-8 text-slate-600 dark:text-slate-300">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. The Contract</h2>
          <p className="leading-relaxed">
            By booking a trip with Green Adventure Treks & Expeditions, you are agreeing to these Terms and Conditions. The booking is accepted and becomes definite only from the date when we send a confirmation invoice or email. It is at this point that a contract between Green Adventure and the Client comes into existence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Deposit Requirement</h2>
          <p className="leading-relaxed">
            To secure your booking, a non-refundable deposit of 20% of the total trip cost is required per person. This deposit is used to secure your domestic flights, hotel bookings, and necessary trekking permits in advance. The remaining balance must be paid upon your arrival in Kathmandu before the trip departs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Medical Conditions & Fitness</h2>
          <p className="leading-relaxed">
            Clients must be in good physical and mental health to participate in our treks. Any pre-existing medical conditions, disabilities, or dietary requirements must be disclosed at the time of booking. The client acknowledges that the trips involve traveling to remote regions where medical facilities may be limited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Travel Insurance</h2>
          <p className="leading-relaxed">
            Comprehensive travel insurance is mandatory for all clients undertaking a trek or expedition. Your insurance policy must cover personal injury, medical expenses, repatriation expenses, and emergency helicopter evacuation up to the maximum altitude of your chosen itinerary.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Unforeseen Circumstances & Itinerary Changes</h2>
          <p className="leading-relaxed">
            While we strive to adhere strictly to the planned itinerary, weather conditions in the Himalayas can be unpredictable. Flight cancellations, landslides, or trail conditions may necessitate changes to the itinerary. Green Adventure reserves the right to alter or cancel any trip due to such unforeseen circumstances. We are not responsible for additional expenses incurred due to delays.
          </p>
        </section>
      </div>
    </div>
  );
}
