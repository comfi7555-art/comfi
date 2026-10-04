"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from '../components/ScrollReveal';
import { Leaf, ShieldCheck, Sparkles, Feather, Droplets, CheckCircle2, XCircle, ArrowRight, Layers } from 'lucide-react';

export default function IngredientsPage() {
  const [activeLayer, setActiveLayer] = useState(0);

  const layers = [
    {
      step: "01",
      title: "100% GOTS Organic Cotton Top Sheet",
      tagline: "Direct Skin Contact",
      icon: Feather,
      color: "bg-[#fae3e5] text-[#7e0022]",
      description: "Our top sheet is made exclusively from 100% certified organic cotton. It touches your intimate skin directly, providing supreme softness and zero friction.",
      howUsed: "Fibers are ethically harvested from non-GMO organic cotton farms without chemical pesticides. We process the raw cotton using non-toxic Elemental Chlorine-Free (ECF) washing to retain natural softness while eliminating irritants.",
      benefits: ["Prevents chafing & heat-rash", "Hypoallergenic & ultra-breathable", "Zero synthetic plastic mesh"]
    },
    {
      step: "02",
      title: "Natural Bamboo Fiber Wicking Channel",
      tagline: "Instant Fluid Acquisition",
      icon: Droplets,
      color: "bg-[#e3d2ed] text-[#5c0018]",
      description: "Positioned directly beneath the cotton topsheet, this natural bamboo fiber blend rapidly draws fluid downward away from your skin.",
      howUsed: "Bamboo pulp is processed into lightweight porous micro-channels that distribute liquid evenly across the core length to eliminate central pooling.",
      benefits: ["Instant 3-second surface dry feel", "Natural antibacterial properties", "Prevents side-leakage overflow"]
    },
    {
      step: "03",
      title: "Plant-Based Super Absorbent Gel Core",
      tagline: "High Density Fluid Lock",
      icon: Sparkles,
      color: "bg-[#fdf4b5] text-[#7e0022]",
      description: "An ultra-thin absorbent core combining FSC-certified elemental wood pulp with bio-based super-absorbent polymer (SAP) spheres.",
      howUsed: "Locks up to 10x its weight in liquid into a dry bio-gel, trapping moisture and stopping odor-causing bacteria growth immediately.",
      benefits: ["Traps up to 120ml of flow", "Prevents squishy backflow when sitting", "Ultra-thin sub-2mm profile"]
    },
    {
      step: "04",
      title: "Breathable Bio-Polymer Waterproof Backing",
      tagline: "Leak Defense Membrane",
      icon: ShieldCheck,
      color: "bg-[#febac4] text-[#7e0022]",
      description: "A plant-derived biodegradable barrier film that seals the bottom of the pad to completely protect clothing while allowing air to circulate.",
      howUsed: "Made from cornstarch bio-resins instead of petroleum plastics. Micro-pores are calibrated to block liquid molecules while letting air and vapor escape freely.",
      benefits: ["100% leakproof defense", "Breathable matrix prevents sweat buildup", "Plastics-free & eco-friendly"]
    },
    {
      step: "05",
      title: "Non-Toxic Food-Grade Adhesive",
      tagline: "Secure Wing Attachment",
      icon: Layers,
      color: "bg-[#f8d5c0] text-[#7e0022]",
      description: "Skin-safe, non-toxic adhesive strips on the underside and wings hold the pad securely to underwear without harsh chemical residue.",
      howUsed: "Formulated from medical and food-grade non-solvent resins. It provides firm hold through active movements without leaving sticky chemical residue on fabric.",
      benefits: ["Stays locked in place during sports & sleep", "Zero toxic glue fumes or solvent residues", "Easy, clean removal"]
    }
  ];

  const whatsNotInside = [
    { name: "Chlorine Bleach", reason: "Prevents toxic dioxin build-up and skin exposure." },
    { name: "Synthetic Plastics", reason: "Eliminates heat trapping, sweating, and friction rashes." },
    { name: "Artificial Fragrances", reason: "Protects your intimate pH balance and avoids allergic flare-ups." },
    { name: "Dyes & Heavy Metals", reason: "Guarantees 100% pure contact with sensitive skin." },
    { name: "Phthalates & Parabens", reason: "Zero endocrine disruptors or synthetic additives." }
  ];

  return (
    <div className="bg-background-primary min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Editorial Header */}
      <ScrollReveal className="mb-16 border-b border-primaryText/5 pb-8 text-center md:text-left">
        <span className="utility-label text-accent font-black tracking-widest block mb-2">Materials & Transparency</span>
        <h1 className="text-4xl md:text-6xl font-black heading-premium text-primaryText uppercase">
          WHAT GOES INTO YOUR COMFI PAD
        </h1>
        <p className="text-sm md:text-base text-primaryText/70 max-w-2xl mt-4 leading-relaxed font-light">
          We believe total transparency is essential for intimate care. Discover how 100% organic cotton and plant-powered layers unite to deliver rash-free, ultra-absorbent protection.
        </p>
      </ScrollReveal>

      {/* Featured Section: How Cotton Was Sourced & Used */}
      <ScrollReveal className="bg-[#fae3e5] rounded-3xl p-8 md:p-12 mb-20 border border-[#7e0022]/15 relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-[#7e0022] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest self-start">
              <Leaf size={14} /> Star Ingredient
            </div>
            <h2 className="text-3xl md:text-4xl font-black heading-premium text-[#7e0022]">
              How 100% Organic Cotton Is Used in Comfi
            </h2>
            <p className="text-sm text-[#3a3a3a] leading-relaxed font-medium">
              Conventional pads use synthetic plastic topsheets that trap moisture and body heat—creating a breeding ground for bacteria, sweat, and painful rashes. Comfi replaces synthetic mesh with <strong className="text-[#7e0022]">100% GOTS Certified Organic Cotton</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-white/80 p-4 rounded-2xl border border-[#7e0022]/10">
                <h4 className="text-xs font-bold text-[#7e0022] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#7e0022]" /> Sourced From Pure Farms
                </h4>
                <p className="text-xs text-[#3a3a3a]/80 leading-snug">
                  Grown organically without synthetic chemical pesticides, toxic fertilizers, or genetically modified seeds.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#7e0022]/10">
                <h4 className="text-xs font-bold text-[#7e0022] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#7e0022]" /> Chlorine-Free Processing
                </h4>
                <p className="text-xs text-[#3a3a3a]/80 leading-snug">
                  Washed using Elemental Chlorine-Free (ECF) methods so zero dioxin or chemical residues touch your skin.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#7e0022]/10">
                <h4 className="text-xs font-bold text-[#7e0022] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#7e0022]" /> Breathable Top Mesh
                </h4>
                <p className="text-xs text-[#3a3a3a]/80 leading-snug">
                  Spun into a silky, microporous veil that lets air circulate freely while pulling fluid into the inner core instantly.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#7e0022]/10">
                <h4 className="text-xs font-bold text-[#7e0022] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#7e0022]" /> Rash-Free Comfort
                </h4>
                <p className="text-xs text-[#3a3a3a]/80 leading-snug">
                  Velvety soft fibers eliminate friction against intimate skin, guaranteeing 100% protection from redness & itch.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="md:col-span-5 flex justify-center">
            <div className="bg-white rounded-2xl p-6 border border-[#7e0022]/15 shadow-lg w-full max-w-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#fae3e5] flex items-center justify-center text-[#7e0022] mb-4">
                <Feather size={40} />
              </div>
              <h3 className="text-xl font-black text-[#7e0022] mb-1">GOTS Certified Organic</h3>
              <p className="text-xs text-[#3a3a3a]/70 mb-4 font-light">Global Organic Textile Standard</p>
              <div className="w-full bg-[#fdf7e7] p-3 rounded-xl border border-[#7e0022]/10 text-left space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Skin Contact Layer</span>
                  <span className="text-[#7e0022]">100% Cotton</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Synthetic Plastics</span>
                  <span className="text-green-600 font-bold">0%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Dioxin / Bleach Risk</span>
                  <span className="text-green-600 font-bold">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Layer-by-Layer Interactive Breakdown */}
      <ScrollReveal className="mb-20">
        <div className="mb-8">
          <span className="utility-label text-accent font-black tracking-widest block mb-1">5-Layer Architecture</span>
          <h2 className="text-3xl md:text-4xl font-black heading-premium text-primaryText">
            INSIDE THE COMFI LAYER SYSTEM
          </h2>
          <p className="text-xs md:text-sm text-primaryText/70 mt-1">
            Click on any layer below to explore how each natural ingredient functions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Layer Selector Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {layers.map((layer, idx) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === idx;
              return (
                <button
                  key={layer.step}
                  onClick={() => setActiveLayer(idx)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#7e0022] text-white border-[#7e0022] shadow-md translate-x-2' 
                      : 'bg-background-secondary text-primaryText border-primaryText/5 hover:border-[#7e0022]/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isSelected ? 'bg-white text-[#7e0022]' : 'bg-[#7e0022]/10 text-[#7e0022]'}`}>
                      {layer.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold leading-tight">{layer.title}</h4>
                      <p className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-white/80' : 'text-primaryText/60'}`}>
                        {layer.tagline}
                      </p>
                    </div>
                  </div>
                  <Icon size={20} className={isSelected ? 'text-white' : 'text-[#7e0022]'} />
                </button>
              );
            })}
          </div>

          {/* Active Layer Details Panel */}
          <div className="lg:col-span-7">
            {layers[activeLayer] && (
              <div className="bg-background-secondary p-8 rounded-3xl border border-primaryText/10 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                      Layer {layers[activeLayer].step} of 05
                    </span>
                    <span className="text-xs font-bold text-primaryText/50">
                      {layers[activeLayer].tagline}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-primaryText mb-3">
                    {layers[activeLayer].title}
                  </h3>

                  <p className="text-sm text-primaryText/80 leading-relaxed font-normal mb-6">
                    {layers[activeLayer].description}
                  </p>

                  <div className="bg-background-primary p-5 rounded-2xl border border-primaryText/5 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2">
                      How It Works & How Material Is Used:
                    </h4>
                    <p className="text-xs text-primaryText/80 leading-relaxed font-light">
                      {layers[activeLayer].howUsed}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Key Benefits:</h4>
                    <div className="space-y-2">
                      {layers[activeLayer].benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-primaryText">
                          <CheckCircle2 size={16} className="text-[#008b70] flex-shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* The Never-Ever List */}
      <ScrollReveal className="bg-background-secondary p-8 md:p-12 rounded-3xl border border-primaryText/10 mb-20">
        <div className="max-w-2xl mb-8">
          <span className="utility-label text-accent font-black tracking-widest block mb-1">Purity Guarantee</span>
          <h2 className="text-3xl font-black heading-premium text-primaryText uppercase">
            WHAT WE NEVER USE IN OUR PADS
          </h2>
          <p className="text-xs md:text-sm text-primaryText/70 mt-2">
            Your intimate skin absorbs chemicals faster than other areas of your body. That’s why we permanently ban these harsh irritants:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {whatsNotInside.map((item, i) => (
            <div key={i} className="bg-background-primary p-5 rounded-2xl border border-red-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <XCircle size={18} />
                  <h4 className="text-sm font-bold text-primaryText">{item.name}</h4>
                </div>
                <p className="text-xs text-primaryText/70 leading-relaxed font-light">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Footer Banner linking to Pad Guide */}
      <ScrollReveal className="bg-[#7e0022] text-white p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="utility-label text-[#fae3e5] block mb-1 font-bold">Educational Resource</span>
          <h3 className="text-2xl md:text-3xl font-black heading-premium">
            Looking for Sizing & Care Instructions?
          </h3>
          <p className="text-xs md:text-sm text-[#fae3e5]/80 mt-2 max-w-xl font-light">
            Check out The Comfi Pad Guide to choose the right pad length for your flow rate, changing frequency recommendations, and proper hygienic disposal.
          </p>
        </div>

        <Link
          href="/guide"
          className="inline-flex items-center gap-2 bg-[#fdf7e7] text-[#7e0022] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white transition-transform hover:scale-105 shadow-md flex-shrink-0"
        >
          View Pad Guide <ArrowRight size={16} />
        </Link>
      </ScrollReveal>

    </div>
  );
}
