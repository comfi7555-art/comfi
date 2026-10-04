"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Product Card Component
 * Featuring full-bleed flavor-locked pastel backgrounds, centered
 * circular illustrations, raw star ratings, and display serif titles.
 ************************************************************************/

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import HeartToggle from './HeartToggle';

// Custom SVG illustration for pad sizing inside a clean white circle
export function PadIllustration({ size, length, className = "" }) {
  const getAccentColor = () => {
    switch (size.toLowerCase()) {
      case 'regular': return '#cfa240'; // Warm yellow-gold
      case 'large': return '#598c25'; // Sage green
      case 'xl': return '#d32737'; // Cardinal red
      case 'overnight': return '#5f3a8c'; // Vintage grape purple
      default: return '#d0385c'; // Forest Ink
    }
  };

  const getSizingDetails = () => {
    switch (size.toLowerCase()) {
      case 'regular': return { wings: 'Standard Wings', padW: 75, padH: 140 };
      case 'large': return { wings: 'Double Wings', padW: 80, padH: 160 };
      case 'xl': return { wings: 'Enhanced Wings', padW: 85, padH: 180 };
      case 'overnight': return { wings: 'Wide Back Wings', padW: 95, padH: 200 };
      default: return { wings: 'Wings', padW: 80, padH: 160 };
    }
  };

  const details = getSizingDetails();
  const accentColor = getAccentColor();

  return (
    <div className={`relative w-full aspect-square bg-white rounded-full flex items-center justify-center overflow-hidden border border-[#d0385c]/5 shadow-xs ${className}`}>
      {/* Background patterns representing subtle absorbency dots */}
      <div className="absolute inset-0 opacity-5 flex flex-wrap gap-3 p-4 pointer-events-none justify-center items-center">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#d0385c]"></div>
        ))}
      </div>
      
      {/* Stylized Pad SVG Illustration */}
      <svg 
        width="110" 
        height="150" 
        viewBox="0 0 160 220" 
        className="img-premium drop-shadow-xs z-10 transition-transform duration-500"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Pad Body */}
        <rect 
          x={80 - details.padW / 2} 
          y={110 - details.padH / 2} 
          width={details.padW} 
          height={details.padH} 
          rx={details.padW / 2} 
          fill="#fdfdfd" 
          stroke={accentColor} 
          strokeWidth="3.5"
        />
        
        {/* Core Absorbent Area */}
        <rect 
          x={80 - (details.padW - 16) / 2} 
          y={110 - (details.padH - 24) / 2} 
          width={details.padW - 16} 
          height={details.padH - 24} 
          rx={(details.padW - 16) / 2} 
          fill={accentColor} 
          fillOpacity="0.12" 
          stroke={accentColor} 
          strokeWidth="1" 
          strokeDasharray="3 3"
        />

        {/* Wings */}
        <path 
          d={`M ${80 - details.padW / 2} 90 C 25 90, 25 130, ${80 - details.padW / 2} 130 Z`} 
          fill="#fdfdfd" 
          stroke={accentColor} 
          strokeWidth="2.5" 
        />
        <path 
          d={`M ${80 + details.padW / 2} 90 C 135 90, 135 130, ${80 + details.padW / 2} 130 Z`} 
          fill="#fdfdfd" 
          stroke={accentColor} 
          strokeWidth="2.5" 
        />

        {/* Wider back for overnight */}
        {size.toLowerCase() === 'overnight' && (
          <path 
            d="M 50 165 C 50 190, 110 190, 110 165 Z" 
            fill={accentColor} 
            fillOpacity="0.2" 
          />
        )}

        {/* Airflow channels */}
        <path 
          d={`M 80 ${110 - details.padH / 3} L 80 ${110 + details.padH / 3}`} 
          stroke={accentColor} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeDasharray="4 8"
        />
      </svg>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { reviews = [], name, price, size, length, packCount, id } = product;
  const { toggleWishlist, isInWishlist, user } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  
  const rating = reviews.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  // Map product sizes to sophisticated, muted backgrounds
  const getFlavorBgColor = (productSize) => {
    switch (productSize?.toLowerCase()) {
      case 'regular': return 'bg-[#fbf4de]'; // Soft warm vanilla
      case 'large': return 'bg-[#eef1e6]'; // Soft sage cream
      case 'xl': return 'bg-[#f6e4e5]'; // Soft blush rose
      case 'overnight': return 'bg-[#eceaef]'; // Soft lavender grey
      default: return 'bg-[#fae8dd]'; // Soft peach cream
    }
  };

  const handleWishlistChange = () => {
    if (!user) {
      alert("Please log in or sign up to add items to your wishlist.");
      router.push(`/account?redirect=${encodeURIComponent(pathname)}`);
    } else {
      toggleWishlist(id);
    }
  };

  return (
    <div className="relative">
      <HeartToggle 
        id={id} 
        checked={isInWishlist(id)} 
        onChange={handleWishlistChange} 
        className="absolute top-8 left-8 z-30 pointer-events-auto" 
      />
      
      <Link 
        href={`/product/${id}`}
        className={`group block ${getFlavorBgColor(size)} rounded-2xl p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer border-0 shadow-none hover:scale-[1.02]`}
      >
        {/* Product Image Crop (white circle) */}
        <div className="w-full aspect-square mb-6">
          <PadIllustration size={size} length={length} />
        </div>

        {/* Product Metadata */}
        <div className="text-center flex flex-col items-center">
          {/* Five Forest-Teal Stars */}
          <div className="flex items-center gap-1 text-[#d0385c]/70 mb-2">
            <div className="flex gap-0.5">
              <Star size={11} fill="#d0385c" className="text-[#d0385c]" />
              <Star size={11} fill="#d0385c" className="text-[#d0385c]" />
              <Star size={11} fill="#d0385c" className="text-[#d0385c]" />
              <Star size={11} fill="#d0385c" className="text-[#d0385c]" />
              <Star size={11} fill="#d0385c" className="text-[#d0385c]" />
            </div>
            <span className="text-[11px] font-bold font-sans ml-1 text-[#d0385c]">{rating}</span>
          </div>

          {/* Product Name (WindsorEF display serif style) */}
          <h3 className="text-xl md:text-2xl font-serif font-black tracking-tighter text-[#d0385c] mb-1 leading-none text-center">
            {name}
          </h3>

          <span className="text-xs font-semibold tracking-wider text-[#3a3a3a]/75 uppercase mb-3">
            {packCount} Pack • {length}
          </span>

          {/* Bottom Row - Price & Shop Button */}
          <div className="flex justify-between items-center w-full mt-4 pt-4 border-t border-[#d0385c]/10">
            <span className="text-lg font-black text-[#d0385c]">
              ₹{price}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#d0385c] bg-white px-4 py-2 rounded-full group-hover:bg-[#d0385c]/10 transition-colors duration-300 shadow-2xs">
              Shop <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
