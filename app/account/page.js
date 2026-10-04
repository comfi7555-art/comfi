"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Account & OTP Verification Page
 * Passwordless authentication using 6-digit email verification codes (OTP).
 * Renders forms inside a mint-sage card on a warm cream paper canvas.
 ************************************************************************/

import React, { useState, useEffect, useSearchParams } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { Mail, User as UserIcon, Calendar, CheckCircle2, Package, MapPin, Truck, Award, ShieldAlert, ArrowLeft, Phone } from 'lucide-react';

export default function Account() {
  const { user, login, token, logout, API_URL } = useApp();
  const router = useRouter();

  // Search parameters for auth redirects
  const [redirectPath, setRedirectPath] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  // Auth flow states
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState('input'); // 'input' (email/name) or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [dobParts, setDobParts] = useState({
    day: '',
    month: '',
    year: ''
  });
  const [otpCode, setOtpCode] = useState('');

  const handleDobPartsChange = (e) => {
    const { name, value } = e.target;
    const key = name === 'dobDay' ? 'day' : name === 'dobMonth' ? 'month' : 'year';
    const updatedParts = { ...dobParts, [key]: value };
    setDobParts(updatedParts);

    if (updatedParts.day && updatedParts.month && updatedParts.year) {
      const formattedMonth = String(updatedParts.month).padStart(2, '0');
      const formattedDay = String(updatedParts.day).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        dob: `${updatedParts.year}-${formattedMonth}-${formattedDay}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dob: ''
      }));
    }
  };

  // Dashboard states
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'settings'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings states
  const { isDarkMode, toggleTheme } = useApp();
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: '',
    newPassword: '',
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  // Update Settings handler
  const handleSettingsUpdate = async (updates) => {
    setSettingsMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (updates.isTwoFactorEnabled !== undefined) {
          setSettingsForm(prev => ({ ...prev, isTwoFactorEnabled: updates.isTwoFactorEnabled }));
        }
        if (data.user) {
           login(data.user, token);
        }
      } else {
        setSettingsMessage({ type: 'error', text: data.message || 'Failed to update.' });
      }
    } catch (err) {
      setSettingsMessage({ type: 'error', text: 'Connection failed.' });
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSettingsMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSettingsUpdate({ avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Status flags
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch orders when user is authenticated
  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching order history", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [token, API_URL]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Submit email & password to authenticate or register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setAuthError("Passwords do not match.");
        setAuthLoading(false);
        return;
      }

      const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setStep('otp');
          setAuthSuccess(data.message || 'A 6-digit 2FA code has been sent to your email.');
        } else {
          login(data.user, data.token);
          if (redirectPath) {
            router.push(redirectPath);
          }
        }
      } else {
        setAuthError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Connection failed. Please verify your network.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Submit OTP code to authenticate and sign in
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
          name: isLogin ? '' : formData.name,
          dob: isLogin ? '' : formData.dob,
          phone: isLogin ? '' : formData.phone
        })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        if (redirectPath) {
          router.push(redirectPath);
        }
      } else {
        setAuthError(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setAuthError('Verification request failed. Please retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep('input');
    setOtpCode('');
    setAuthError('');
    setAuthSuccess('');
  };

  const getTimelineSteps = (status) => {
    return [
      { key: 'Placed', label: 'Order Placed', icon: Calendar, reached: true },
      { key: 'Processing', label: 'Processing', icon: Package, reached: ['Processing', 'Shipped', 'Delivered'].includes(status) },
      { key: 'Shipped', label: 'Shipped', icon: Truck, reached: ['Shipped', 'Delivered'].includes(status) },
      { key: 'Delivered', label: 'Delivered', icon: Award, reached: status === 'Delivered' }
    ];
  };

  return (
    <div className="bg-[#fdf7e7] min-h-[80vh] py-12 px-6 md:px-12 max-w-7xl mx-auto select-none">
      
      {!token ? (
        /* Authentication Screen (Mint Sage background card) */
        <div className="max-w-md mx-auto bg-[#fae3e5] p-8 rounded-3xl border border-[#d0385c]/10 mt-8 relative shadow-xs">
          
          {step === 'input' ? (
            /* Step 1 Form: Email Request */
            <>
              {/* Tab Selector Buttons */}
              <div className="flex gap-6 mb-8 justify-center border-b border-[#d0385c]/10 pb-4">
                <button 
                  onClick={() => { setIsLogin(true); setAuthError(''); setAuthSuccess(''); }}
                  className={`text-xs font-bold pb-1 transition-all uppercase tracking-widest ${isLogin ? 'text-[#d0385c] border-b-2 border-[#d0385c]' : 'text-[#3a3a3a]/40'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setAuthError(''); setAuthSuccess(''); }}
                  className={`text-xs font-bold pb-1 transition-all uppercase tracking-widest ${!isLogin ? 'text-[#d0385c] border-b-2 border-[#d0385c]' : 'text-[#3a3a3a]/40'}`}
                >
                  Create Account
                </button>
              </div>

              <ScrollReveal key={isLogin ? 'login' : 'signup'}>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-[#d0385c] text-center mb-2 uppercase tracking-tighter">
                  {isLogin ? 'WELCOME BACK' : 'JOIN COMFI'}
                </h2>
                <p className="text-xs text-[#3a3a3a]/75 text-center mb-6 font-light leading-relaxed font-sans">
                  {isLogin ? 'Sign in via email verification to access your profile.' : 'Create an account to save custom boxes and track orders.'}
                </p>

                {authError && (
                  <div className="bg-red-100 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl font-bold mb-6 text-center font-sans">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Full Name</label>
                        <div className="relative">
                          <UserIcon size={16} className="absolute left-4 top-3.5 text-[#d0385c]/35" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans"
                            placeholder="Jane Doe"
                            required={!isLogin}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Phone Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-3.5 text-[#d0385c]/35" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans"
                            placeholder="+91 98765 43210"
                            required={!isLogin}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Birth Date</label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            name="dobDay"
                            value={dobParts.day}
                            onChange={handleDobPartsChange}
                            className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans cursor-pointer"
                            required={!isLogin}
                          >
                            <option value="">Day</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{String(day).padStart(2, '0')}</option>
                            ))}
                          </select>

                          <select
                            name="dobMonth"
                            value={dobParts.month}
                            onChange={handleDobPartsChange}
                            className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans cursor-pointer"
                            required={!isLogin}
                          >
                            <option value="">Month</option>
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((mon, idx) => (
                              <option key={mon} value={idx + 1}>{mon}</option>
                            ))}
                          </select>

                          <select
                            name="dobYear"
                            value={dobParts.year}
                            onChange={handleDobPartsChange}
                            className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans cursor-pointer"
                            required={!isLogin}
                          >
                            <option value="">Year</option>
                            {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-3.5 text-[#d0385c]/35" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans"
                        placeholder="jane@example.com"
                        required
                      />
                    </div>
                  </div>

                  {isLogin && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Password</label>
                      <div className="pwd-group">
                        <svg className="pwd-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pwd-input"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Password</label>
                        <div className="pwd-group">
                          <svg className="pwd-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pwd-input"
                            placeholder="••••••••"
                            required={!isLogin}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans">Confirm Password</label>
                        <div className="pwd-group">
                          <svg className="pwd-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pwd-input"
                            placeholder="••••••••"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#d0385c] text-white hover:bg-[#5c0018] py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-102 active:scale-95 transition-all shadow-lg mt-4 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {authLoading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </button>
                </form>
              </ScrollReveal>
            </>
          ) : (
            /* Step 2 Form: OTP Entry */
            <ScrollReveal key="otp-step">
              <button 
                onClick={handleGoBack}
                className="flex items-center gap-1 text-[10px] font-bold text-[#3a3a3a]/60 hover:text-[#d0385c] mb-4 uppercase tracking-widest font-sans"
              >
                <ArrowLeft size={12} /> Correct Email
              </button>

              <h2 className="text-2xl md:text-3xl font-serif font-black text-[#d0385c] text-center mb-2 uppercase tracking-tighter">
                VERIFY EMAIL
              </h2>
              <p className="text-xs text-[#3a3a3a]/75 text-center mb-6 font-light leading-relaxed font-sans">
                Please enter the 6-digit verification code dispatched to <span className="font-bold text-[#d0385c]">{formData.email}</span>.
              </p>

              {authSuccess && (
                <div className="bg-[#fdf7e7] border border-[#d0385c]/15 text-[#d0385c] text-xs p-3.5 rounded-2xl font-bold mb-6 text-center font-sans">
                  {authSuccess}
                </div>
              )}

              {authError && (
                <div className="bg-red-100 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl font-bold mb-6 text-center font-sans">
                  {authError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d0385c]/70 mb-1.5 block font-sans text-center">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-center text-lg font-bold tracking-[0.4em] focus:outline-none focus:border-[#d0385c] text-[#d0385c] font-sans"
                    placeholder="000000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading || otpCode.length !== 6}
                  className="w-full bg-[#d0385c] text-white hover:bg-[#5c0018] py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-102 active:scale-95 transition-all shadow-lg mt-4 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Verifying...' : 'Verify & Log In'}
                </button>
              </form>
            </ScrollReveal>
          )}

        </div>
      ) : (
        /* Account Dashboard (when logged in) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mt-4">
          
          {/* User Bio Sidebar - Left (mint sage background card) */}
          <div className="bg-[#fae3e5] p-8 rounded-3xl border border-[#d0385c]/10 flex flex-col gap-6 shadow-2xs">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase font-sans">Customer Profile</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-[#d0385c] mb-1 leading-tight">{user?.name}</h2>
              <p className="text-sm text-[#3a3a3a]/75 font-sans break-all">{user?.email}</p>
            </div>
            
            <div className="border-t border-[#d0385c]/10 pt-4 flex flex-col gap-2 font-sans">
              <div className="text-xs text-[#3a3a3a]/75 flex justify-between">
                <span>Account Role:</span>
                <span className="font-bold capitalize text-[#d0385c]">{user?.role}</span>
              </div>
              {user?.phone && (
                <div className="text-xs text-[#3a3a3a]/75 flex justify-between">
                  <span>Phone:</span>
                  <span className="font-bold text-[#d0385c]">{user.phone}</span>
                </div>
              )}
              {user?.dob && (
                <div className="text-xs text-[#3a3a3a]/75 flex justify-between">
                  <span>Birth Date:</span>
                  <span className="font-bold text-[#d0385c]">{new Date(user.dob).toLocaleDateString()}</span>
                </div>
              )}
              <div className="text-xs text-[#3a3a3a]/75 flex justify-between">
                <span>Completed Orders:</span>
                <span className="font-bold text-[#d0385c]">{orders.filter(o => o.paymentStatus === 'Paid' || o.payment_status === 'Paid').length}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full bg-[#fdf7e7] text-[#d0385c] border border-[#d0385c]/15 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#d0385c]/10 transition-colors duration-300"
            >
              Sign Out
            </button>
          </div>

          {/* Dashboard Content - Right */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#d0385c]/10 pb-4">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`text-sm font-bold pb-1 transition-all uppercase tracking-widest ${activeTab === 'orders' ? 'text-[#d0385c] border-b-2 border-[#d0385c]' : 'text-[#3a3a3a]/40 hover:text-[#d0385c]/70'}`}
              >
                Order History
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`text-sm font-bold pb-1 transition-all uppercase tracking-widest ${activeTab === 'settings' ? 'text-[#d0385c] border-b-2 border-[#d0385c]' : 'text-[#3a3a3a]/40 hover:text-[#d0385c]/70'}`}
              >
                Account Settings
              </button>
            </div>

            {activeTab === 'orders' ? (
              <div className="flex flex-col gap-8">
                <h3 className="text-3xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">Order History</h3>

                {loadingOrders ? (
                  <div className="text-center py-12 text-[#d0385c] font-bold animate-pulse text-xs tracking-widest uppercase font-sans">
                    Loading Order List...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {orders.map(order => {
                      const isSelected = selectedOrder?.id === order.id || selectedOrder?._id === order._id;
                      const paymentStatus = order.paymentStatus || order.payment_status;
                      const orderStatus = order.orderStatus || order.order_status;
                      
                      return (
                        <div 
                          key={order._id || order.id} 
                          className={`bg-[#fae3e5] rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xs ${
                            isSelected ? 'border-[#d0385c]/30' : 'border-[#d0385c]/10'
                          }`}
                        >
                          <div 
                            onClick={() => setSelectedOrder(isSelected ? null : order)}
                            className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-[#fae3e5]/40 transition-colors"
                          >
                            <div>
                              <div className="text-[10px] font-bold text-[#3a3a3a]/50 uppercase tracking-widest font-sans">
                                ID: {order.id || order._id} &bull; {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                              </div>
                              <span className="font-bold text-lg text-[#d0385c] block mt-1 font-sans">
                                ₹{order.totalAmount || order.total_amount}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full font-sans ${
                                paymentStatus === 'Paid' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : orderStatus === 'Cancelled'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {orderStatus === 'Cancelled' ? 'Cancelled' : paymentStatus}
                              </span>
                              <span className="text-xs text-[#d0385c] font-bold font-sans">
                                {isSelected ? '[- Hide Details]' : '[+ View Details]'}
                              </span>
                            </div>
                          </div>

                          {/* Expandable Timeline and Item Summary */}
                          {isSelected && (
                            <ScrollReveal className="px-6 pb-6 border-t border-[#d0385c]/10 bg-[#fdf7e7]/40 pt-6">
                              
                              {/* Deliver Timeline */}
                              <div className="mb-8">
                                <span className="text-[10px] font-bold tracking-widest text-[#3a3a3a]/40 block mb-4 uppercase font-sans">DELIVERY TRACKER</span>
                                
                                {orderStatus === 'Cancelled' ? (
                                  <div className="text-center py-6 text-red-700 bg-red-50 rounded-2xl border border-red-100 font-bold uppercase tracking-widest text-xs font-sans">
                                    This order has been cancelled
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row justify-between relative gap-6">
                                    <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-[#d0385c]/10 hidden sm:block z-0" />
                                    
                                    {getTimelineSteps(orderStatus).map((step, index) => {
                                      const Icon = step.icon;
                                      return (
                                        <div key={index} className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 flex-1">
                                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                            step.reached 
                                              ? 'bg-[#d0385c] text-white shadow-2xs' 
                                              : 'bg-[#fdf7e7] text-[#d0385c]/30 border border-[#d0385c]/10'
                                          }`}>
                                            <Icon size={16} />
                                          </div>
                                          <span className={`text-[10px] font-bold uppercase tracking-wider text-center font-sans ${
                                            step.reached ? 'text-[#d0385c]' : 'text-[#3a3a3a]/40'
                                          }`}>
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Items */}
                              <div className="border-t border-[#d0385c]/10 pt-4">
                                <span className="text-[10px] font-bold tracking-widest text-[#3a3a3a]/40 block mb-3 uppercase font-sans">ITEMS ORDERED</span>
                                <div className="flex flex-col gap-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs text-[#3a3a3a] py-2 border-b border-[#d0385c]/5 last:border-0 font-sans">
                                      <div>
                                        <span className="font-bold">{item.name}</span>
                                        <span className="text-[#3a3a3a]/50"> x {item.quantity}</span>
                                        {item.customPackDetails && (
                                          <div className="text-[10px] text-[#7e0022] font-semibold mt-0.5 font-sans">
                                            Custom Pack Breakdown: {Object.entries(item.customPackDetails).map(([sz, qty]) => `${sz}: ${qty}`).join(', ')}
                                          </div>
                                        )}
                                      </div>
                                      <span className="font-bold text-[#d0385c]">₹{item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Address details */}
                              {order.shippingAddress && (
                                <div className="border-t border-[#d0385c]/10 pt-4 mt-4 text-xs text-[#3a3a3a]/80 leading-relaxed font-sans">
                                  <span className="text-[10px] font-bold tracking-widest text-[#3a3a3a]/40 block mb-2 uppercase">SHIPPING ADDRESS</span>
                                  <div className="flex gap-2 items-start">
                                    <MapPin size={14} className="text-[#7e0022] flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold text-[#d0385c]">{order.shippingAddress.name}</div>
                                      <div>{order.shippingAddress.address}</div>
                                      <div>{order.shippingAddress.city} - {order.shippingAddress.postalCode}</div>
                                      <div>Phone: {order.shippingAddress.phone}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </ScrollReveal>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center text-[#3a3a3a]/50 font-light bg-[#fae3e5] rounded-3xl border border-[#d0385c]/10 shadow-2xs font-sans">
                    No orders recorded yet. When you complete checkout, your history and package tracking updates will show up here.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <h3 className="text-3xl font-serif font-black text-[#d0385c] uppercase tracking-tighter">Account Settings</h3>
                
                {/* Settings Panel */}
                <div className="bg-[#fae3e5] p-8 rounded-3xl border border-[#d0385c]/10 shadow-2xs">
                  {settingsMessage.text && (
                    <div className={`p-4 rounded-xl text-xs font-bold mb-6 text-center ${settingsMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                      {settingsMessage.text}
                    </div>
                  )}

                  <div className="flex flex-col gap-8">
                    {/* Avatar Upload */}
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase font-sans mb-3 block">Profile Photo</span>
                      <div className="flex items-center gap-4">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#d0385c]/20" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#fdf7e7] border border-[#d0385c]/20 flex items-center justify-center">
                            <UserIcon size={24} className="text-[#d0385c]/40" />
                          </div>
                        )}
                        <label className="bg-[#fdf7e7] border border-[#d0385c]/15 text-[#d0385c] hover:bg-[#d0385c]/5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors">
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </label>
                      </div>
                    </div>

                    <hr className="border-[#d0385c]/10" />

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase font-sans block">Theme</span>
                        <p className="text-xs text-[#3a3a3a]/70 font-sans mt-1">Switch between Light and Dark mode.</p>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#d0385c]' : 'bg-[#d0385c]/20'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <hr className="border-[#d0385c]/10" />

                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase font-sans block">Two-Factor Authentication</span>
                        <p className="text-xs text-[#3a3a3a]/70 font-sans mt-1">Require an email verification code when logging in.</p>
                      </div>
                      <button 
                        onClick={() => handleSettingsUpdate({ isTwoFactorEnabled: !settingsForm.isTwoFactorEnabled })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settingsForm.isTwoFactorEnabled ? 'bg-[#d0385c]' : 'bg-[#d0385c]/20'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settingsForm.isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <hr className="border-[#d0385c]/10" />

                    {/* Change Password */}
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase font-sans mb-4 block">Change Password</span>
                      <div className="flex flex-col gap-4 max-w-sm">
                        <input 
                          type="password"
                          placeholder="Current Password"
                          value={settingsForm.currentPassword}
                          onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                          className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans"
                        />
                        <input 
                          type="password"
                          placeholder="New Password"
                          value={settingsForm.newPassword}
                          onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                          className="w-full bg-[#fdf7e7] border border-[#d0385c]/15 px-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#d0385c] text-[#3a3a3a] font-sans"
                        />
                        <button 
                          onClick={() => {
                            handleSettingsUpdate({ currentPassword: settingsForm.currentPassword, newPassword: settingsForm.newPassword });
                            setSettingsForm({ ...settingsForm, currentPassword: '', newPassword: '' });
                          }}
                          disabled={!settingsForm.currentPassword || !settingsForm.newPassword}
                          className="bg-[#d0385c] text-white hover:bg-[#5c0018] py-3 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
