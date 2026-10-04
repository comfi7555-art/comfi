"use client";

import React from 'react';
import { Heart } from 'lucide-react';

export default function HeartToggle({ id, checked, onChange, className = "", size = "small" }) {
  // Prevent click events from propagating to parent links/containers
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const isLarge = size === "large";

  return (
    <button
      type="button"
      onClick={(e) => {
        handleContainerClick(e);
        onChange();
      }}
      className={`group/heart flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer z-30 ${
        isLarge ? "w-11 h-11" : "w-8 h-8"
      } ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={checked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={isLarge ? 20 : 15}
        className={`transition-all duration-300 ${
          checked
            ? "fill-[#8B5967] text-[#8B5967] scale-110"
            : "text-[#8B5967]/60 group-hover/heart:text-[#8B5967] group-hover/heart:scale-110"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
