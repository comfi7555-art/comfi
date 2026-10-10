"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API_URL = '/api';

export function AppProvider({ children }) {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);

  // Sync token from localStorage on client-side mount
  useEffect(() => {
    const savedToken = localStorage.getItem('comfi_token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setAuthLoading(false);
    }

    const savedCart = localStorage.getItem('comfi_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }

    const savedWishlist = localStorage.getItem('comfi_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist", e);
      }
    }

    const savedTheme = localStorage.getItem('comfi_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('comfi_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('comfi_theme', 'light');
      }
      return newTheme;
    });
  };

  // Fetch profile when token changes
  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Error loading user profile", err);
      } finally {
        setAuthLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  // Persist cart adjustments
  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem('comfi_cart')) {
      localStorage.setItem('comfi_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Persist wishlist adjustments
  useEffect(() => {
    if (wishlist.length > 0 || localStorage.getItem('comfi_wishlist')) {
      localStorage.setItem('comfi_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // Auth helper methods
  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('comfi_token', userToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('comfi_token');
  };

  // Cart helper methods
  const addToCart = (product, quantity = 1, customPackDetails = null) => {
    setCart(prevCart => {
      const cartItemId = customPackDetails 
        ? `${product.id}_custom_${Math.random().toString(36).substr(2, 9)}`
        : product.id;

      if (!customPackDetails) {
        const existingIdx = prevCart.findIndex(item => item.id === product.id && !item.customPackDetails);
        if (existingIdx > -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingIdx].quantity += quantity;
          return updatedCart;
        }
      }

      const updated = [
        ...prevCart,
        {
          cartItemId,
          id: product.id,
          name: product.name,
          size: product.size,
          packCount: product.packCount,
          price: product.price,
          quantity,
          customPackDetails,
        }
      ];
      localStorage.setItem('comfi_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => {
      const updated = prevCart.filter(item => item.cartItemId !== cartItemId);
      localStorage.setItem('comfi_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart => {
      const updated = prevCart.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('comfi_cart', JSON.stringify(updated));
      return updated;
    });
  };

  // Coupon State
  const [coupon, setCoupon] = useState(null);

  // GSTIN State
  const [gstinData, setGstinData] = useState(null);

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setGstinData(null);
    localStorage.removeItem('comfi_cart');
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartDiscount = () => {
    if (!coupon) return 0;
    const subtotal = getCartSubtotal();
    if (coupon.discountType === 'percentage') {
      return Math.round((subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'flat') {
      return Math.min(coupon.discountValue, subtotal);
    }
    return 0;
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    return Math.max(0, subtotal - discount);
  };

  const applyCoupon = async (code) => {
    const subtotal = getCartSubtotal();
    const res = await fetch(`${API_URL}/coupon/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();
    if (data.success) {
      setCoupon({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        description: data.description
      });
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const verifyAndApplyGSTIN = async (gstinNumber) => {
    const res = await fetch(`${API_URL}/gstin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstin: gstinNumber })
    });
    const data = await res.json();
    if (data.success) {
      setGstinData({
        gstin: data.gstin,
        legalName: data.legalName,
        tradeName: data.tradeName,
        state: data.state,
        status: data.status,
        taxpayerType: data.taxpayerType,
        isVerified: true
      });
      return { success: true, message: data.message, data };
    } else {
      return { success: false, message: data.message };
    }
  };

  const removeGSTIN = () => {
    setGstinData(null);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Wishlist helper methods
  const toggleWishlist = (productId) => {
    setWishlist(prevWishlist => {
      let updated;
      if (prevWishlist.includes(productId)) {
        updated = prevWishlist.filter(id => id !== productId);
      } else {
        updated = [...prevWishlist, productId];
      }
      localStorage.setItem('comfi_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      authLoading,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartSubtotal,
      getCartDiscount,
      getCartTotal,
      getCartCount,
      coupon,
      applyCoupon,
      removeCoupon,
      gstinData,
      verifyAndApplyGSTIN,
      removeGSTIN,
      wishlist,
      toggleWishlist,
      isInWishlist,
      isDarkMode,
      toggleTheme,
      API_URL
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
