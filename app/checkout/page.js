"use client";
/************************************************************************
 * Comfi D2C Secure Checkout Page
 * Features:
 * - Payment Gateway Selector (Live Razorpay vs Dummy Sandbox Gateway)
 * - Promo / Coupon Code Input Engine with Preset Suggestions
 * - B2B GSTIN Tax Invoice Verification
 * - Express Doorstep Delivery & GST Tax Breakdown
 * - Interactive Dummy Payment Simulator Modal
 ************************************************************************/

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { 
  CreditCard, CheckCircle, XCircle, ArrowLeft, Loader2, Tag, 
  Building2, ShieldCheck, Truck, Sparkles, Check, RefreshCw
} from 'lucide-react';

export default function Checkout() {
  const { 
    cart, 
    getCartSubtotal, 
    getCartDiscount, 
    getCartTotal, 
    coupon, 
    applyCoupon,
    removeCoupon,
    gstinData, 
    verifyAndApplyGSTIN,
    removeGSTIN,
    token, 
    user, 
    clearCart, 
    API_URL 
  } = useApp();
  const router = useRouter();

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || '',
    address: 'Flat 402, B-Wing, Sunshine Heights, Saki Naka, Navpada',
    city: 'Mumbai',
    postalCode: '400072',
    phone: user?.phone || '+91 98765 43210'
  });

  // Selected Payment Mode: 'dummy' or 'razorpay'
  const [paymentMode, setPaymentMode] = useState('dummy');

  // Coupon Input State
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // GSTIN Input State
  const [showGstinForm, setShowGstinForm] = useState(false);
  const [gstinInput, setGstinInput] = useState('');
  const [gstinMsg, setGstinMsg] = useState({ type: '', text: '' });
  const [isGstinLoading, setIsGstinLoading] = useState(false);

  // Form & Payment Loading / Errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock Payment Modal State
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [cart, router, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  // Delivery Charges calculation
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const deliveryCharge = (subtotal >= 499 || coupon?.code === 'FREESHIP499') ? 0 : 49;
  const estimatedGst = Math.round((subtotal - discount) * 0.18); // 18% GST estimate
  const finalPayable = Math.max(0, subtotal - discount + deliveryCharge);

  // Apply Coupon Handler
  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput.trim();
    if (!code) return;
    setIsCouponLoading(true);
    setCouponMsg({ type: '', text: '' });
    try {
      const res = await applyCoupon(code);
      if (res.success) {
        setCouponMsg({ type: 'success', text: res.message });
        setCouponInput('');
      } else {
        setCouponMsg({ type: 'error', text: res.message });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Error verifying coupon.' });
    } finally {
      setIsCouponLoading(false);
    }
  };

  // Verify GSTIN Handler
  const handleVerifyGstin = async () => {
    if (!gstinInput.trim()) return;
    setIsGstinLoading(true);
    setGstinMsg({ type: '', text: '' });
    try {
      const res = await verifyAndApplyGSTIN(gstinInput.trim().toUpperCase());
      if (res.success) {
        setGstinMsg({ type: 'success', text: `✓ Verified: ${res.data.tradeName || res.data.legalName}` });
        setGstinInput('');
      } else {
        setGstinMsg({ type: 'error', text: res.message });
      }
    } catch (err) {
      setGstinMsg({ type: 'error', text: 'Error verifying GSTIN.' });
    } finally {
      setIsGstinLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingForm.name || !shippingForm.address || !shippingForm.city || !shippingForm.postalCode || !shippingForm.phone) {
      setError('Please fill in all doorstep shipping details.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/checkout/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalPayable,
          subtotal: subtotal,
          discountAmount: discount,
          deliveryCharge: deliveryCharge,
          gstAmount: estimatedGst,
          couponCode: coupon?.code || null,
          gstin: gstinData?.gstin || null,
          gstinDetails: gstinData || null,
          isMockPayment: paymentMode === 'dummy',
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            size: item.size,
            packCount: item.packCount,
            price: item.price,
            quantity: item.quantity,
            customPackDetails: item.customPackDetails
          })),
          shippingAddress: shippingForm,
          customerName: shippingForm.name,
          customerEmail: user?.email || ''
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to initiate order creation on server');
      }

      const orderData = await res.json();

      if (paymentMode === 'dummy' || orderData.isMockPayment) {
        setMockOrderDetails({
          ...orderData,
          amount: finalPayable
        });
        setShowMockModal(true);
        setLoading(false);
      } else {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Are you connected to the internet?');
          setLoading(false);
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: "COMFI Care",
          description: "Ultra Thin Organic Protection",
          order_id: orderData.orderId,
          handler: async function (response) {
            const verifyRes = await fetch(`${API_URL}/checkout/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              alert("Payment successful! Order placed.");
              router.push('/account');
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: shippingForm.name,
            email: user?.email || '',
            contact: shippingForm.phone
          },
          theme: {
            color: "#d0385c"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing order payment.');
      setLoading(false);
    }
  };

  const handleMockPaymentOutcome = async (outcome) => {
    if (!mockOrderDetails) return;
    setLoading(true);
    setShowMockModal(false);

    try {
      const res = await fetch(`${API_URL}/checkout/mock-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dbOrderId: mockOrderDetails.dbOrderId,
          razorpay_payment_id: outcome === 'success' ? `dummy_pay_${Math.random().toString(36).substr(2, 9)}` : null,
          status: outcome
        })
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        alert("🎉 Dummy Payment approved! Your order has been placed successfully.");
        router.push('/account');
      } else {
        setError("Dummy Payment was cancelled or declined.");
      }
    } catch (err) {
      setError("Error finalizing dummy payment outcome.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdf7e7] min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto relative font-sans">
      
      <button 
        onClick={() => router.push('/cart')} 
        className="text-xs font-bold text-[#3a3a3a]/60 hover:text-[#d0385c] mb-6 flex items-center gap-1.5 transition-colors uppercase tracking-widest font-sans cursor-pointer"
      >
        <ArrowLeft size={14} /> BACK TO BAG
      </button>

      <ScrollReveal className="mb-8 border-b border-[#d0385c]/10 pb-6">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-1.5 font-sans">Final Step</span>
        <h1 className="text-3xl md:text-5xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">
          Express Checkout
        </h1>
      </ScrollReveal>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-8 text-xs font-bold font-sans">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping & Payment Options (Span 7) */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-[#fae3e5] p-6 md:p-8 rounded-3xl border border-[#d0385c]/15 space-y-6 shadow-2xs">
          
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#7e0022] uppercase mb-4 flex items-center gap-2">
              <Truck size={16} className="text-[#d0385c]" />
              <span>1. Doorstep Delivery Address</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingForm.name}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#d0385c]/20 px-4 py-3 rounded-full text-xs text-[#3a3a3a] focus:outline-none focus:border-[#d0385c]"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1 block">Mobile Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingForm.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#d0385c]/20 px-4 py-3 rounded-full text-xs text-[#3a3a3a] focus:outline-none focus:border-[#d0385c]"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1 block">Flat / House / Building Address *</label>
                <input
                  type="text"
                  name="address"
                  value={shippingForm.address}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-[#d0385c]/20 px-4 py-3 rounded-full text-xs text-[#3a3a3a] focus:outline-none focus:border-[#d0385c]"
                  placeholder="Flat 402, B-Wing, Sunshine Heights, Saki Naka"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1 block">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingForm.city}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#d0385c]/20 px-4 py-3 rounded-full text-xs text-[#3a3a3a] focus:outline-none focus:border-[#d0385c]"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1 block">Pincode *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#d0385c]/20 px-4 py-3 rounded-full text-xs text-[#3a3a3a] focus:outline-none focus:border-[#d0385c]"
                    placeholder="400072"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Mode Selector */}
          <div className="pt-4 border-t border-[#d0385c]/15">
            <h3 className="text-xs font-bold tracking-wider text-[#7e0022] uppercase mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-[#d0385c]" />
              <span>2. Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('dummy')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMode === 'dummy'
                    ? 'border-[#d0385c] bg-white shadow-xs'
                    : 'border-[#d0385c]/20 bg-[#fdf7e7] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#d0385c] flex items-center gap-1.5">
                    🧪 Dummy Test Gateway
                  </span>
                  {paymentMode === 'dummy' && <CheckCircle size={16} className="text-[#d0385c]" />}
                </div>
                <p className="text-[11px] text-[#3a3a3a]/70">Simulated test payment with instant sandbox approval modal.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('razorpay')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMode === 'razorpay'
                    ? 'border-[#d0385c] bg-white shadow-xs'
                    : 'border-[#d0385c]/20 bg-[#fdf7e7] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#7e0022] flex items-center gap-1.5">
                    💳 Razorpay Live / UPI
                  </span>
                  {paymentMode === 'razorpay' && <CheckCircle size={16} className="text-[#d0385c]" />}
                </div>
                <p className="text-[11px] text-[#3a3a3a]/70">Google Pay, PhonePe, Cards, UPI & NetBanking.</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d0385c] text-white hover:bg-[#5c0018] py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing Payment...
              </>
            ) : (
              <>
                <CreditCard size={16} /> Proceed to Pay (₹{finalPayable})
              </>
            )}
          </button>
        </form>

        {/* Right Column: Order Summary, Coupons & GSTIN (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Promo / Coupon Code Card */}
          <div className="bg-[#fae3e5] rounded-3xl p-5 border border-[#d0385c]/15 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7e0022] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[#d0385c]" />
                <span>Apply Promo / Coupon Code</span>
              </span>
            </div>

            {coupon ? (
              <div className="bg-[#fdf7e7] p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                    🎉 Coupon Applied: {coupon.code}
                  </div>
                  <div className="text-[10px] text-emerald-700">You saved ₹{discount}!</div>
                </div>
                <button 
                  type="button" 
                  onClick={removeCoupon} 
                  className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. COMFI10)"
                    className="flex-1 bg-white border border-[#d0385c]/20 px-3 py-2 text-xs rounded-full uppercase focus:outline-none focus:border-[#d0385c]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={isCouponLoading || !couponInput.trim()}
                    className="bg-[#d0385c] hover:bg-[#5c0018] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isCouponLoading ? <RefreshCw size={12} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>

                {couponMsg.text && (
                  <div className={`text-[11px] font-bold p-2 rounded-xl text-center ${couponMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {couponMsg.text}
                  </div>
                )}

                {/* Quick Coupon Tap Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['COMFI10', 'QUIZ50', 'FREESHIP499'].map((cCode) => (
                    <button
                      key={cCode}
                      type="button"
                      onClick={() => handleApplyCoupon(cCode)}
                      className="bg-white border border-[#d0385c]/20 hover:border-[#d0385c] text-[#7e0022] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles size={10} className="text-[#d0385c]" />
                      {cCode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B2B GSTIN Section */}
          <div className="bg-[#fae3e5] rounded-3xl p-5 border border-[#d0385c]/15 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowGstinForm(!showGstinForm)}
                className="text-xs font-bold text-[#7e0022] uppercase tracking-wider flex items-center gap-1.5 hover:text-[#d0385c] transition-colors cursor-pointer"
              >
                <Building2 size={14} className="text-[#d0385c]" />
                <span>🏢 Add GSTIN for Tax Invoice ({gstinData ? 'Added' : 'Optional'})</span>
              </button>
            </div>

            {gstinData ? (
              <div className="bg-[#fdf7e7] p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-emerald-800">✓ B2B GSTIN: {gstinData.gstin}</div>
                  <div className="text-[10px] text-emerald-700">{gstinData.tradeName || gstinData.legalName}</div>
                </div>
                <button type="button" onClick={removeGSTIN} className="text-xs font-bold text-red-600 hover:underline px-2">
                  Remove
                </button>
              </div>
            ) : showGstinForm && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gstinInput}
                    onChange={e => setGstinInput(e.target.value.toUpperCase())}
                    placeholder="15-digit GSTIN (e.g. 27AAAAA0000A1Z5)"
                    maxLength={15}
                    className="flex-1 bg-white border border-[#d0385c]/20 px-3 py-2 text-xs rounded-full uppercase focus:outline-none focus:border-[#d0385c]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyGstin}
                    disabled={isGstinLoading || gstinInput.length < 15}
                    className="bg-[#d0385c] hover:bg-[#5c0018] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isGstinLoading ? <RefreshCw size={12} className="animate-spin" /> : 'Verify'}
                  </button>
                </div>
                {gstinMsg.text && (
                  <div className={`text-[11px] font-bold p-2 rounded-xl ${gstinMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {gstinMsg.text}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary & Pricing Breakdown Card */}
          <div className="bg-[#fae3e5] rounded-3xl p-6 border border-[#d0385c]/15 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold tracking-wider text-[#7e0022] uppercase border-b border-[#d0385c]/10 pb-3">
              Order Basket Summary
            </h3>
            
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto border-b border-[#d0385c]/10 pb-3 pr-1">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-start text-xs font-sans">
                  <div>
                    <span className="font-bold text-[#7e0022] block">{item.name}</span>
                    <span className="text-[#3a3a3a]/70">{item.size} • Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#d0385c]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#3a3a3a]/80 font-sans">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#7e0022]">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Express Delivery Charges</span>
                <span className="font-bold text-[#d0385c]">
                  {deliveryCharge === 0 ? <span className="text-emerald-700 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full font-bold">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#3a3a3a]/60">
                <span>Estimated GST (18% Included)</span>
                <span className="font-mono">₹{estimatedGst}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline font-serif font-black text-xl text-[#d0385c] pt-3 border-t border-[#d0385c]/15">
                <span>Total Amount</span>
                <span>₹{finalPayable}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dummy Payment Gateway Test Simulator Modal */}
      {showMockModal && mockOrderDetails && (
        <div className="fixed inset-0 bg-[#d0385c]/65 backdrop-blur-[4px] z-[99999] flex items-center justify-center p-4 font-sans">
          <ScrollReveal className="bg-[#fdf7e7] max-w-md w-full rounded-3xl border border-[#d0385c]/30 p-6 md:p-8 text-center shadow-2xl space-y-5">
            <span className="text-[10px] font-bold tracking-widest bg-[#d0385c]/15 text-[#d0385c] px-3.5 py-1 rounded-full uppercase inline-block font-sans">
              🧪 Dummy Payment Gateway Simulator
            </span>
            
            <h2 className="text-2xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">
              Simulated Payment Gateway
            </h2>
            <p className="text-xs text-[#3a3a3a]/75 leading-relaxed font-light">
              This is a test payment environment. Test your complete order workflow without charging real money.
            </p>

            <div className="bg-[#fae3e5] rounded-2xl p-4 border border-[#d0385c]/15 text-left space-y-2 text-xs">
              <div className="flex justify-between font-sans">
                <span className="text-[#3a3a3a]/70">Order Reference:</span>
                <span className="font-bold text-[#7e0022] font-mono">{mockOrderDetails.orderId || mockOrderDetails.dbOrderId}</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-[#3a3a3a]/70">Total Amount:</span>
                <span className="font-bold text-[#d0385c] text-sm">₹{mockOrderDetails.amount}</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-[#3a3a3a]/70">Customer Name:</span>
                <span className="font-bold text-[#7e0022]">{shippingForm.name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleMockPaymentOutcome('success')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle size={16} /> Approve & Pay
              </button>
              <button
                type="button"
                onClick={() => handleMockPaymentOutcome('failed')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <XCircle size={16} /> Simulate Decline
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setShowMockModal(false); setError('Dummy payment session cancelled.'); }}
              className="text-xs font-bold uppercase tracking-widest text-[#3a3a3a]/60 hover:text-[#d0385c] pt-2 transition-colors block mx-auto cursor-pointer"
            >
              Cancel Payment
            </button>
          </ScrollReveal>
        </div>
      )}

    </div>
  );
}
