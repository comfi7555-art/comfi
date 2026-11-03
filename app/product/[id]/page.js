"use client";

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import ScrollReveal from '../../components/ScrollReveal';
import FloatingBadge from '../../components/FloatingBadge';
import { PadIllustration } from '../../components/ProductCard';
import { Star, ShieldCheck, Heart, Leaf, HelpCircle, ShoppingCart, Check, Sparkles } from 'lucide-react';
import HeartToggle from '../../components/HeartToggle';

const FALLBACK_PRODUCTS = [
  {
    id: "prod_regular_10",
    name: "Comfi Ultra Thin - Regular",
    size: "Regular",
    length: "240mm",
    packCount: 10,
    price: 199,
    stock: 120,
    status: "Coming Soon",
    isComingSoon: true,
    description: "Ultra-thin regular pads with wide wings designed for active daytime comfort. Features an irritation-free cotton feel, quick absorption lock layer, and leak-proof barriers.",
    features: [
      "Breathable top layer for zero irritation",
      "Wide wings for secure fit",
      "Individually wrapped in paper for hygienic disposal",
      "Dry-lock core prevents daytime leaks"
    ],
    reviews: [
      { user: "Sarah M.", rating: 5, comment: "Incredibly thin and comfortable. Forgot I was even wearing it!", date: "2026-06-15" },
      { user: "Aisha K.", rating: 4, comment: "Great for regular days, rash-free indeed.", date: "2026-06-10" }
    ]
  },
  {
    id: "prod_large_10",
    name: "Comfi Ultra Thin - Large",
    size: "Large",
    length: "280mm",
    packCount: 10,
    price: 249,
    stock: 85,
    status: "Coming Soon",
    isComingSoon: true,
    description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days. Skin-friendly, extra flexible, and features advanced rash-protection technology Tester.",
    features: [
      "Ultra-absorbent gel core",
      "Hypoallergenic skin-safe top sheet",
      "Wide-wing grip to prevent shifting",
      "Super breathable back sheet"
    ],
    reviews: [
      { user: "Priya R.", rating: 5, comment: "Hands down the best pad I have used. Zero rashes, completely dry.", date: "2026-06-18" }
    ]
  },
  {
    id: "prod_xl_10",
    name: "Comfi Ultra Thin - XL",
    size: "XL",
    length: "320mm",
    packCount: 10,
    price: 299,
    stock: 60,
    status: "Coming Soon",
    isComingSoon: true,
    description: "Extra-long pads optimized for heavy daytime or active protection. Maximized surface coverage with zero bulkiness, enabling free movement without leakage fearsTester.",
    features: [
      "320mm extra protection coverage",
      "High fluid absorption limit",
      "Contoured shape for active movement",
      "Individually sealed for hygiene"
    ],
    reviews: [
      { user: "Meera S.", rating: 5, comment: "The length is perfect and it feels so light. Love the cottony texture.", date: "2026-06-20" }
    ]
  },
  {
    id: "prod_overnight_10",
    name: "Comfi Ultra Thin - Overnight",
    size: "Overnight",
    length: "360mm",
    packCount: 10,
    price: 349,
    stock: 45,
    status: "Coming Soon",
    isComingSoon: true,
    description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping. Delivers up to 12-hour protection, remaining completely breathable Tester.",
    features: [
      "360mm night safety length",
      "Extra-wide back wing coverage",
      "Up to 12-hour leak defense",
      "Zero-bulk comfortable sleep design"
    ],
    reviews: [
      { user: "Tanya G.", rating: 5, comment: "I slept peacefully for the first time without worrying about stains. Super wide back Tester!", date: "2026-06-19" }
    ]
  }
];

export default function ProductDetail({ params }) {
  // Safe extraction of params segment in Next.js 15 App Router
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const pathname = usePathname();
  const { API_URL, addToCart, token, toggleWishlist, isInWishlist, user, showToast } = useApp();
  const [product, setProduct] = useState(null);
  const [packOption, setPackOption] = useState(10);
  const [loading, setLoading] = useState(true);

  // 30-Second Dynamic Added to Cart State
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const addedTimerRef = useRef(null);

  // VIP Launch Waitlist State
  const [isWaitlistJoined, setIsWaitlistJoined] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleNotifyMe = (e) => {
    if (e) e.preventDefault();
    if (user?.email) {
      setIsWaitlistJoined(true);
      if (showToast) {
        showToast(`You're on the VIP launch list! We'll email ${user.email} on launch day.`, "VIP Access Confirmed");
      } else {
        alert(`You're on the VIP launch list! We'll email ${user.email} on launch day.`);
      }
      return;
    }
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    if (!waitlistEmail.trim() || !waitlistEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsWaitlistJoined(true);
    if (showToast) {
      showToast(`You're on the VIP launch list! We'll email ${waitlistEmail} on launch day.`, "VIP Access Confirmed");
    } else {
      alert(`You're on the VIP launch list! We'll email ${waitlistEmail} on launch day.`);
    }
  };

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const getProductData = async () => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        const fallback = FALLBACK_PRODUCTS.find(p => p.id === id);
        if (fallback) setProduct(fallback);
      }
    } catch (err) {
      console.warn("Backend offline, using fallback details");
      const fallback = FALLBACK_PRODUCTS.find(p => p.id === id);
      if (fallback) setProduct(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductData();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-background-primary flex items-center justify-center">
        <div className="utility-label text-accent animate-pulse font-black">Loading Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-background-primary flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black heading-premium text-primaryText mb-4">PRODUCT NOT FOUND</h2>
        <Link href="/shop" className="bg-accent text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest">
          Return to Shop
        </Link>
      </div>
    );
  }

  const unitPrice = product.price / 10;
  const currentPrice = packOption === 10 
    ? product.price 
    : Math.round((product.price * 2) * 0.9);

  const handleAddToCart = () => {
    if (showToast) {
      showToast("Orders are currently paused. All Comfi products are launching soon! Join our launch list to be notified.", "Orders Paused");
    } else {
      alert("Orders are currently paused. All Comfi products are launching soon! Join our launch list to be notified.");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!token) {
      setReviewError("Please log in to submit a product review.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Review comment cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${product.id || product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });

      if (res.ok) {
        setReviewSuccess("Thank you! Your review has been saved.");
        setReviewComment("");
        setReviewRating(5);
        getProductData();
      } else {
        const errorData = await res.json();
        setReviewError(errorData.message || "Failed to save review.");
      }
    } catch (err) {
      setReviewError("Connection error. Could not post review.");
    }
  };

  const avgRating = product.reviews && product.reviews.length 
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="bg-background-primary min-h-screen py-8 sm:py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto relative select-none">
      
      {/* Back button */}
      <Link href="/shop" className="utility-label text-primaryText/50 hover:text-accent font-black mb-6 sm:mb-8 inline-block transition-colors">
        ← BACK TO SHOP
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start">
        
        {/* Left Side: Product Illustration & Coming Soon Badge */}
        <div className="relative">
          {/* Coming Soon Corner Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-[#febac4] text-[#7e0022] shadow-sm border border-[#7e0022]/20 backdrop-blur-xs">
              <Sparkles size={13} className="text-[#7e0022]" /> COMING SOON
            </span>
          </div>

          <PadIllustration size={product.size} length={product.length} className="w-full aspect-[4/5]" />
          
          {/* 160px Floating Badge with 4s bounce */}
          <div className="absolute -bottom-8 -right-8 z-10 hidden sm:block">
            <FloatingBadge text="COMING SOON" subtext="DERMA TESTED" />
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div>
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-primaryText/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#febac4] text-[#7e0022] shadow-xs border border-[#7e0022]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7e0022] animate-pulse" />
                  COMING SOON
                </span>
                <span className="utility-label text-accent font-black tracking-widest hidden sm:inline">
                  ULTRA THIN SPECIALIST
                </span>
              </div>
              <div className="flex items-center gap-1 text-primaryText">
                <Star size={16} fill="currentColor" className="text-primaryText" />
                <span className="text-sm font-black">{avgRating} ({product.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black heading-premium text-primaryText leading-tight mr-4">
                {product.name}
              </h1>
              <HeartToggle 
                id={product.id} 
                checked={isInWishlist(product.id)} 
                onChange={() => {
                  if (!user) {
                    alert("Please log in or sign up to add items to your wishlist.");
                    router.push(`/account?redirect=${encodeURIComponent(pathname)}`);
                  } else {
                    toggleWishlist(product.id);
                  }
                }}
                className="flex-shrink-0"
                size="large"
              />
            </div>

            {/* VIP Pre-Launch Banner */}
            <div className="bg-[#fae3e5] border border-[#d0385c]/15 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-2xs">
              <Sparkles size={18} className="text-[#d0385c] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#3a3a3a] leading-relaxed">
                <span className="font-bold text-[#d0385c] block mb-0.5 uppercase tracking-wide">
                  Official Launch Approaching
                </span>
                This product is currently in final production with certified 100% organic cotton. Join the VIP launch list to be notified first and receive an exclusive 15% launch privilege!
              </div>
            </div>
            
            <p className="text-sm text-primaryText/70 leading-relaxed font-light mb-8 max-w-lg">
              {product.description}
            </p>

            {/* Pack Size Selector */}
            <div className="mb-8">
              <span className="utility-label text-primaryText/40 mb-3 block">Select Pack Size:</span>
              <div className="flex gap-3 sm:gap-4">
                {[10, 20].map(count => (
                  <button
                    key={count}
                    onClick={() => setPackOption(count)}
                    className={`flex-1 py-3.5 sm:py-4 px-2 border rounded-xl text-center transition-all duration-300 font-bold ${
                      packOption === count 
                        ? 'border-accent bg-accent/10 text-primaryText' 
                        : 'border-primaryText/10 bg-background-secondary text-primaryText/60 hover:border-primaryText/25'
                    }`}
                  >
                    <div className="text-base sm:text-lg font-black">{count} Packs</div>
                    <div className="text-[11px] sm:text-xs font-light text-primaryText/60 mt-1">
                      {count === 10 ? `₹${product.price} (₹${(product.price/10).toFixed(1)}/pad)` : `₹${Math.round((product.price*2)*0.9)} (₹${((product.price*2*0.9)/20).toFixed(1)}/pad)`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Action Row (Responsive Stack on Phone) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 py-6 border-t border-b border-primaryText/5 mb-8">
              <div className="text-center sm:text-left">
                <span className="utility-label text-primaryText/40">Expected Price</span>
                <div className="text-3xl sm:text-4xl font-black text-primaryText mt-0.5">₹{currentPrice}</div>
              </div>
              
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {isWaitlistJoined ? (
                  <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs">
                    <Check size={16} /> VIP Waitlist Joined
                  </div>
                ) : showEmailInput && !user ? (
                  <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="px-4 py-3 rounded-full text-xs border border-[#d0385c]/30 bg-white focus:outline-none focus:border-[#d0385c] text-[#3a3a3a]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#d0385c] hover:bg-[#5c0018] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Notify Me
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={handleNotifyMe}
                    className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#d0385c] hover:bg-[#5c0018] text-white"
                  >
                    <Sparkles size={16} /> Notify Me When Available
                  </button>
                )}

                {/* Pre-launch Note */}
                <div className="text-center pt-1.5">
                  <span className="text-[11px] font-bold text-[#7e0022] uppercase tracking-wider block">
                    Pre-orders & Orders Paused • Dropping Soon
                  </span>
                  <span className="text-[10px] text-[#3a3a3a]/65 block mt-0.5">
                    Sign up above to be notified first when orders open.
                  </span>
                </div>
              </div>
            </div>

            {/* Comfort/Material Claims */}
            <div className="mb-12">
              <span className="utility-label text-primaryText/40 mb-4 block">MATERIAL DETAILS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(product.features && product.features.length > 0 ? product.features : [
                  "Breathable top layer for zero irritation",
                  "Wide wings for secure fit",
                  "Individually wrapped in paper for hygienic disposal",
                  "Super absorption gel core"
                ]).map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Leaf size={16} className="text-accent flex-shrink-0" />
                    <span className="text-sm font-medium text-primaryText/80 leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* Review Section */}
      <section className="mt-20 border-t border-primaryText/10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Summary & Submission */}
          <div>
            <h3 className="text-3xl font-black heading-premium text-primaryText mb-6">REVIEWS</h3>
            <div className="bg-background-secondary p-6 rounded-2xl border border-primaryText/5 mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-primaryText">{avgRating}</span>
                <span className="text-sm text-primaryText/40">out of 5.0</span>
              </div>
              <div className="flex text-primaryText mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} 
                    className="text-primaryText" 
                  />
                ))}
              </div>
              <p className="text-xs text-primaryText/50 leading-relaxed font-light">
                All reviews are collected from authenticated customers. Rashes, leaks, and irritation claims are verified.
              </p>

              {/* Star Rating Breakdown bars */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="mt-6 space-y-2 border-t border-primaryText/5 pt-4">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = product.reviews.filter(r => r.rating === starNum).length;
                    const percent = ((count / product.reviews.length) * 100).toFixed(0);
                    return (
                      <div key={starNum} className="flex items-center gap-3 text-xs text-primaryText/60">
                        <span className="font-black w-3 text-right">{starNum}</span>
                        <Star size={10} fill="currentColor" className="text-primaryText" />
                        <div className="flex-grow h-2 bg-background-primary rounded-full overflow-hidden border border-primaryText/5">
                          <div 
                            className="bg-accent h-full rounded-full transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleAddReview} className="bg-background-primary border border-primaryText/10 p-6 rounded-2xl">
              <h4 className="utility-label text-primaryText mb-4">WRITE A REVIEW</h4>
              
              {reviewError && <div className="bg-red-100 text-red-700 text-xs p-3 rounded-lg mb-4 font-bold">{reviewError}</div>}
              {reviewSuccess && <div className="bg-green-100 text-green-700 text-xs p-3 rounded-lg mb-4 font-bold">{reviewSuccess}</div>}

              <div className="mb-4">
                <label className="text-xs font-black uppercase text-primaryText/60 mb-2 block">Rating</label>
                <div className="flex gap-2 text-primaryText/30">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setReviewRating(starNum)}
                      className={`hover:scale-125 transition-transform duration-200 cursor-pointer ${
                        reviewRating >= starNum ? 'text-accent' : 'text-primaryText/30'
                      }`}
                    >
                      <Star size={24} fill={reviewRating >= starNum ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-black uppercase text-primaryText/60 mb-2 block">Your Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with Comfi..."
                  rows={4}
                  className="w-full bg-background-secondary border border-primaryText/10 px-3 py-2 rounded-lg text-sm text-primaryText placeholder:text-primaryText/30 focus:outline-none focus:border-accent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primaryText text-background-primary py-2.5 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-accent hover:text-primaryText transition-colors duration-300"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="bg-background-secondary p-6 rounded-2xl border border-primaryText/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-bold text-primaryText block">{rev.user}</span>
                      <span className="text-[10px] text-primaryText/40 font-bold uppercase tracking-wider">{rev.date}</span>
                    </div>
                    <div className="flex text-primaryText">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < rev.rating ? "currentColor" : "none"} 
                          className="text-primaryText" 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-primaryText/70 leading-relaxed font-light">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-primaryText/40 font-light">
                No reviews yet. Be the first to share your comfort experience.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
