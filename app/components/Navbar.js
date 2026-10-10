"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Navigation Header
 * Featuring a top announcement bar, centered serif wordmark logo,
 * left-aligned navigation links, and right-aligned utility icons.
 ************************************************************************/

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Heart, User } from 'lucide-react';
import PillNav from './PillNav';

export default function Navbar() {
  const { getCartCount, wishlist, user, logout } = useApp();
  const wishlistCount = wishlist?.length || 0;
  const pathname = usePathname();

  // Hide nav entirely in all admin pages to prevent top gap & visual leaks
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Shop', href: '/shop' },
    { label: 'Fit Quiz', href: '/quiz' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Pad Guide', href: '/guide' }
  ];

  const extraActions = (
    <>
      <Link 
        href="/wishlist" 
        className="p-2 text-[#3a3a3a] hover:text-[#d0385c] transition-colors duration-300 relative"
        aria-label="Wishlist"
      >
        <Heart size={18} strokeWidth={1.75} className={wishlistCount > 0 ? "fill-[#7e0022] text-[#7e0022]" : ""} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#7e0022] text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold leading-none">
            {wishlistCount}
          </span>
        )}
      </Link>
      <Link 
        href="/cart"  
        className="p-2 text-[#3a3a3a] hover:text-[#d0385c] transition-colors duration-300 relative"
        aria-label="Cart"
      >
        <ShoppingBag size={18} strokeWidth={1.75} />
        {getCartCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#d0385c] text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold leading-none">
            {getCartCount()}
          </span>
        )}
      </Link>
      
      {user ? (
        <div className="relative group p-2 flex items-center justify-center cursor-pointer">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-[18px] h-[18px] rounded-full object-cover border border-[#d0385c]/20" />
          ) : (
            <div className="w-[18px] h-[18px] rounded-full bg-[#d0385c] text-white flex items-center justify-center text-[10px] font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-3 w-48 bg-[#fdf7e7] rounded-2xl shadow-xl border border-[#d0385c]/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 flex flex-col p-2 pointer-events-none group-hover:pointer-events-auto z-[9999]">
            <div className="px-4 py-2 border-b border-[#d0385c]/10 mb-1">
              <p className="text-[10px] uppercase font-bold text-[#3a3a3a]/50">Signed in as</p>
              <p className="text-sm font-bold text-[#d0385c] truncate">Hi, {user.name?.split(' ')[0]}</p>
            </div>
            <Link href="/account" className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#3a3a3a] hover:bg-[#d0385c]/5 hover:text-[#d0385c] rounded-xl transition-colors">
              My Account
            </Link>
            {(user.role === 'admin' || user.email === 'comfi7555@gmail.com' || user.email === 'carolpillai02@gmail.com') && (
              <Link href="/admin/dashboard" className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors flex items-center gap-1.5 my-1">
                👑 Admin Panel
              </Link>
            )}
            <button onClick={logout} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left w-full cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <Link 
          href="/account" 
          className="p-2 text-[#3a3a3a] hover:text-[#d0385c] transition-colors duration-300 relative"
          aria-label="Account"
        >
          <User size={18} strokeWidth={1.75} />
        </Link>
      )}
    </>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
      <div className="pt-4 pointer-events-auto w-full px-4 md:px-8">
        <PillNav 
          logo="COMFI"
          items={navItems}
          activeHref={pathname}
          baseColor="#fdf7e7"
          pillColor="#fdf7e7"
          pillTextColor="#3a3a3a"
          hoveredPillTextColor="#d0385c"
          extraActions={extraActions}
        />
      </div>
    </div>
  );
}
