"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "Is Comfi really only 0.8mm thin?",
    a: "Yes! Comfi features an ultra-compressed SAP (Super Absorbent Polymer) gel core. This allows our pads to remain less than 0.8mm thin when dry, providing weightless and invisible protection while holding up to 10x its weight in fluid."
  },
  {
    q: "Are Comfi pads biodegradable and plastic-free?",
    a: "Absolutely. Our pads feature a 100% organic cotton top-sheet and biodegradable backing film. Unlike traditional sanitary pads, Comfi contains zero toxic bleach, synthetic fragrances, or non-biodegradable plastics. Each pad is wrapped in pure paper."
  },
  {
    q: "How does the 'Build Your Own Pack' option work?",
    a: "Every flow cycle is unique. Our builder lets you select exactly how many Regular, Large, XL, and Overnight pads you need (minimum 10 total). Plus, when you select 20 or more pads, you get a 10% discount automatically applied."
  },
  {
    q: "How often should I change my Comfi pad?",
    a: "Although our advanced lock layers provide up to 8-12 hours of protection (especially our 360mm Overnight pads), gynecologists recommend changing your sanitary pads every 4-6 hours on active days to maintain absolute freshness and hygiene."
  },
  {
    q: "Where do you ship, and what is your return policy?",
    a: "We ship nationwide in discreet, 100% recyclable cardboard packages. Due to the personal nature of hygiene products, we cannot accept returns once opened. However, if there are any issues with your shipment, please reach out to support!"
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#d3e8e3] rounded-2xl p-8 border border-primaryText/5 max-w-3xl mx-auto my-12">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="text-primaryText/60" size={24} />
        <h3 className="text-3xl font-black tracking-tighter text-primaryText uppercase">
          Frequently Asked Questions
        </h3>
      </div>
      <p className="text-sm text-primaryText/70 mb-8 leading-relaxed">
        Everything you need to know about our materials, customized packs, and delivery options. Can't find an answer? Feel free to contact our support team.
      </p>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="bg-background-primary rounded-xl border border-primaryText/5 overflow-hidden transition-all duration-300 hover:border-primaryText/15"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex justify-between items-center text-left p-5 text-primaryText font-bold text-sm tracking-wide transition-colors duration-200"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  className={`text-primaryText/60 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  size={18} 
                />
              </button>
              
              <div 
                className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-primaryText/5' : 'grid-rows-[0fr] opacity-0'
                } overflow-hidden`}
              >
                <div className="min-h-0">
                  <p className="p-5 text-xs text-primaryText/80 leading-relaxed font-light font-sans">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
