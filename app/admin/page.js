"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { ShieldAlert, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const { login, API_URL } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: 'comfi7555@gmail.com',
    password: 'ComfiAdmin123!'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Unauthorized admin access details.');
      }
    } catch (err) {
      setError('Connection failed. Backend service offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#262626] min-h-screen text-[#fdf8f3] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#fdf8f3] text-[#262626] rounded-2xl p-8 border border-white/10 shadow-2xl relative">
        
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mx-auto mb-6">
          <ShieldAlert size={24} />
        </div>

        <ScrollReveal>
          <span className="utility-label text-accent font-black tracking-widest text-center block mb-2">Internal Access Only</span>
          <h1 className="text-3xl font-black heading-premium text-center mb-6">COMFI ADMIN LOGON</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-6 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-primaryText/60 mb-1.5 block">Admin Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-primaryText/35" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-background-secondary border border-primaryText/10 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                  placeholder="admin@comfi.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-primaryText/60 mb-1.5 block">Security Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-primaryText/35" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-background-secondary border border-primaryText/10 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-[#262626] py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-premium duration-500 shadow-md mt-4"
            >
              {loading ? 'Validating credentials...' : 'Enter Dashboard'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs text-primaryText/40 hover:text-accent font-black block text-center mt-6 w-full uppercase tracking-wider transition-colors"
          >
            ← Public Website
          </button>
        </ScrollReveal>

      </div>
    </div>
  );
}
