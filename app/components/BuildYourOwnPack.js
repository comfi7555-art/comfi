"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Custom Pack Builder
 * Features a mint-sage (#fae3e5) wrapper panel, cream size selectors,
 * a cardboard live preview drawer, and forest-teal button with white text.
 ************************************************************************/

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Sparkles } from 'lucide-react';

export default function BuildYourOwnPack({ products }) {
  const { addToCart, user } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [quantities, setQuantities] = useState({
    Regular: 0,
    Large: 0,
    XL: 0,
    Overnight: 0
  });

  const handleIncrement = (size) => {
    setQuantities(prev => ({
      ...prev,
      [size]: prev[size] + 5
    }));
  };

  const handleDecrement = (size) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, prev[size] - 5)
    }));
  };

  const totalPads = Object.values(quantities).reduce((a, b) => a + b, 0);

  const getPadUnitPrice = (size) => {
    switch (size) {
      case 'Regular': return 19.9;
      case 'Large': return 24.9;
      case 'XL': return 29.9;
      case 'Overnight': return 34.9;
      default: return 20;
    }
  };

  const rawPrice = Object.entries(quantities).reduce((sum, [size, qty]) => {
    return sum + (qty * getPadUnitPrice(size));
  }, 0);

  const discount = totalPads >= 20 ? rawPrice * 0.10 : 0;
  const finalPrice = Math.round(rawPrice - discount);

  const handleAddBundle = () => {
    if (!user) {
      alert("Please log in or sign up to compile and purchase a custom pack.");
      router.push(`/account?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (totalPads < 10) {
      alert("Please select at least 10 pads to build a custom pack.");
      return;
    }

    const bundleItem = {
      id: `custom_bundle_${Date.now()}`,
      name: "Custom Comfi Bundle",
      size: "Custom Mix",
      packCount: totalPads,
      price: finalPrice,
      stock: 100
    };

    const details = Object.entries(quantities).reduce((acc, [size, qty]) => {
      if (qty > 0) acc[size] = qty;
      return acc;
    }, {});

    addToCart(bundleItem, 1, details);
    
    setQuantities({
      Regular: 0,
      Large: 0,
      XL: 0,
      Overnight: 0
    });
    alert("Your custom bundle has been added to the cart!");
  };

  return (
    <div className="bg-[#fae3e5] rounded-3xl p-8 border border-[#d0385c]/10 select-none shadow-xs">
      {/* Title block */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-[#d0385c]" size={24} />
        <h3 className="text-3xl font-serif font-black tracking-tighter text-[#d0385c]">
          BUILD YOUR OWN PACK
        </h3>
      </div>
      <p className="text-sm text-[#3a3a3a]/80 mb-8 leading-relaxed max-w-xl">
        Mix and match sizes based on your flow cycle. Choose a minimum of 10 pads. Get a <span className="font-bold text-[#7e0022]">10% bundle discount</span> when you select 20 or more pads!
      </p>

      {/* Grid of sizes & Live Visual Box Preview */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-8">
        
        {/* Left Side: Builder Controls */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['Regular', 'Large', 'XL', 'Overnight'].map(size => {
            const qty = quantities[size];
            const length = size === 'Regular' ? '240mm' : size === 'Large' ? '280mm' : size === 'XL' ? '320mm' : '360mm';
            
            // OLIPOP flavor backgrounds
            const padBg = size === 'Regular' ? 'bg-[#fdf4b5] border-[#fdf4b5]/40' : size === 'Large' ? 'bg-[#a9df71] border-[#a9df71]/40' : size === 'XL' ? 'bg-[#febac4] border-[#febac4]/40' : 'bg-[#e3d2ed] border-[#e3d2ed]/40';
            const labelColor = size === 'Regular' ? 'text-[#b58c20]' : size === 'Large' ? 'text-[#3e6616]' : size === 'XL' ? 'text-[#a81c2a]' : 'text-[#4c277a]';
            
            return (
              <div key={size} className={`rounded-2xl p-6 border flex flex-col items-center justify-between transition-all duration-300 hover:scale-[1.01] ${padBg}`}>
                <div className="text-center">
                  <span className={`utility-label ${labelColor} font-bold mb-1 block`}>{length}</span>
                  <span className="text-xl font-serif font-black text-[#d0385c] mb-4 block">{size}</span>
                </div>
                
                {/* Quantity Controls (cream colored background) */}
                <div className="flex items-center gap-4 bg-[#fdf7e7] px-4 py-2 rounded-full border border-[#d0385c]/10">
                  <button 
                    onClick={() => handleDecrement(size)}
                    className="p-1 text-[#d0385c] hover:text-[#7e0022] transition-colors duration-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-[#d0385c] font-sans">{qty}</span>
                  <button 
                    onClick={() => handleIncrement(size)}
                    className="p-1 text-[#d0385c] hover:text-[#7e0022] transition-colors duration-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Live Visual Box Preview */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-[#fdf7e7] rounded-2xl p-6 border border-[#d0385c]/10 shadow-xs flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full text-center">
            <span className="text-[10px] font-bold tracking-widest text-[#3a3a3a]/40 mb-1 block uppercase">Live Preview</span>
            <h4 className="text-sm font-serif font-black tracking-wider uppercase text-[#d0385c]">YOUR CUSTOM BOX</h4>
          </div>
          
          {/* Packaging Box Container (mint background, dashed lines) */}
          <div className="relative w-44 h-56 border-2 border-dashed border-[#d0385c]/20 rounded-2xl bg-[#fae3e5]/45 flex flex-col-reverse overflow-hidden justify-start p-2 gap-1.5 shadow-inner">
            {totalPads === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[10px] text-[#d0385c]/45 font-bold uppercase tracking-widest">Empty Box</span>
                <span className="text-[9px] text-[#3a3a3a]/40 mt-1">Add pads to visualize your custom stack!</span>
              </div>
            ) : (
              Object.entries(quantities).map(([size, qty]) => {
                if (qty === 0) return null;
                
                // Flavor-locked colors inside box stack
                const color = size === 'Regular' ? 'bg-[#fdf4b5] text-[#d0385c]' : size === 'Large' ? 'bg-[#a9df71] text-[#d0385c]' : size === 'XL' ? 'bg-[#febac4] text-[#d0385c]' : 'bg-[#e3d2ed] text-[#d0385c]';
                const heightPercent = `${(qty / totalPads) * 100}%`;
                const subLabel = size === 'Regular' ? 'Light Days' : size === 'Large' ? 'Medium Days' : size === 'XL' ? 'Active/Heavy' : 'Sleep/Night';
                
                return (
                  <div 
                    key={size} 
                    className={`${color} rounded-xl flex flex-col items-center justify-center text-[10px] font-bold tracking-widest uppercase transition-all duration-300 shadow-2xs border border-[#d0385c]/10 hover:scale-[1.02] p-1`}
                    style={{ height: heightPercent, minHeight: '38px' }}
                  >
                    <div className="flex justify-between w-full px-1">
                      <span>{size.substring(0, 3)}</span>
                      <span>({qty})</span>
                    </div>
                    <span className="text-[8px] font-normal tracking-normal opacity-70 block mt-0.5 normal-case truncate max-w-full">
                      {subLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="w-full text-center text-[11px] font-bold">
            {totalPads < 10 ? (
              <span className="text-[#7e0022] uppercase tracking-wider">Add {10 - totalPads} more pads!</span>
            ) : (
              <span className="text-[#d0385c] uppercase tracking-wider">✓ Pack Ready ({totalPads} pads)</span>
            )}
          </div>
        </div>

      </div>

      {/* Pricing and Action summary */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[#d0385c]/10 gap-6">
        <div className="text-center sm:text-left">
          <div className="text-xs font-bold tracking-widest text-[#3a3a3a]/60 uppercase">
            Total Pads Selected: <span className="text-[#d0385c] font-bold">{totalPads}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1 justify-center sm:justify-start">
            <span className="text-3xl font-serif font-black text-[#d0385c]">₹{finalPrice}</span>
            {discount > 0 && (
              <>
                <span className="text-sm line-through text-[#3a3a3a]/40">₹{Math.round(rawPrice)}</span>
                <span className="text-xs font-bold uppercase text-white bg-[#7e0022] px-2 py-0.5 rounded">10% OFF</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleAddBundle}
          disabled={totalPads < 10}
          className={`px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
            totalPads >= 10 
              ? 'bg-[#d0385c] text-white hover:bg-[#5c0018] cursor-pointer' 
              : 'bg-[#d0385c]/10 text-[#d0385c]/30 cursor-not-allowed border border-[#d0385c]/10'
          }`}
        >
          Add Custom Bundle to Cart
        </button>
      </div>
    </div>
  );
}
