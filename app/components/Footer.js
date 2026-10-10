"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Footer Component
 * Dark forest-teal background with white text and clean layout.
 * Mirrors the top announcement bar as a framing block for the page.
 ************************************************************************/

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on all admin pages to keep admin pages clean
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#d0385c] text-white py-16 px-6 md:px-12 mt-auto border-t border-[#d0385c]/20 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        
        {/* Left Side: Brand Statement */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-3xl font-serif font-black tracking-[-0.05em] mb-4 uppercase text-[#fdf7e7]">
              COMFI
            </h3>
            <p className="text-sm text-[#fae3e5]/85 max-w-md leading-relaxed font-light mb-4">
              We engineer ultra-thin protection designed to eradicate leaks, irritation, and bulkiness. No compromises, no fluff. Just skin-safe, high-absorbency custom care for your cycle.
            </p>
          </div>
          <div className="text-xs text-[#fae3e5]/50">
            © {new Date().getFullYear()} COMFI Care. All rights reserved.
          </div>
        </div>

        {/* Right Side: Links & Contact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Shop Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#fdf7e7]/60 uppercase mb-2">Shop</h4>
            <Link href="/shop" className="text-sm text-[#fae3e5] hover:text-[#fdf7e7] transition-colors font-medium">Ultra Thin Pads</Link>
            <Link href="/quiz" className="text-sm text-[#fae3e5] hover:text-[#fdf7e7] transition-colors font-medium">Size Finder Quiz</Link>
            <Link href="/shop" className="text-sm text-[#fae3e5] hover:text-[#fdf7e7] transition-colors font-medium">Custom Packs</Link>
          </div>

          {/* Learn Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#fdf7e7]/60 uppercase mb-2">Learn</h4>
            <Link href="/ingredients" className="text-sm text-[#fae3e5] hover:text-[#fdf7e7] transition-colors font-medium">Ingredients</Link>
            <Link href="/guide" className="text-sm text-[#fae3e5] hover:text-[#fdf7e7] transition-colors font-medium">Pad Guide</Link>
            <span className="text-sm text-[#fae3e5]/65 font-medium">Our Story</span>
          </div>

          {/* Social / Contact */}
          <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
            <h4 className="text-[10px] font-bold tracking-[0.25em] text-[#fdf7e7]/60 uppercase mb-2">Connect</h4>
            <span className="text-sm text-[#fae3e5] font-medium break-all">support@comfi.com</span>
            <span className="text-sm text-[#fae3e5] font-medium">+91 98765 43210</span>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fae3e5] hover:text-[#fdf7e7] cursor-pointer">IG</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#fae3e5] hover:text-[#fdf7e7] cursor-pointer">FB</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#fae3e5] hover:text-[#fdf7e7] cursor-pointer">TW</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
