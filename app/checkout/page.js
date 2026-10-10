"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Secure Checkout Page
 * Features a warm cream canvas, mint-sage shipping and sidebar panels,
 * 50px pill-shaped inputs, and a themed sandbox payment simulator.
 ************************************************************************/

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { CreditCard, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function Checkout() {
  const { 
    cart, 
    getCartSubtotal, 
    getCartDiscount, 
    getCartTotal, 
    coupon, 
    gstinData, 
    token, 
    user, 
    clearCart, 
    API_URL 
  } = useApp();
  const router = useRouter();

  const [shippingForm, setShippingForm] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock modal states
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  useEffect(() => {
    // If not mounted yet or cart is empty
    if (cart.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
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
      setError('Please fill in all shipping details.');
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
          amount: getCartTotal(),
          subtotal: getCartSubtotal(),
          discountAmount: getCartDiscount(),
          couponCode: coupon?.code || null,
          gstin: gstinData?.gstin || null,
          gstinDetails: gstinData || null,
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
        throw new Error('Failed to create order on server');
      }

      const orderData = await res.json();

      if (orderData.isMockPayment) {
        setMockOrderDetails(orderData);
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
          currency: orderData.currency,
          name: "COMFI Care",
          description: "Ultra Thin Protection",
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
          razorpay_payment_id: outcome === 'success' ? `mock_pay_${Math.random().toString(36).substr(2, 9)}` : null,
          status: outcome
        })
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        alert("Mock payment approved! Order successfully placed.");
        router.push('/account');
      } else {
        setError("Mock payment was declined/cancelled.");
      }
    } catch (err) {
      setError("Error finalizing mock payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdf7e7] min-h-screen py-12 px-6 md:px-12 max-w-5xl mx-auto relative select-none">
      
      <button 
        onClick={() => router.push('/cart')} 
        className="text-xs font-bold text-[#3a3a3a]/60 hover:text-[#d0385c] mb-8 flex items-center gap-1 transition-colors uppercase tracking-widest font-sans"
      >
        <ArrowLeft size={12} /> BACK TO BAG
      </button>

      <ScrollReveal className="mb-12 border-b border-[#d0385c]/10 pb-8">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-2 font-sans">Final Step</span>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">
          Secure Checkout
        </h1>
      </ScrollReveal>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-8 text-sm font-bold font-sans">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Shipping Form - Left/Center */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 bg-[#fae3e5] p-8 rounded-3xl border border-[#d0385c]/15 flex flex-col gap-6 shadow-2xs">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#d0385c]/50 mb-2 uppercase">Shipping Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#d0385c]/70 mb-2 block font-sans">Full Name</label>
              <input
                type="text"
                name="name"
                value={shippingForm.name}
                onChange={handleInputChange}
                className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm text-[#3a3a3a] focus:outline-none focus:border-[#d0385c] font-sans"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#d0385c]/70 mb-2 block font-sans">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={shippingForm.phone}
                onChange={handleInputChange}
                className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm text-[#3a3a3a] focus:outline-none focus:border-[#d0385c] font-sans"
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#d0385c]/70 mb-2 block font-sans">Address</label>
            <input
              type="text"
              name="address"
              value={shippingForm.address}
              onChange={handleInputChange}
              className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm text-[#3a3a3a] focus:outline-none focus:border-[#d0385c] font-sans"
              placeholder="Flat/House No., Street Name, Landmark"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#d0385c]/70 mb-2 block font-sans">City</label>
              <input
                type="text"
                name="city"
                value={shippingForm.city}
                onChange={handleInputChange}
                className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm text-[#3a3a3a] focus:outline-none focus:border-[#d0385c] font-sans"
                placeholder="Mumbai"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#d0385c]/70 mb-2 block font-sans">PIN Code</label>
              <input
                type="text"
                name="postalCode"
                value={shippingForm.postalCode}
                onChange={handleInputChange}
                className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm text-[#3a3a3a] focus:outline-none focus:border-[#d0385c] font-sans"
                placeholder="400001"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d0385c] text-white hover:bg-[#5c0018] py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-102 active:scale-95 shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing Payment...
              </>
            ) : (
              <>
                <CreditCard size={16} /> Place Order & Pay (₹{getCartTotal()})
              </>
            )}
          </button>
        </form>

        {/* Order Basket Sidebar - Right */}
        <div className="bg-[#fae3e5] rounded-3xl p-6 border border-[#d0385c]/15 shadow-2xs flex flex-col gap-4">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#d0385c]/70 uppercase">Bag Contents</h3>
          
          <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto border-b border-[#d0385c]/10 pb-4 pr-2">
            {cart.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start text-xs border-b border-[#d0385c]/5 pb-2">
                <div>
                  <span className="font-bold text-[#d0385c] block font-sans">{item.name}</span>
                  <span className="text-[#3a3a3a]/70 font-sans">{item.size} • Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-[#d0385c] font-sans">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-[#3a3a3a]/80 font-sans">
            <span>Subtotal</span>
            <span className="font-bold text-[#d0385c]">₹{getCartSubtotal()}</span>
          </div>

          {coupon && (
            <div className="flex justify-between items-center text-xs text-emerald-700 font-sans bg-[#fdf7e7] p-2.5 rounded-xl border border-emerald-500/20">
              <span className="font-bold">🎉 Coupon ({coupon.code})</span>
              <span className="font-bold">-₹{getCartDiscount()}</span>
            </div>
          )}

          {gstinData && (
            <div className="bg-[#fdf7e7] p-2.5 rounded-xl border border-emerald-500/20 text-xs">
              <span className="font-bold text-emerald-800 block">✓ B2B GSTIN: {gstinData.gstin}</span>
              <span className="text-[10px] text-emerald-700 block font-medium">{gstinData.tradeName || gstinData.legalName}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline font-serif font-black text-xl text-[#d0385c] pt-2 border-t border-[#d0385c]/10">
            <span>Total Payable</span>
            <span>₹{getCartTotal()}</span>
          </div>
        </div>

      </div>

      {/* Razorpay Mock Payment Simulator Modal */}
      {showMockModal && mockOrderDetails && (
        <div className="fixed inset-0 bg-[#d0385c]/65 backdrop-blur-[4px] z-[999] flex items-center justify-center p-6">
          <ScrollReveal className="bg-[#fdf7e7] max-w-md w-full rounded-3xl border border-[#d0385c]/15 p-8 text-center shadow-xl">
            <span className="text-[9px] font-bold tracking-[0.2em] bg-[#7e0022]/15 text-[#7e0022] px-3 py-1 rounded-full mb-3 inline-block uppercase font-sans">
              Razorpay Sandbox Simulator
            </span>
            <h2 className="text-2xl font-serif font-black text-[#d0385c] mb-2 uppercase tracking-tighter">Simulated Payment</h2>
            <p className="text-xs text-[#3a3a3a]/70 leading-relaxed font-light font-sans mb-6">
              Razorpay API keys are configured in sandbox/development mode. Select an action below to test the complete server checkout integration.
            </p>

            <div className="bg-[#fae3e5] rounded-2xl p-4 border border-[#d0385c]/10 text-left mb-8 flex flex-col gap-2 shadow-2xs">
              <div className="text-xs flex justify-between font-sans">
                <span className="text-[#3a3a3a]/75">Simulated Order ID:</span>
                <span className="font-bold text-[#d0385c]">{mockOrderDetails.orderId}</span>
              </div>
              <div className="text-xs flex justify-between font-sans">
                <span className="text-[#3a3a3a]/75">Amount Payable:</span>
                <span className="font-bold text-[#d0385c]">₹{mockOrderDetails.amount}</span>
              </div>
              <div className="text-xs flex justify-between font-sans">
                <span className="text-[#3a3a3a]/75">Customer Phone:</span>
                <span className="font-bold text-[#d0385c]">{shippingForm.phone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleMockPaymentOutcome('success')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer hover:scale-102"
              >
                <CheckCircle size={14} /> Mock Success
              </button>
              <button
                type="button"
                onClick={() => handleMockPaymentOutcome('failed')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer hover:scale-102"
              >
                <XCircle size={14} /> Mock Decline
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setShowMockModal(false); setError('Simulated payment cancelled by user.'); }}
              className="text-xs font-bold uppercase tracking-widest text-[#3a3a3a]/65 hover:text-[#d0385c] mt-6 transition-colors font-sans block mx-auto"
            >
              Cancel Payment Session
            </button>
          </ScrollReveal>
        </div>
      )}

    </div>
  );
}
