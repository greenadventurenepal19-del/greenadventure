import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy | Green Adventure",
  description: "Understand the cancellation and refund policies for Green Adventure treks and expeditions.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Cancellation Policy</h1>
          <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300">
          <p className="text-lg leading-relaxed mb-4">
            We understand that unexpected events can force you to cancel your trip. Our cancellation policy is designed to be as fair as possible, taking into account the non-refundable expenses we incur when preparing for your expedition.
          </p>

          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Cancellation by the Client</h2>
            <p className="leading-relaxed mb-4">
              If you wish to cancel your booking, you must notify us in writing. The date on which we receive the written notice will determine the cancellation charges applicable:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong className="text-slate-900 dark:text-slate-200">60 days or more before departure:</strong> Loss of 20% deposit.</li>
              <li><strong className="text-slate-900 dark:text-slate-200">30 to 59 days before departure:</strong> 50% of total trip cost.</li>
              <li><strong className="text-slate-900 dark:text-slate-200">15 to 29 days before departure:</strong> 75% of total trip cost.</li>
              <li><strong className="text-slate-900 dark:text-slate-200">Less than 15 days before departure:</strong> 100% of total trip cost (No refund).</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Cancellation by Green Adventure</h2>
            <p className="leading-relaxed">
              We reserve the right to cancel any trip up to 30 days before departure due to natural disasters, political instability, or other external events beyond our control that make it unviable to safely operate the planned itinerary. If we cancel your trip, you will receive a full refund of all monies paid to us, or you may choose to transfer your payment to an alternative departure or another trip of equal value.
            </p>
          </section>

          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Postponement</h2>
            <p className="leading-relaxed">
              If you are unable to travel due to sudden personal emergencies or global travel restrictions, you may choose to postpone your trip. We will hold your deposit as a lifetime credit that can be used for any future booking. Notice of postponement must be given at least 15 days before the departure date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
