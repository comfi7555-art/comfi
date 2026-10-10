import React from 'react';

export default function FloatingBadge({ text = "BEST SELLER", subtext = "ULTRA THIN", className = "" }) {
  return (
    <div 
      className={`w-[160px] h-[160px] rounded-full bg-[#d0385c] flex flex-col items-center justify-center text-white text-center p-4 select-none shadow-xl animate-bounce-slow border-2 border-white/30 ${className}`}
    >
      <span className="utility-label text-[11px] leading-none mb-1.5 text-white font-black tracking-widest">{text}</span>
      <div className="w-10 h-[1.5px] bg-white/40 my-1"></div>
      <span className="font-extrabold text-[11px] tracking-widest text-white uppercase leading-tight">{subtext}</span>
    </div>
  );
}
