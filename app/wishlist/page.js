"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Wishlist (Favorites) Page
 * Features a warm cream page canvas, editorial titles, upgraded product
 * card grid, and a mint-sage empty favorites state.
 ************************************************************************/

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';

const FALLBACK_PRODUCTS = [
  { id: "prod_regular_10", name: "Comfi Ultra Thin - Regular", size: "Regular", length: "240mm", packCount: 10, price: 199, description: "Ultra-thin regular pads with wide wings designed for active daytime comfort.", reviews: [], stock: 120 },
  { id: "prod_large_10", name: "Comfi Ultra Thin - Large", size: "Large", length: "280mm", packCount: 10, price: 249, description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days.", reviews: [], stock: 85 },
  { id: "prod_xl_10", name: "Comfi Ultra Thin - XL", size: "XL", length: "320mm", packCount: 10, price: 299, description: "Extra-long pads optimized for heavy daytime or active protection.", reviews: [], stock: 60 },
  { id: "prod_overnight_10", name: "Comfi Ultra Thin - Overnight", size: "Overnight", length: "360mm", packCount: 10, price: 349, description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping.", reviews: [], stock: 45 }
];

export default function Wishlist() {
  const { wishlist, API_URL, user } = useApp();
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn("Backend offline, using fallback products for wishlist");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [API_URL]);

  const wishlistedProducts = products.filter(product => wishlist.includes(product.id));

  return (
    <div className="bg-[#fdf7e7] min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto select-none">
      
      {/* Title block */}
      <ScrollReveal className="mb-12 border-b border-[#d0385c]/10 pb-8">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-2 font-sans">Your Curated Choices</span>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">
          My Favorites
        </h1>
        <p className="text-sm text-[#3a3a3a]/75 max-w-xl mt-4 leading-relaxed font-light font-sans">
          Keep track of the sizes and custom configurations that make your cycle most comfortable. Tap any item to view its details or add it directly to your cart.
        </p>
      </ScrollReveal>

      {!user ? (
        /* Invitation to Sign In (mint sage background card) */
        <ScrollReveal className="max-w-md mx-auto text-center py-20 bg-[#fae3e5] rounded-3xl border border-[#d0385c]/10 p-8 mt-12 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#d0385c]/10 flex items-center justify-center text-[#d0385c] mx-auto mb-6">
            <Heart size={28} className="fill-[#d0385c] text-[#d0385c]" />
          </div>
          <h2 className="text-2xl font-serif font-black text-[#d0385c] mb-4 uppercase tracking-tighter">ACCESS YOUR WISHLIST</h2>
          <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light font-sans mb-8">
            Please log in or create an account to view and manage your saved favorites.
          </p>
          <Link 
            href="/account?redirect=/wishlist"
            className="bg-[#d0385c] text-white hover:bg-[#5c0018] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg inline-block"
          >
            Sign In or Sign Up
          </Link>
        </ScrollReveal>
      ) : loading ? (
        <div className="text-center py-24">
          <span className="text-xs font-bold tracking-widest text-[#d0385c] uppercase animate-pulse font-sans">Loading Favorites...</span>
        </div>
      ) : wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {wishlistedProducts.map(product => (
            <ScrollReveal key={product.id}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        /* Empty State (mint sage background card) */
        <ScrollReveal className="max-w-md mx-auto text-center py-20 bg-[#fae3e5] rounded-3xl border border-[#d0385c]/10 p-8 mt-12 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#d0385c]/10 flex items-center justify-center text-[#d0385c] mx-auto mb-6">
            <Heart size={28} className="fill-[#7e0022] text-[#7e0022]" />
          </div>
          <h2 className="text-2xl font-serif font-black text-[#d0385c] mb-4 uppercase tracking-tighter">YOUR WISHLIST IS EMPTY</h2>
          <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light font-sans mb-8">
            You haven't added any products to your favorites yet. Explore our ultra-thin options and click the heart icon to save them.
          </p>
          <Link 
            href="/shop"
            className="bg-[#d0385c] text-white hover:bg-[#5c0018] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg inline-block"
          >
            Explore products
          </Link>
        </ScrollReveal>
      )}

      {/* Return link */}
      {wishlistedProducts.length > 0 && (
        <div className="mt-8">
          <Link href="/shop" className="text-xs font-bold text-[#3a3a3a]/60 hover:text-[#d0385c] flex items-center gap-2 transition-colors uppercase tracking-widest font-sans">
            <ArrowLeft size={12} /> BACK TO STORE
          </Link>
        </div>
      )}

    </div>
  );
}
