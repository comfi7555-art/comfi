"use client";
/************************************************************************

 * Featuring warm cream paper canvas, mint-sage inset panels, bold serif
 * Playfair Display titles, pill CTAs, and a D2C visual layout.
 ************************************************************************/

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from './context/AppContext';
import ScrollReveal from './components/ScrollReveal';
import ProductCard from './components/ProductCard';
import FAQ from './components/FAQ';
import { ArrowRight, ShieldCheck, Heart, Wind, Star, Sparkles } from 'lucide-react';

const FALLBACK_PRODUCTS = [
  { id: "prod_regular_10", name: "Comfi Ultra Thin - Regular", size: "Regular", length: "240mm", packCount: 10, price: 199, description: "Ultra-thin regular pads with wide wings designed for active daytime comfort.", reviews: [] },
  { id: "prod_large_10", name: "Comfi Ultra Thin - Large", size: "Large", length: "280mm", packCount: 10, price: 249, description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days.", reviews: [] },
  { id: "prod_xl_10", name: "Comfi Ultra Thin - XL", size: "XL", length: "320mm", packCount: 10, price: 299, description: "Extra-long pads optimized for heavy daytime or active protection.", reviews: [] },
  { id: "prod_overnight_10", name: "Comfi Ultra Thin - Overnight", size: "Overnight", length: "360mm", packCount: 10, price: 349, description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping.", reviews: [] }
];

export default function Home() {
  const { API_URL } = useApp();
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    async function getProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn("Backend API offline, using fallback products");
      }
    }
    getProducts();
  }, [API_URL]);

  return (
    <div className="bg-[#fdf7e7] text-[#3a3a3a] w-full min-h-screen -mt-8 overflow-x-hidden font-sans select-none relative pb-12">
      
      {/* ========================================================
          DESKTOP VIEW (Large viewports - Split Layout with Poster Panel)
         ======================================================== */}
      <section className="hidden lg:flex relative min-h-[90vh] w-full items-center px-16 bg-transparent overflow-visible gap-8">
        
        {/* Left Column: Headline, Subhead, CTA */}
        <div className="w-[55%] flex flex-col justify-center pr-8 z-10 relative py-12">
          <div className="flex flex-col gap-6 max-w-xl">
            <ScrollReveal delay={100}>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase">
                A NEW KIND OF CYCLE CARE
              </span>
              <h1 className="text-[4.8vw] font-serif font-black text-[#d0385c] leading-[1.0] tracking-tighter mt-2">
                The Ultra-Thin Pad,<br />
                Perfected.
              </h1>
            </ScrollReveal>
 
            <ScrollReveal delay={250}>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold tracking-[0.2em] text-[#d0385c]/75 uppercase">
                  Unseen. Unfelt. Unstoppable.
                </p>
                <p className="text-lg text-[#3a3a3a] font-light leading-relaxed max-w-md">
                  Experience the science of discretion with COMFI Ultra-Thin sanitary pads — zero bulk, zero rashes.
                </p>
              </div>
            </ScrollReveal>
 
            <ScrollReveal delay={400} className="w-full max-w-md">
              <div className="flex gap-4 w-full mt-2">
                <Link 
                  href="/shop" 
                  className="flex-1 py-4 bg-[#d0385c] text-white font-bold text-center text-xs tracking-[0.2em] rounded-full uppercase transition-all duration-300 hover:bg-[#5c0018] active:scale-95 flex items-center justify-center shadow-lg"
                >
                  Shop Now
                </Link>
                <Link 
                  href="/quiz" 
                  className="flex-1 py-4 bg-[#febac4] text-[#d0385c] font-bold text-center text-xs tracking-[0.2em] rounded-full uppercase transition-all duration-300 hover:bg-[#e29fa7] active:scale-95 flex items-center justify-center shadow-xs"
                >
                  Take the Fit Quiz
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
 
        {/* Right Column: Hero Illustration (Single Image) */}
        <div className="w-[45%] relative h-[75vh] flex items-center justify-center overflow-visible pr-8">
          <ScrollReveal delay={550} className="relative w-full h-[95%] overflow-hidden rounded-3xl border border-[#d0385c]/10 shadow-md">
            <img 
              src="/Gemini_Generated_Image_m2t9phm2t9phm2t9.png" 
              alt="COMFI Essential Packaging"
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none" 
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          MOBILE VIEW (Small/Medium viewports - Vertical Stack)
         ======================================================== */}
      <section className="lg:hidden flex flex-col w-full px-6 pb-12 gap-6 bg-transparent">
        
        {/* Headline */}
        <ScrollReveal delay={100}>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#7e0022] uppercase block mt-6">
            A NEW KIND OF CYCLE CARE
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-[#d0385c] leading-[1.0] tracking-tighter mt-2">
            The Ultra-Thin Pad,<br />
            Perfected.
          </h1>
        </ScrollReveal>
 
        {/* Subhead & Supporting Copy */}
        <ScrollReveal delay={200}>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold tracking-[0.2em] text-[#d0385c]/75 uppercase">
              Unseen. Unfelt. Unstoppable.
            </p>
            <p className="text-base font-light text-[#3a3a3a] leading-relaxed">
              Experience the science of discretion with COMFI Ultra-Thin.
            </p>
          </div>
        </ScrollReveal>
 
        {/* Mobile hero image panel */}
        <ScrollReveal delay={300} className="w-full aspect-square relative overflow-hidden rounded-3xl mt-4 mb-4 border border-[#d0385c]/10 shadow-xs">
          <img 
            src="/Gemini_Generated_Image_m2t9phm2t9phm2t9.png" 
            alt="Product Images" 
            className="w-full h-full object-cover select-none"
          />
        </ScrollReveal>
 
        {/* Two Pill Buttons Side-by-Side */}
        <ScrollReveal delay={400} className="w-full">
          <div className="flex gap-3 mt-2">
            <Link 
              href="/shop" 
              className="flex-1 py-4 bg-[#d0385c] text-white font-bold text-center text-xs tracking-[0.15em] rounded-full uppercase transition-all duration-300 hover:bg-[#5c0018] active:scale-95 flex items-center justify-center shadow-md"
            >
              Shop Now
            </Link>
            <Link 
              href="/quiz" 
              className="flex-1 py-4 bg-[#febac4] text-[#d0385c] font-bold text-center text-xs tracking-[0.15em] rounded-full uppercase transition-all duration-300 hover:bg-[#e29fa7] active:scale-95 flex items-center justify-center shadow-2xs"
            >
              Take Quiz
            </Link>
          </div>
        </ScrollReveal>
      </section>
 
      {/* ========================================================
          BELOW THE FOLD SECTIONS
         ======================================================== */}
 
      {/* Why Choose COMFI? 3 Column Grid */}
      <section className="bg-transparent py-24 px-6 md:px-12 border-t border-[#e3e3e3]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d0385c]/70">Engineered Comfort</span>
            <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#d0385c] tracking-tighter mt-2">
              Why Choose COMFI?
            </h2>
          </ScrollReveal>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0} className="bg-white p-8 border border-[#e3e3e3] flex flex-col items-center text-center rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:border-[#d0385c]/20">
              <div className="w-16 h-16 rounded-full bg-[#fae3e5] flex items-center justify-center text-[#d0385c] mb-6 shadow-2xs">
                <Wind size={28} />
              </div>
              <h3 className="text-xl font-serif font-black tracking-tight text-[#d0385c] mb-3">Ultra Thin Design</h3>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light font-sans">
                Less than 2mm thick. Say goodbye to the bulky, diaper-like feel of traditional sanitary pads. Perfect discreet comfort.
              </p>
            </ScrollReveal>
 
            <ScrollReveal delay={150} className="bg-white p-8 border border-[#e3e3e3] flex flex-col items-center text-center rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:border-[#d0385c]/20">
              <div className="w-16 h-16 rounded-full bg-[#fae3e5] flex items-center justify-center text-[#d0385c] mb-6 shadow-2xs">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-serif font-black tracking-tight text-[#d0385c] mb-3">Skin Safe Top Layer</h3>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light font-sans">
                Hypoallergenic, breathable, organic cotton feel top sheet. Designed to prevent friction, perspiration, and rashes.
              </p>
            </ScrollReveal>
 
            <ScrollReveal delay={300} className="bg-white p-8 border border-[#e3e3e3] flex flex-col items-center text-center rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:border-[#d0385c]/20">
              <div className="w-16 h-16 rounded-full bg-[#fae3e5] flex items-center justify-center text-[#d0385c] mb-6 shadow-2xs">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-serif font-black tracking-tight text-[#d0385c] mb-3">Leak-Free Channels</h3>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light font-sans">
                Custom-routed absorption channels locking heavy flow instantly. Extended wings ensure zero shifting and side leaks.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
 
      {/* Flavor Card Product Gallery */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
        <ScrollReveal className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d0385c]/70">The Collection</span>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#d0385c] tracking-tighter mt-2">
            Tailored Protection for Every Day
          </h2>
        </ScrollReveal>
 
        {/* Staggered Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product, idx) => {
            const stagerClass = idx % 2 === 1 && idx < 4 ? 'lg:mt-8' : '';
            return (
              <ScrollReveal key={product.id} className={stagerClass} delay={idx * 100}>
                <ProductCard product={product} />
              </ScrollReveal>
            );
          })}
        </div>
      </section>
 
      {/* Testimonials Grid Section */}
      <section className="bg-transparent py-24 px-6 md:px-12 border-t border-[#e3e3e3]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d0385c]/70">Real Experiences</span>
            <h2 className="text-4xl font-serif font-black text-[#d0385c] tracking-tighter mt-2">
              Loved By Women Nationwide
            </h2>
          </ScrollReveal>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0} className="bg-white p-8 border border-[#e3e3e3] rounded-2xl transition-all duration-300">
              <div className="flex gap-0.5 text-[#d0385c] mb-4">
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
              </div>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed italic mb-6 font-light font-sans">
                "I was skeptical about the 0.8mm claim, but it's completely true. They feel like absolutely nothing is there, yet they absorb like normal pads. Zero rashes so far!"
              </p>
              <div className="font-bold text-[10px] tracking-widest text-[#d0385c] uppercase font-sans">- Sarah M.</div>
            </ScrollReveal>
 
            <ScrollReveal delay={150} className="bg-white p-8 border border-[#e3e3e3] rounded-2xl transition-all duration-300">
              <div className="flex gap-0.5 text-[#d0385c] mb-4">
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
              </div>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed italic mb-6 font-light font-sans">
                "The custom pack builder is a lifesaver. I get 15 Regulars for day wear and 10 Overnights for sleep. Saved me so much money and I don't have to buy multiple boxes anymore."
              </p>
              <div className="font-bold text-[10px] tracking-widest text-[#d0385c] uppercase font-sans">- Priya R.</div>
            </ScrollReveal>
 
            <ScrollReveal delay={300} className="bg-white p-8 border border-[#e3e3e3] rounded-2xl transition-all duration-300">
              <div className="flex gap-0.5 text-[#d0385c] mb-4">
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
                <Star size={14} fill="#d0385c" className="text-[#d0385c]" />
              </div>
              <p className="text-sm text-[#3a3a3a]/80 leading-relaxed italic mb-6 font-light font-sans">
                "Very soft and didn't slide around at all when working out. I highly recommend taking their Fit Quiz, it recommended the Large size and it was spot on."
              </p>
              <div className="font-bold text-[10px] tracking-widest text-[#d0385c] uppercase font-sans">- Aisha K.</div>
            </ScrollReveal>
          </div>
        </div>
      </section>
 
      {/* FAQ Component Section */}
      <section className="bg-transparent py-12 border-t border-[#e3e3e3]">
        <ScrollReveal>
          <FAQ />
        </ScrollReveal>
      </section>
 
      {/* Rewards Feature Section - 2 Column Layout with Circular Image Crop */}
      <section className="bg-transparent py-24 px-6 md:px-12 border-t border-[#e3e3e3]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left Column: Perfectly Round Crop mask for illustration */}
          <ScrollReveal className="w-full md:w-1/2 flex justify-center">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#febac4] border border-[#d0385c]/5 flex items-center justify-center p-6 shadow-2xs relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#7e0022]"></div>
                ))}
              </div>
              
              {/* Retro floating icons representing period profile / sparkle */}
              <div className="bg-white p-8 rounded-full aspect-square w-3/4 flex items-center justify-center shadow-xs border border-[#d0385c]/10 animate-product-float">
                <Sparkles size={72} className="text-[#7e0022] stroke-[1.5]" />
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Wine-red accent label, display heading, bright-teal CTA button */}
          <div className="w-full md:w-1/2 flex flex-col items-start text-left">
            <ScrollReveal>
              <span className="text-xs font-bold tracking-[0.2em] text-[#7e0022] uppercase mb-3 block">
                CHERRY ON TOP
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tighter text-[#d0385c] mb-4">
                Find Your Perfect Fit in 60 Seconds
              </h2>
              <p className="text-base font-light text-[#3a3a3a] mb-8 leading-relaxed">
                Answer 4 simple questions about your flow pattern, skin sensitivity, and activity levels. Get an automated recommendation customized for your body.
              </p>
              <Link 
                href="/quiz" 
                className="bg-[#febac4] text-[#d0385c] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:bg-[#e29fa7] active:scale-95 transition-all shadow-md"
              >
                Start Size Quiz <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

    </div>
  );
}
