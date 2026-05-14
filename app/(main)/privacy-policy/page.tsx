import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Green Adventure",
  description: "Learn how Green Adventure protects and handles your personal information.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: "When you inquire about or book a trip, we collect necessary personal information including your name, email address, phone number, passport details, date of birth, dietary requirements, and medical history. We also collect emergency contact details to ensure your safety during the expedition.",
    },
    {
      title: "2. How We Use Your Information",
      body: "Your information is primarily used to process your booking, arrange necessary trekking permits (such as TIMS cards and National Park entry permits), book domestic flights, and ensure your health and safety on the trail. We may also use your email address to send you relevant updates or newsletters, which you can opt out of at any time.",
    },
    {
      title: "3. Data Sharing and Third Parties",
      body: "We do not sell, trade, or rent your personal information to third parties. We only share necessary details with trusted partners essential to your trip, such as local airlines, hotels, and government permit offices. These third parties are obligated to keep your information confidential.",
    },
    {
      title: "4. Data Security",
      body: "We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. All payment transactions are processed through secure, encrypted gateways and we do not store your credit card details on our servers.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent">
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Privacy Policy</h1>
          <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300">
          <p className="text-lg leading-relaxed mb-4">
            At Green Adventure Treks & Expeditions, we respect your privacy and are committed to protecting your personal data. This privacy policy informs you about how we look after your personal data when you visit our website or book a trip with us.
          </p>

          {sections.map((s, idx) => (
            <section
              key={idx}
              className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{s.title}</h2>
              <p className="leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
