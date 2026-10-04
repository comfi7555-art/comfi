import React from 'react';

export default function FloatingBadge({ text = "BEST SELLER", subtext = "ULTRA THIN", className = "" }) {
  return (
    <div 
      className={`w-[160px] h-[160px] rounded-full bg-accent flex flex-col items-center justify-center text-primaryText text-center p-4 select-none shadow-lg animate-bounce-slow border border-[#262626]/10 ${className}`}
    >
      <span className="utility-label text-[10px] leading-none mb-1 text-[#262626] font-black">{text}</span>
      <div className="w-8 h-[1px] bg-[#262626]/20 my-1"></div>
      <span className="font-bold text-[12px] tracking-widest text-[#262626] uppercase">{subtext}</span>
    </div>
  );
}
