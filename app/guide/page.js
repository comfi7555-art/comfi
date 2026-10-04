"use client";

import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { Leaf, Clock, Trash2, CalendarRange } from 'lucide-react';

export default function PadGuide() {
  return (
    <div className="bg-background-primary min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Editorial Header */}
      <ScrollReveal className="mb-16 border-b border-primaryText/5 pb-8">
        <span className="utility-label text-accent font-black tracking-widest block mb-2">Education & Trust</span>
        <h1 className="text-5xl md:text-6xl font-black heading-premium text-primaryText">
          THE COMFI PAD GUIDE
        </h1>
        <p className="text-sm text-primaryText/60 max-w-xl mt-4 leading-relaxed font-light">
          A premium guide to understanding your flow cycle, choosing appropriate padding sizes, maintaining optimal hygiene, and disposal practices.
        </p>
      </ScrollReveal>

      {/* Grid of educational topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        
        {/* Topic 1: How to Pick a Size */}
        <ScrollReveal className="bg-background-secondary p-8 rounded-2xl border border-primaryText/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
              <CalendarRange size={24} />
            </div>
            <h3 className="text-2xl font-bold text-primaryText mb-4">1. Choosing the Right Size</h3>
            <p className="text-sm text-primaryText/70 leading-relaxed font-light mb-6">
              Not all periods are the same. Using a pad that is too short for a heavy flow leads to back-leaks, while using a pad that is too long for a light day causes unnecessary bulkiness.
            </p>
            
            {/* Dimensions Table */}
            <div className="border border-primaryText/10 rounded-xl overflow-hidden bg-background-primary">
              <div className="grid grid-cols-3 bg-primaryText text-background-primary px-4 py-2 text-[10px] font-black uppercase tracking-wider">
                <div>Size</div>
                <div>Length</div>
                <div>Flow Profile</div>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 border-b border-primaryText/5 text-xs font-semibold text-primaryText">
                <div>Regular</div>
                <div>240mm</div>
                <div>Light/Medium</div>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 border-b border-primaryText/5 text-xs font-semibold text-primaryText">
                <div>Large</div>
                <div>280mm</div>
                <div>Medium/Heavy</div>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 border-b border-primaryText/5 text-xs font-semibold text-primaryText">
                <div>XL</div>
                <div>320mm</div>
                <div>Heavy Active</div>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-primaryText">
                <div>Overnight</div>
                <div>360mm</div>
                <div>Night / Lying down</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Topic 2: Changing Frequency */}
        <ScrollReveal className="bg-background-secondary p-8 rounded-2xl border border-primaryText/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
              <Clock size={24} />
            </div>
            <h3 className="text-2xl font-bold text-primaryText mb-4">2. Changing Frequency</h3>
            <p className="text-sm text-primaryText/70 leading-relaxed font-light mb-6">
              Regardless of your flow quantity, gynecologists recommend changing your sanitary pad every **4 to 6 hours**.
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-background-primary p-4 rounded-xl border border-primaryText/5 text-xs">
                <span className="font-bold text-accent">Bacteria Control:</span> Period blood is organic matter; changing the pad frequently prevents microbial build-up and blocks bad odors.
              </div>
              <div className="bg-background-primary p-4 rounded-xl border border-primaryText/5 text-xs">
                <span className="font-bold text-accent">Moisture Lock:</span> Keeping a pad on for too long locks moisture against your skin, causing friction rashes. Regular changes keep you dry.
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Topic 3: Disposal Workflow */}
        <ScrollReveal className="bg-background-secondary p-8 rounded-2xl border border-primaryText/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
              <Trash2 size={24} />
            </div>
            <h3 className="text-2xl font-bold text-primaryText mb-4">3. Hygienic Disposal</h3>
            <p className="text-sm text-primaryText/70 leading-relaxed font-light mb-6">
              Dispose of your pads safely and responsibly to ensure plumbing safety and prevent environmental pollution.
            </p>
            <ul className="text-xs text-primaryText/80 space-y-3 list-decimal list-inside font-medium">
              <li>Roll up the used pad tightly, soiled side inward.</li>
              <li>Wrap it inside the paper pouch provided with the new Comfi pad.</li>
              <li>Discard it inside a waste bin.</li>
              <li><span className="text-red-500 font-bold">Never flush pads down the toilet</span>, as they will expand and block plumbing.</li>
            </ul>
          </div>
        </ScrollReveal>

        {/* Topic 4: Skin Safe Certifications */}
        <ScrollReveal className="bg-background-secondary p-8 rounded-2xl border border-primaryText/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
              <Leaf size={24} />
            </div>
            <h3 className="text-2xl font-bold text-primaryText mb-4">4. Rash-Free Skin Tech</h3>
            <p className="text-sm text-primaryText/70 leading-relaxed font-light mb-6">
              Standard pads contain chemical plastics and chlorine-bleached fibers, which trap heat and cause intense skin irritation.
            </p>
            <div className="flex flex-col gap-3">
              <div className="bg-background-primary p-4 rounded-xl border border-primaryText/5 text-xs">
                <span className="font-bold text-accent">Zero Plastics:</span> Comfi pads use organic plant-based fibers that let air flow freely.
              </div>
              <div className="bg-background-primary p-4 rounded-xl border border-primaryText/5 text-xs">
                <span className="font-bold text-accent">No Bleach or Dyes:</span> Chlorine-free materials guarantee that no chemical residue touches your intimate areas, keeping you naturally rash-free.
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

    </div>
  );
}
