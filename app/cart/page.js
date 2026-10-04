"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Shopping Cart Page
 * Features a warm cream page canvas, mint-sage cart item list panels,
 * cream internal dividers, and forest-teal buttons with soft shadows.
 ************************************************************************/

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal, user } = useApp();
  const router = useRouter();

  const handleCheckoutRedirect = () => {
    if (!user) {
      alert("Please log in or sign up to complete your checkout.");
      router.push('/account?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="bg-[#fdf7e7] min-h-[85vh] py-12 px-6 md:px-12 max-w-5xl mx-auto select-none">
      
      {/* Page Title */}
      <ScrollReveal className="mb-12 border-b border-[#d0385c]/10 pb-8">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-2 font-sans">Shopping Bag</span>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#d0385c] tracking-tighter uppercase">
          Your Cart
        </h1>
      </ScrollReveal>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Cart Items List - Left */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {cart.map(item => (
              <div 
                key={item.cartItemId} 
                className="bg-[#fae3e5] rounded-3xl p-6 border border-[#d0385c]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xs"
              >
                
                {/* Item Details */}
                <div className="w-full sm:w-auto">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#7e0022] uppercase block mb-1">
                    {item.size} • {item.packCount} Pads
                  </span>
                  <h3 className="text-xl font-serif font-black text-[#d0385c] mb-2 leading-tight">
                    {item.name}
                  </h3>
                  
                  {/* Custom Bundle Breakdown */}
                  {item.customPackDetails && (
                    <div className="bg-[#fdf7e7] p-4 rounded-2xl border border-[#d0385c]/10 text-xs text-[#3a3a3a]/80 mb-3 shadow-2xs">
                      <span className="font-bold text-[#d0385c] mb-1.5 block">Box Stack:</span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(item.customPackDetails).map(([sz, qty]) => (
                          <div key={sz} className="flex justify-between w-full border-b border-[#d0385c]/5 py-0.5">
                            <span className="font-medium text-[#d0385c]/70">{sz}:</span>
                            <span className="font-bold text-[#d0385c]">{qty} pads</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-lg font-bold text-[#d0385c]">
                    ₹{item.price} <span className="text-xs font-light text-[#3a3a3a]/50">per pack</span>
                  </div>
                </div>

                {/* Actions & Quantity */}
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  
                  {/* Quantity Adjuster (cream colored background) */}
                  <div className="flex items-center gap-3 bg-[#fdf7e7] px-3.5 py-1.5 rounded-full border border-[#d0385c]/10">
                    <button 
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 text-[#d0385c] hover:text-[#7e0022] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm w-6 text-center text-[#d0385c] font-sans">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-1 text-[#d0385c] hover:text-[#7e0022] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-[#3a3a3a]/40 hover:text-red-600 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Cart Summary - Right (mint sage background card) */}
          <div className="bg-[#fae3e5] rounded-3xl p-8 border border-[#d0385c]/15 shadow-2xs">
            <h3 className="text-[10px] font-bold tracking-[0.25em] text-[#d0385c]/50 mb-6 uppercase">Order Summary</h3>
            
            <div className="flex justify-between py-3 border-b border-[#d0385c]/10 text-sm">
              <span className="text-[#3a3a3a]/80 font-medium font-sans">Subtotal</span>
              <span className="font-bold text-[#d0385c]">₹{getCartTotal()}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-[#d0385c]/10 text-sm">
              <span className="text-[#3a3a3a]/80 font-medium font-sans">Shipping</span>
              <span className="font-bold text-[#7e0022] text-xs uppercase tracking-wide">FREE</span>
            </div>

            <div className="flex justify-between py-6 text-lg font-serif font-black text-[#d0385c] border-b border-[#d0385c]/10">
              <span>Estimated Total</span>
              <span>₹{getCartTotal()}</span>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full bg-[#d0385c] text-white hover:bg-[#5c0018] py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>
            
            <Link 
              href="/shop" 
              className="w-full text-center text-xs font-bold uppercase tracking-widest text-[#3a3a3a]/60 hover:text-[#d0385c] mt-4 block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      ) : (
        /* Empty Cart State */
        <ScrollReveal className="text-center py-24 bg-[#fae3e5] rounded-3xl border border-[#d0385c]/10 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#d0385c]/10 flex items-center justify-center text-[#d0385c] mx-auto mb-6">
            <ShoppingCart size={28} />
          </div>
          <h2 className="text-3xl font-serif font-black text-[#d0385c] mb-4 uppercase tracking-tighter">YOUR BAG IS EMPTY</h2>
          <p className="text-sm text-[#3a3a3a]/80 mb-8 max-w-sm mx-auto font-light font-sans leading-relaxed">
            You haven't added any products to your cart yet. Explore our ultra-thin pad options and find your perfect size.
          </p>
          <Link 
            href="/shop" 
            className="bg-[#d0385c] text-white hover:bg-[#5c0018] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest inline-block shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Start Shopping
          </Link>
        </ScrollReveal>
      )}

    </div>
  );
}
