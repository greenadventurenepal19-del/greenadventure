import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nepal Visa Information | Green Adventure",
  description: "Everything you need to know about obtaining a tourist visa for Nepal.",
};

export default function VisaInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Nepal Visa Information</h1>
          <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
          <p className="mt-6 text-lg text-slate-700 dark:text-slate-400">
            Obtaining a visa for Nepal is a straightforward process for most nationalities. Here is what you need to know before you travel.
          </p>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Visa On Arrival</h2>
            <p className="leading-relaxed mb-4">
              Most foreigners can obtain a tourist visa upon arrival at Tribhuvan International Airport (KTM) in Kathmandu, or at various land border crossings. To expedite the process, you can fill out the online Visa On Arrival form up to 15 days before your arrival.
            </p>
            <p className="leading-relaxed font-semibold text-slate-900 dark:text-white mb-2">Requirements:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A passport valid for at least 6 months beyond your planned departure date.</li>
              <li>Two passport-sized photos (if not using the electronic kiosk).</li>
              <li>Visa fee paid in cash (USD, EUR, or GBP are preferred).</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Visa Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                    <th className="py-3 px-4 font-semibold">Visa Duration</th>
                    <th className="py-3 px-4 font-semibold">Fee (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-3 px-4">15 Days Multiple Entry</td>
                    <td className="py-3 px-4">$30</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-3 px-4">30 Days Multiple Entry</td>
                    <td className="py-3 px-4">$50</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">90 Days Multiple Entry</td>
                    <td className="py-3 px-4">$125</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Visa Extensions</h2>
            <p className="leading-relaxed">
              If you decide to stay longer, you can easily extend your tourist visa at the Department of Immigration in Kathmandu or the Immigration Office in Pokhara. The extension fee is $3 USD per day, with a minimum extension of 15 days ($45 USD). A tourist visa can be extended for a maximum of 150 days in a single calendar year.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
