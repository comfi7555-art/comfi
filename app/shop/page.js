"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Shop Page
 * Warm cream page canvas, editorial serif headers, and pill filters
 * that control the catalog view. Integrates the custom bundler.
 ************************************************************************/

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import BuildYourOwnPack from '../components/BuildYourOwnPack';

const FALLBACK_PRODUCTS = [
  { id: "prod_regular_10", name: "Comfi Ultra Thin - Regular", size: "Regular", length: "240mm", packCount: 10, price: 199, description: "Ultra-thin regular pads with wide wings designed for active daytime comfort.", reviews: [], stock: 120 },
  { id: "prod_large_10", name: "Comfi Ultra Thin - Large", size: "Large", length: "280mm", packCount: 10, price: 249, description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days.", reviews: [], stock: 85 },
  { id: "prod_xl_10", name: "Comfi Ultra Thin - XL", size: "XL", length: "320mm", packCount: 10, price: 299, description: "Extra-long pads optimized for heavy daytime or active protection.", reviews: [], stock: 60 },
  { id: "prod_overnight_10", name: "Comfi Ultra Thin - Overnight", size: "Overnight", length: "360mm", packCount: 10, price: 349, description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping.", reviews: [], stock: 45 }
];

export default function Shop() {
  const { API_URL } = useApp();
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPacks, setSelectedPacks] = useState([]);

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
        console.warn("Backend offline, using fallback products");
      }
    }
    fetchProducts();
  }, [API_URL]);

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handlePackToggle = (pack) => {
    setSelectedPacks(prev => 
      prev.includes(pack) ? prev.filter(p => p !== pack) : [...prev, pack]
    );
  };

  const handleClearAll = () => {
    setSelectedSizes([]);
    setSelectedPacks([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.size);
    const matchesPack = selectedPacks.length === 0 || selectedPacks.includes(String(product.packCount));
    return matchesSize && matchesPack;
  });

  return (
    <div className="bg-[#fdf7e7] min-h-screen py-12 px-6 md:px-12 max-w-7xl mx-auto select-none">
      
      {/* Editorial Title */}
      <ScrollReveal className="mb-12 border-b border-[#d0385c]/10 pb-8">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-2">COMFI STOREFRONT</span>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">
          Select Your Protection
        </h1>
        <p className="text-sm text-[#3a3a3a]/75 max-w-xl mt-4 leading-relaxed font-light font-sans">
          Ultra-thin sanitary pads manufactured under the highest standards of safety. Choose a pre-seeded size or custom mix your pack below.
        </p>
      </ScrollReveal>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-12 mb-24">
        
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white/50 border border-[#d0385c]/10 rounded-2xl p-6 shadow-sm sticky top-24">
            
            <div className="flex items-center justify-between mb-8 border-b border-[#d0385c]/10 pb-4">
              <h3 className="font-serif font-black text-[#d0385c] tracking-tight text-xl">Filters</h3>
              {(selectedSizes.length > 0 || selectedPacks.length > 0) && (
                <button 
                  onClick={handleClearAll}
                  className="text-xs font-bold text-[#3a3a3a]/50 hover:text-[#d0385c] uppercase tracking-wider transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Size Filters */}
            <div className="mb-8">
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#3a3a3a]/50 mb-4 block uppercase">Size</span>
              <div className="flex flex-col gap-3">
                {['Regular', 'Large', 'XL', 'Overnight'].map(size => (
                  <label key={size} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedSizes.includes(size) ? 'bg-[#d0385c] border-[#d0385c]' : 'bg-white border-[#d0385c]/30 group-hover:border-[#d0385c]/60'}`}>
                      {selectedSizes.includes(size) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedSizes.includes(size) ? 'font-bold text-[#d0385c]' : 'text-[#3a3a3a]'} transition-colors`}>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pack Count Filters */}
            <div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#3a3a3a]/50 mb-4 block uppercase">Pack Count</span>
              <div className="flex flex-col gap-3">
                {['10', '20'].map(count => (
                  <label key={count} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedPacks.includes(count) ? 'bg-[#d0385c] border-[#d0385c]' : 'bg-white border-[#d0385c]/30 group-hover:border-[#d0385c]/60'}`}>
                      {selectedPacks.includes(count) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${selectedPacks.includes(count) ? 'font-bold text-[#d0385c]' : 'text-[#3a3a3a]'} transition-colors`}>{count} Pads</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ScrollReveal key={product.id}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-[#3a3a3a]/50 font-light font-sans bg-white/30 rounded-2xl border border-[#d0385c]/10">
                No products found matching the selected filters.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Custom Pack Bundler Showcase */}
      <ScrollReveal className="mt-16">
        <BuildYourOwnPack products={products} />
      </ScrollReveal>

    </div>
  );
}
