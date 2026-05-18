"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="group border border-border rounded-2xl bg-card overflow-hidden">
          <button
            onClick={() => toggleFaq(idx)}
            className="w-full p-6 flex items-center justify-between font-bold text-lg hover:bg-muted/50 transition-colors cursor-pointer text-left focus:outline-none"
          >
            <span className="flex items-center gap-4">
              <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-500 w-8 h-8 flex items-center justify-center rounded-full text-sm shrink-0">
                Q
              </span>
              {faq.q}
            </span>
            <motion.div
              animate={{ rotate: openIndex === idx ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 text-muted-foreground border-t border-border mt-2">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
