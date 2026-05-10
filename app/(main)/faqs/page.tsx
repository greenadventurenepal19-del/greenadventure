import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Green Adventure",
  description: "Find answers to the most commonly asked questions about trekking in Nepal, our services, and how to prepare for your journey.",
};

export default function FAQsPage() {
  const faqs = [
    {
      question: "What is the best time of year to trek in Nepal?",
      answer: "The best times to trek in Nepal are during the spring (March to May) and autumn (September to November). These seasons offer the clearest skies, most stable weather, and pleasant daytime temperatures. Winter (December to February) is great for lower elevation treks, while the monsoon season (June to August) is ideal for rain-shadow regions like Upper Mustang.",
    },
    {
      question: "Do I need prior trekking experience?",
      answer: "It depends on the trek. We offer routes for all levels. Short treks like Poon Hill or the Annapurna Panorama require no prior experience—just a reasonable level of fitness. High altitude treks like Everest Base Camp or the Annapurna Circuit require good cardiovascular fitness and mental determination, though prior technical climbing experience is not necessary.",
    },
    {
      question: "What happens if I get altitude sickness?",
      answer: "Our guides are highly trained in wilderness first aid and the symptoms of Acute Mountain Sickness (AMS). We design our itineraries with proper acclimatization days. If you show mild symptoms, our guides will monitor you closely and alter the pace. In severe cases, we are equipped to arrange immediate helicopter evacuation to Kathmandu.",
    },
    {
      question: "Is drinking water safe during the trek?",
      answer: "We strongly advise against drinking untreated tap or stream water. We provide purified drinking water during the trek or assist you in boiling water at tea houses. We also recommend bringing water purification tablets or a filtering bottle like Lifestraw for extra safety and to minimize plastic waste.",
    },
    {
      question: "What kind of accommodation can I expect?",
      answer: "On popular routes, you will stay in 'tea houses', which are basic but comfortable mountain lodges run by local families. They offer private rooms (usually twin-share) and communal dining areas. High-end luxury lodges are also available on specific routes. On remote expeditions, we provide high-quality camping equipment.",
    },
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Frequently Asked Questions</h1>
        <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
          Everything you need to know to prepare for your Himalayan adventure.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((faq, idx) => (
          <section key={idx} className="bg-white dark:bg-[#0a110a] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{faq.question}</h2>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
          </section>
        ))}
      </div>
      
      <div className="mt-16 p-8 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Still have questions?</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Our travel experts are ready to assist you.</p>
        <a href="/contact" className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all">
          Contact Us
        </a>
      </div>
    </div>
  );
}
