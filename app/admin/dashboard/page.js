"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, ShoppingBag, Package, Boxes, Users, FolderKanban, 
  Tag, FileText, BarChart3, Truck, CreditCard, MessageSquare, Bot, 
  ShieldCheck, Search, Plus, Edit2, Trash2, Download, RefreshCw, 
  LogOut, CheckCircle2, AlertTriangle, Eye, Printer, Send, Sparkles, 
  Filter, X, ArrowUpRight, ArrowDownRight, Key, Lock, FileSpreadsheet,
  SlidersHorizontal, Check, Zap, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user, authLoading, logout, API_URL } = useApp();
  const router = useRouter();

  // Active module state (1 to 15)
  const [activeModule, setActiveModule] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Core Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [collections, setCollections] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [contentSettings, setContentSettings] = useState({});

  // Modals and Active Edit States
  const [activeModal, setActiveModal] = useState(null); // 'product' | 'order' | 'coupon' | 'collection' | 'customer' | 'aiGen'
  const [selectedItem, setSelectedItem] = useState(null);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '', sku: '', category: 'Daytime Essentials', price: 199, salePrice: 179,
    size: 'Regular', length: '240mm', stock: 100, minStockThreshold: 20,
    imageUrl: '/images/cotton_pad_hero.jpg', variantImageUrl: '/images/cotton_pad_hero.jpg',
    visibility: 'Published', featured: false, description: '', seoTitle: '', seoDescription: ''
  });

  const handleAutoGenerateProductDescription = () => {
    const name = productForm.name || 'Comfi Ultra Thin Organic Pad';
    const size = productForm.size || 'Regular';
    const length = productForm.length || '240mm';
    const category = productForm.category || 'Daytime Essentials';
    const price = productForm.price || 199;

    const generatedDesc = `Experience unmatched comfort with ${name} (${size} size - ${length}). Specially designed for ${category.toLowerCase()}, this pad features a 100% certified organic cotton top-sheet, ultra-absorbent 3D lock core, and zero artificial fragrances. Dermatologically tested for sensitive skin, offering high absorbency at ₹${price} for all-day rash-free confidence.`;

    const generatedSeoTitle = `${name} (${length}) | 100% Organic Cotton Rash-Free Pads`;
    const generatedSeoDesc = `Buy ${name} (${size} ${length}). Hypoallergenic 100% organic cotton top sheet with advanced leak guard technology. Order now for rash-free comfort.`;

    setProductForm(prev => ({
      ...prev,
      description: generatedDesc,
      seoTitle: generatedSeoTitle,
      seoDescription: generatedSeoDesc
    }));
  };

  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'Percentage', value: 10, minOrderValue: 299, expiryDate: '2026-12-31'
  });

  const [collectionForm, setCollectionForm] = useState({
    name: '', slug: '', description: '', status: 'Active'
  });

  // AI Generator Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Authorization Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  // Load All Admin Data
  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setOrders(data.orders || []);
        setCustomers(data.customers || []);
        setCoupons(data.coupons || []);
        setCollections(data.collections || []);
        setInventoryLogs(data.inventoryLogs || []);
        setShippingRates(data.shippingRates || []);
        setSupportTickets(data.supportTickets || []);
        setAuditLogs(data.auditLogs || []);
        setContentSettings(data.contentSettings || {});
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  // Keyboard Shortcuts (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generic Mutation Helper
  const handleMutation = async (action, collection, data, id = null) => {
    try {
      const res = await fetch(`${API_URL}/admin/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, collection, data, id })
      });
      if (res.ok) {
        await loadAdminData();
        setActiveModal(null);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Mutation failed:", err);
    }
  };

  // Calculated Dashboard Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? (o.totalAmount || 0) : 0), 0);
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Pending COD Verification').length;
    const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    const lowStockProducts = products.filter(p => p.stock <= (p.minStockThreshold || 20));
    
    return {
      totalRevenue,
      todaySales: Math.round(totalRevenue * 0.28), // Estimated today ratio
      totalOrdersCount,
      pendingOrdersCount,
      aov,
      totalCustomers: customers.length,
      conversionRate: '3.42%',
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    };
  }, [orders, products, customers]);

  // Sidebar Items Definition
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics.pendingOrdersCount },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: metrics.lowStockCount > 0 ? metrics.lowStockCount : null, badgeColor: 'bg-amber-500' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'collections', label: 'Collections', icon: FolderKanban },
    { id: 'marketing', label: 'Marketing', icon: Tag },
    { id: 'cms', label: 'Content (CMS)', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'support', label: 'Reviews & Support', icon: MessageSquare, badge: supportTickets.filter(t => t.status === 'Open').length },
    { id: 'ai', label: 'AI Insights', icon: Bot, highlight: true },
    { id: 'settings', label: 'Settings & Logs', icon: ShieldCheck }
  ];

  // AI Description Generator Handler
  const handleGenerateAiDescription = () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiGeneratedText(`Introducing Comfi ${aiPrompt} — crafted with 100% certified organic cotton top-sheet for pure, rash-free comfort. Features our 3D absorption lock channel, wide contouring wings, and zero chemical fragrance. Designed for women who demand light, breathable daytime & night defense.`);
      setAiLoading(false);
    }, 1000);
  };

  // CSV Exporter
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7e0022]">
          <RefreshCw className="animate-spin" size={24} />
          <span className="font-bold tracking-wider">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-gray-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#7e0022] text-white flex items-center justify-center font-serif font-bold text-sm">C</span>
            <span className="font-serif font-bold text-xl text-[#7e0022] tracking-tight">Comfi Admin Control</span>
          </div>
          <span className="text-xs bg-[#febac4]/30 text-[#7e0022] font-semibold px-2.5 py-1 rounded-full border border-[#d0385c]/20">
            Enterprise v2.4
          </span>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-500 transition-colors"
          >
            <Search size={14} />
            <span>Search orders, products, customers...</span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border border-gray-300 text-[10px]">Ctrl K</kbd>
          </button>

          <button 
            onClick={loadAdminData}
            title="Refresh All Data"
            className="p-2 text-gray-500 hover:text-[#7e0022] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#d0385c]" : ""} />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-800">{user.name || 'Admin User'}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</div>
            </div>
            <button 
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-4 px-3 gap-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">Modules</div>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#7e0022] text-white shadow-sm' 
                    : item.highlight 
                    ? 'bg-[#febac4]/20 text-[#7e0022] hover:bg-[#febac4]/40' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-white' : item.highlight ? 'text-[#d0385c]' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#7e0022]' : item.badgeColor ? `${item.badgeColor} text-white` : 'bg-[#d0385c] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Module 1: Dashboard */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Store Overview</h1>
                  <p className="text-xs text-gray-500 mt-1">Real-time performance metrics and store updates.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToCSV('comfi_sales_report', orders)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50"
                  >
                    <Download size={14} /> Export Report
                  </button>
                  <button 
                    onClick={() => { setActiveModule('products'); setActiveModal('product'); }}
                    className="bg-[#d0385c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#b02b4a]"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs font-semibold text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">₹{metrics.totalRevenue.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-2">
                    <ArrowUpRight size={12} /> +14.8% vs last month
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs font-semibold text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalOrdersCount}</div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-2">
                    <ArrowUpRight size={12} /> +8.2% conversion
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs font-semibold text-gray-500">Average Order Value</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">₹{metrics.aov}</div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-2">
                    <ArrowUpRight size={12} /> +₹45 bundle lift
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs font-semibold text-gray-500">Pending Orders</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">{metrics.pendingOrdersCount}</div>
                  <div className="text-[11px] text-gray-500 mt-2">Requires dispatch</div>
                </div>
              </div>

              {/* Low Stock Alerts & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Low Stock Alert Widget */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                      <AlertTriangle size={16} /> Low-Stock Alerts
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {metrics.lowStockCount} Items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {metrics.lowStockProducts.length === 0 ? (
                      <div className="text-xs text-gray-400 py-4 text-center">All inventory levels healthy.</div>
                    ) : (
                      metrics.lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                          <div>
                            <div className="font-bold text-gray-800">{p.name}</div>
                            <div className="text-[10px] text-gray-500">SKU: {p.sku || p.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-700">{p.stock} units left</div>
                            <button 
                              onClick={() => { setActiveModule('inventory'); }}
                              className="text-[10px] text-[#d0385c] font-bold hover:underline"
                            >
                              Restock Now
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="font-bold text-sm text-gray-900">Recent Customer Orders</div>
                    <button onClick={() => setActiveModule('orders')} className="text-xs text-[#d0385c] font-bold hover:underline">
                      View All Orders →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-gray-400 font-semibold border-b border-gray-100">
                          <th className="pb-2">Order ID</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Payment</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50">
                            <td className="py-2.5 font-bold text-[#7e0022]">{o.id}</td>
                            <td className="py-2.5 text-gray-700">{o.customerName}</td>
                            <td className="py-2.5 font-semibold text-gray-900">₹{o.totalAmount}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                                {o.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Order Management */}
          {activeModule === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Order Management</h1>
                  <p className="text-xs text-gray-500 mt-1">Fulfill orders, track shipping, generate invoices & manage returns.</p>
                </div>
                <button 
                  onClick={() => exportToCSV('comfi_orders', orders)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tracking</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-[#7e0022]">{o.id}</td>
                        <td className="p-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{o.customerName}</div>
                          <div className="text-[10px] text-gray-400">{o.customerEmail}</div>
                        </td>
                        <td className="p-3 text-gray-600">
                          {o.items ? o.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ') : '1x Pad Pack'}
                        </td>
                        <td className="p-3 font-bold text-gray-900">₹{o.totalAmount}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <select 
                            value={o.orderStatus} 
                            onChange={(e) => handleMutation('updateItem', 'orders', { orderStatus: e.target.value }, o.id)}
                            className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-[11px] font-semibold text-gray-700"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Pending COD Verification">Pending COD</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                        <td className="p-3 text-gray-500 text-[11px]">
                          {o.trackingNumber || 'Unassigned'}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button 
                            onClick={() => { setSelectedItem(o); setActiveModal('orderDetail'); }}
                            title="View Invoice & Details"
                            className="p-1.5 text-gray-500 hover:text-[#d0385c] hover:bg-gray-100 rounded"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3: Product Management */}
          {activeModule === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Product Management</h1>
                  <p className="text-xs text-gray-500 mt-1">Manage catalog, variants, pricing, stock, SEO titles & descriptions.</p>
                </div>
                <button 
                  onClick={() => { setSelectedItem(null); setProductForm({ name: '', sku: '', category: 'Daytime Essentials', price: 199, salePrice: 179, size: 'Regular', length: '240mm', stock: 100, minStockThreshold: 20, visibility: 'Published', featured: false, description: '', seoTitle: '', seoDescription: '' }); setActiveModal('productForm'); }}
                  className="bg-[#d0385c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#b02b4a]"
                >
                  <Plus size={14} /> Add New Product
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Size / Length</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Visibility</th>
                      <th className="p-3">Featured</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-900">{p.name}</td>
                        <td className="p-3 text-gray-500 font-mono text-[11px]">{p.sku || p.id}</td>
                        <td className="p-3 text-gray-600">{p.size} ({p.length})</td>
                        <td className="p-3 font-bold text-gray-800">
                          ₹{p.price} {p.salePrice ? <span className="text-[10px] text-emerald-600 font-normal ms-1">(Sale: ₹{p.salePrice})</span> : null}
                        </td>
                        <td className="p-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            p.stock < 20 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {p.visibility || 'Published'}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.featured ? <span className="text-amber-500 font-bold">★ Yes</span> : <span className="text-gray-400">No</span>}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button 
                            onClick={() => { setSelectedItem(p); setProductForm({ ...p }); setActiveModal('productForm'); }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 4: Inventory Management */}
          {activeModule === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Inventory & Stock Control</h1>
                  <p className="text-xs text-gray-500 mt-1">Real-time stock tracking, restocking logs & supplier purchase orders.</p>
                </div>
                <div className="text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  Total Inventory Value: <span className="text-[#7e0022] font-extrabold">₹{products.reduce((s, p) => s + (p.stock * p.price), 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Quick Adjustment */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="font-bold text-sm text-gray-900">Stock Levels by Product SKU</div>
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <div className="font-bold text-xs text-gray-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">Threshold: {p.minStockThreshold || 20} units</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleMutation('updateItem', 'products', { stock: Math.max(0, p.stock - 10) }, p.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 text-xs"
                          >
                            -10
                          </button>
                          <span className="font-bold text-xs text-gray-800 min-w-[50px] text-center">{p.stock} units</span>
                          <button 
                            onClick={() => handleMutation('updateItem', 'products', { stock: p.stock + 50 }, p.id)}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded hover:bg-emerald-200 text-xs"
                          >
                            +50 Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Movement Logs */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="font-bold text-sm text-gray-900">Inventory Movement & Audit Log</div>
                  <div className="space-y-2">
                    {inventoryLogs.map(log => (
                      <div key={log.id} className="text-xs p-2.5 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{log.productName}</div>
                          <div className="text-[10px] text-gray-400">{log.reason} • {new Date(log.date).toLocaleDateString()}</div>
                        </div>
                        <span className={`font-bold ${log.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {log.change > 0 ? `+${log.change}` : log.change} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 5: Customer Management (CRM) */}
          {activeModule === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Customer Relationship Management (CRM)</h1>
                  <p className="text-xs text-gray-500 mt-1">Customer spending, tags, order history & account security.</p>
                </div>
                <button 
                  onClick={() => exportToCSV('comfi_customers', customers)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <Download size={14} /> Export CRM Data
                </button>
              </div>

              {/* Customers Directory */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Total Orders</th>
                      <th className="p-3">Total Spent</th>
                      <th className="p-3">Tags</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-900">{c.name}</td>
                        <td className="p-3 text-gray-500">
                          <div>{c.email}</div>
                          <div className="text-[10px] text-gray-400">{c.phone}</div>
                        </td>
                        <td className="p-3 font-semibold text-gray-800">{c.totalOrders || 1} orders</td>
                        <td className="p-3 font-bold text-[#7e0022]">₹{c.totalSpent || 499}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {c.tags ? c.tags.map((t, idx) => (
                              <span key={idx} className="bg-[#febac4]/30 text-[#7e0022] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            )) : <span className="text-gray-400 text-[10px]">Standard</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Flagged' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {c.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button 
                            onClick={() => { setSelectedItem(c); setActiveModal('customerDetail'); }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 6: Collections Management */}
          {activeModule === 'collections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Collections & Categories</h1>
                  <p className="text-xs text-gray-500 mt-1">Organize products into curated store categories & promotional lines.</p>
                </div>
                <button 
                  onClick={() => { setCollectionForm({ name: '', slug: '', description: '', status: 'Active' }); setActiveModal('collectionForm'); }}
                  className="bg-[#d0385c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#b02b4a]"
                >
                  <Plus size={14} /> New Collection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {collections.map(col => (
                  <div key={col.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{col.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{col.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{col.description}</p>
                    <div className="text-[11px] text-gray-400 font-mono">Slug: /{col.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 7: Marketing & Promotions */}
          {activeModule === 'marketing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Marketing & Coupon Codes</h1>
                  <p className="text-xs text-gray-500 mt-1">Create discount codes, BOGO deals & abandoned cart recovery rules.</p>
                </div>
                <button 
                  onClick={() => { setCouponForm({ code: '', discountType: 'Percentage', value: 10, minOrderValue: 299, expiryDate: '2026-12-31' }); setActiveModal('couponForm'); }}
                  className="bg-[#d0385c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#b02b4a]"
                >
                  <Plus size={14} /> Create Coupon Code
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Discount Type</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Min Order</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3">Usage Count</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-bold text-[#7e0022]">{c.code}</td>
                        <td className="p-3 text-gray-600">{c.discountType}</td>
                        <td className="p-3 font-bold text-gray-900">{c.discountType === 'Percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                        <td className="p-3 text-gray-600">₹{c.minOrderValue}</td>
                        <td className="p-3 text-gray-500">{c.expiryDate}</td>
                        <td className="p-3 font-semibold text-gray-700">{c.usageCount || 0} uses</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {c.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleMutation('deleteItem', 'coupons', null, c.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 8: Content Management (CMS) */}
          {activeModule === 'cms' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Website Content Management (CMS)</h1>
                <p className="text-xs text-gray-500 mt-1">Edit homepage text, announcement bar banners & store policies.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Top Announcement Bar Text</label>
                  <input 
                    type="text" 
                    value={contentSettings.announcementBar || ''} 
                    onChange={(e) => setContentSettings({ ...contentSettings, announcementBar: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Homepage Hero Title</label>
                  <input 
                    type="text" 
                    value={contentSettings.heroTitle || ''} 
                    onChange={(e) => setContentSettings({ ...contentSettings, heroTitle: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hero Subtitle Copy</label>
                  <textarea 
                    rows={2}
                    value={contentSettings.heroSubtitle || ''} 
                    onChange={(e) => setContentSettings({ ...contentSettings, heroSubtitle: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => handleMutation('addItem', 'contentSettings', contentSettings)}
                    className="bg-[#7e0022] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#60001a]"
                  >
                    Save Content Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Module 9: Analytics & Reports */}
          {activeModule === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900">Analytics, Heatmaps & Traffic Reports</h1>
                  <p className="text-xs text-gray-500 mt-1">Real-time visitor logs, click heatmaps, page dwell times & revenue graphs.</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    18 Live Visitors Surfing Now
                  </div>
                  <button 
                    onClick={() => exportToCSV('comfi_full_analytics', orders)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 shadow-2xs"
                  >
                    <FileSpreadsheet size={14} /> Export Report
                  </button>
                </div>
              </div>

              {/* Top 4 Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs text-gray-500 font-bold">Total Gross Profit</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">₹{Math.round(metrics.totalRevenue * 0.62).toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400 mt-1">62% margin after COGS</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs text-gray-500 font-bold">Avg Page Dwell Time</div>
                  <div className="text-2xl font-bold text-indigo-600 mt-1">3m 42s</div>
                  <div className="text-[11px] text-emerald-600 mt-1"> Highest on Fit Quiz</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs text-gray-500 font-bold">Cart Abandonment</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">18.4%</div>
                  <div className="text-[11px] text-emerald-600 mt-1">-2.1% lower than industry avg</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                  <div className="text-xs text-gray-500 font-bold">Repeat Customer Rate</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">42.5%</div>
                  <div className="text-[11px] text-gray-400 mt-1">High repeat subscription rate</div>
                </div>
              </div>

              {/* Interactive Visual Traffic & Revenue Trend Graph */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <BarChart3 size={16} className="text-[#d0385c]" /> Hourly Visitor Sessions & Revenue Trend
                    </div>
                    <div className="text-[11px] text-gray-400">Peak traffic detected between 6:00 PM - 10:00 PM IST</div>
                  </div>
                  <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg text-[10px] font-bold">
                    <button className="px-2.5 py-1 rounded bg-white text-gray-900 shadow-xs">Today</button>
                    <button className="px-2.5 py-1 rounded text-gray-500 hover:text-gray-900">7 Days</button>
                    <button className="px-2.5 py-1 rounded text-gray-500 hover:text-gray-900">30 Days</button>
                  </div>
                </div>

                {/* Visual SVG/Bar Chart */}
                <div className="pt-4 pb-2">
                  <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-gray-200">
                    {[
                      { time: '12 AM', visitors: 140, sales: 2 },
                      { time: '3 AM', visitors: 45, sales: 0 },
                      { time: '6 AM', visitors: 210, sales: 4 },
                      { time: '9 AM', visitors: 520, sales: 12 },
                      { time: '12 PM', visitors: 890, sales: 24 },
                      { time: '3 PM', visitors: 740, sales: 18 },
                      { time: '6 PM', visitors: 1420, sales: 42 },
                      { time: '9 PM', visitors: 1680, sales: 58 },
                      { time: '11 PM', visitors: 980, sales: 28 }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-12 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md">
                          {bar.time}: <strong>{bar.visitors} visitors</strong> ({bar.sales} orders)
                        </div>
                        <div className="w-full max-w-[36px] bg-gradient-to-t from-[#7e0022] to-[#d0385c] rounded-t hover:brightness-110 transition-all cursor-pointer relative" style={{ height: `${(bar.visitors / 1680) * 100}%` }}>
                          <div className="w-full bg-[#febac4] rounded-t absolute bottom-0" style={{ height: `${(bar.sales / 58) * 60}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold">{bar.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-4 text-[10px] font-bold pt-3 text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#d0385c] rounded-xs"></span> Visitor Sessions</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#febac4] rounded-xs"></span> Orders Converted</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Who's Visiting & Click Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Who's Visiting Website (Live Visitor Log) */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Users size={16} className="text-[#d0385c]" /> Who&apos;s Visiting Website (Live Traffic)
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">Live Sync</span>
                  </div>

                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
                    {[
                      { city: 'Bengaluru, KA', device: 'iPhone 15 • Safari', page: '/quiz', duration: '4m 18s', source: 'Instagram Ad' },
                      { city: 'Mumbai, MH', device: 'Windows 11 • Chrome', page: '/product/prod_overnight_10', duration: '8m 42s', source: 'Google Organic' },
                      { city: 'Delhi, NCR', device: 'MacBook Air • Chrome', page: '/checkout', duration: '6m 10s', source: 'Direct' },
                      { city: 'Pune, MH', device: 'Android • Chrome', page: '/quiz', duration: '3m 55s', source: 'WhatsApp Share' },
                      { city: 'Chennai, TN', device: 'iPhone 14 • Safari', page: '/ingredients', duration: '2m 30s', source: 'Instagram Ad' },
                      { city: 'Hyderabad, TS', device: 'Windows 10 • Edge', page: '/shop', duration: '5m 12s', source: 'Google Search' }
                    ].map((vis, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {vis.city}
                          </div>
                          <div className="text-[10px] text-gray-500">{vis.device} • <span className="text-[#7e0022] font-semibold">{vis.source}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#d0385c] text-[11px]">{vis.page}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Time spent: {vis.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Where They Clicking & Spending So Much Time (Click Heatmap & Dwell Analytics) */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" /> Click Heatmap & Page Dwell Time
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Top Engaged Features</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { feature: 'Fit Quiz ("Find My Perfect Fit")', clicks: '48.5% Clicks', dwell: '3m 45s Avg Dwell', hot: true, width: '92%' },
                      { feature: 'Comfi Ultra Thin - Overnight 360mm', clicks: '24.2% Clicks', dwell: '2m 50s Avg Dwell', hot: true, width: '70%' },
                      { feature: 'Ingredients Page ("100% Organic Cotton")', clicks: '15.1% Clicks', dwell: '1m 55s Avg Dwell', hot: false, width: '48%' },
                      { feature: 'Build Your Own Pack Tool', clicks: '8.2% Clicks', dwell: '2m 10s Avg Dwell', hot: false, width: '30%' },
                      { feature: 'Pad Size Guide & Absorbency Scale', clicks: '4.0% Clicks', dwell: '1m 20s Avg Dwell', hot: false, width: '18%' }
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span className="flex items-center gap-1.5">
                            {item.hot && <span className="text-amber-500 text-[10px]">🔥 HOT</span>}
                            {item.feature}
                          </span>
                          <span className="text-[#7e0022] font-mono text-[11px]">{item.dwell}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-[#d0385c] to-[#7e0022] h-full rounded-full" style={{ width: item.width }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Click Share: {item.clicks}</span>
                          <span>High User Engagement</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 10: Shipping & Delivery */}
          {activeModule === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Shipping & Delivery Rates</h1>
                <p className="text-xs text-gray-500 mt-1">Delivery zones, shipping charges & courier integration partners.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Zone Name</th>
                      <th className="p-3">Order Value Range</th>
                      <th className="p-3">Shipping Rate</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shippingRates.map(s => (
                      <tr key={s.id}>
                        <td className="p-3 font-bold text-gray-900">{s.zoneName}</td>
                        <td className="p-3 text-gray-600">₹{s.minOrder} - ₹{s.maxOrder}</td>
                        <td className="p-3 font-bold text-[#7e0022]">{s.rate === 0 ? 'FREE' : `₹${s.rate}`}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 11: Payments & Finance */}
          {activeModule === 'finance' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Payments & Finance Reports</h1>
                <p className="text-xs text-gray-500 mt-1">Razorpay transaction log, GST 18% calculation & payment gateway fee breakdown.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-sm text-gray-900">Tax & GST 18% Breakdown (Calculated)</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="text-gray-500">CGST (9%) Output Tax</div>
                    <div className="font-bold text-lg text-gray-900 mt-1">₹{Math.round(metrics.totalRevenue * 0.09).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="text-gray-500">SGST (9%) Output Tax</div>
                    <div className="font-bold text-lg text-gray-900 mt-1">₹{Math.round(metrics.totalRevenue * 0.09).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 12: Reviews & Support Inbox */}
          {activeModule === 'support' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Reviews & Support Inbox</h1>
                <p className="text-xs text-gray-500 mt-1">Moderate customer reviews & resolve customer support tickets.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-sm text-gray-900">Open Customer Support Tickets</div>
                <div className="space-y-2">
                  {supportTickets.map(t => (
                    <div key={t.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{t.subject}</div>
                        <div className="text-[10px] text-gray-500">From: {t.customerName} ({t.email}) • {t.category}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 13: AI Campaign Strategist & Growth Advisor */}
          {activeModule === 'ai' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#7e0022]">
                  <Bot size={32} />
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">AI Campaign Strategist & Marketing Advisor</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Automated campaign recommendations, discount rules & high-ROI marketing strategies.</p>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" /> AI Advisor Active & Analyzing Store Data
                </div>
              </div>

              {/* AI Real-Time Growth Insight Banner */}
              <div className="bg-gradient-to-r from-[#7e0022] via-[#a3153c] to-[#d0385c] text-white p-6 rounded-xl shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#febac4]">
                    <Zap size={16} /> Real-Time Growth Strategy Insight
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">Confidence Score: 98%</span>
                </div>
                <p className="text-sm font-light leading-relaxed">
                  &ldquo;Store analytics show <strong>Fit Quiz has 48.5% user engagement (3m 45s avg dwell time)</strong>, but only 34% complete checkout immediately. Recommended action: Launch a <strong>&apos;QUIZ50&apos;</strong> discount campaign offering ₹50 OFF for quiz completers to capture ₹52,000+ in extra monthly revenue.&rdquo;
                </p>
              </div>

              {/* Recommended AI Marketing Campaigns List */}
              <div className="space-y-4">
                <div className="font-bold text-sm text-gray-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag size={16} className="text-[#d0385c]" /> High-ROI Recommended Campaigns to Run Now
                  </span>
                  <span className="text-xs text-gray-400">Based on live user behavior & inventory</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Campaign 1 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">High Priority</span>
                        <span className="text-xs font-mono font-bold text-[#7e0022]">QUIZ50</span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">Fit Quiz Completion Special</div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Offer ₹50 OFF for users who complete the 60-second Fit Finder quiz. Targets the 48.5% of visitors spending 3+ minutes on the quiz.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Offer: <strong>₹50 OFF (Min ₹399)</strong></span>
                        <span className="text-emerald-600 font-bold">+24% Conv</span>
                      </div>
                      <button 
                        onClick={() => handleMutation('addItem', 'coupons', { code: 'QUIZ50', discountType: 'Fixed ₹', value: 50, minOrderValue: 399, expiryDate: '2026-12-31', status: 'Active' })}
                        className="w-full bg-[#d0385c] hover:bg-[#b02b4a] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        🚀 1-Click Launch Campaign & Create Coupon
                      </button>
                    </div>
                  </div>

                  {/* Campaign 2 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Night Flow</span>
                        <span className="text-xs font-mono font-bold text-[#7e0022]">NIGHTSAFE15</span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">Overnight Sleep Peace Promo</div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Give 15% OFF on Overnight 360mm pads to recover the 18.4% abandoned carts on heavy flow products.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Offer: <strong>15% OFF (Min ₹499)</strong></span>
                        <span className="text-emerald-600 font-bold">+18% Conv</span>
                      </div>
                      <button 
                        onClick={() => handleMutation('addItem', 'coupons', { code: 'NIGHTSAFE15', discountType: 'Percentage', value: 15, minOrderValue: 499, expiryDate: '2026-12-31', status: 'Active' })}
                        className="w-full bg-[#d0385c] hover:bg-[#b02b4a] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        🚀 1-Click Launch Campaign & Create Coupon
                      </button>
                    </div>
                  </div>

                  {/* Campaign 3 */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Inventory Clear</span>
                        <span className="text-xs font-mono font-bold text-[#7e0022]">FREESHIP499</span>
                      </div>
                      <div className="font-bold text-sm text-gray-900">Daytime Pack Free Shipping</div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Free express shipping on all daytime 240mm & 280mm combo orders to boost average order value above ₹499.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Offer: <strong>Free Shipping</strong></span>
                        <span className="text-emerald-600 font-bold">+31% AOV</span>
                      </div>
                      <button 
                        onClick={() => handleMutation('addItem', 'coupons', { code: 'FREESHIP499', discountType: 'Free Shipping', value: 49, minOrderValue: 499, expiryDate: '2026-12-31', status: 'Active' })}
                        className="w-full bg-[#d0385c] hover:bg-[#b02b4a] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        🚀 1-Click Launch Campaign & Create Coupon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Custom Campaign Strategy Generator Tool */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#d0385c]" /> Custom AI Campaign & Discount Strategy Generator
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Describe your goal (e.g. 'Clear Regular Pad stock', 'Boost weekend sales', 'Target heavy flow shoppers')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                  />
                  <button 
                    onClick={() => {
                      if (!aiPrompt) return;
                      setAiLoading(true);
                      setTimeout(() => {
                        setAiGeneratedText(`🎯 Recommended Campaign Strategy:

• Campaign Name: "Comfi ${aiPrompt} Growth Blitz"
• Suggested Coupon Code: "BOOST20"
• Discount Rule: 20% OFF on cart total above ₹499
• Recommended Ad Copy Pitch: "Switch to 100% organic cotton comfort. Zero rashes, zero leaks. Use code BOOST20 for 20% OFF today!"
• Targeted Audience: Instagram / Facebook Women 18-35 interested in organic wellness & period care.
• Estimated Impact: +28% increase in weekend checkout completion rate.`);
                        setAiLoading(false);
                      }, 1000);
                    }}
                    disabled={aiLoading}
                    className="bg-[#d0385c] hover:bg-[#b02b4a] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Campaign Strategy
                  </button>
                </div>

                {aiGeneratedText && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line font-mono space-y-3">
                    <div>{aiGeneratedText}</div>
                    <button 
                      onClick={() => handleMutation('addItem', 'coupons', { code: 'BOOST20', discountType: 'Percentage', value: 20, minOrderValue: 499, expiryDate: '2026-12-31', status: 'Active' })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-sans font-bold text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Apply BOOST20 Coupon to Store Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module 14: Settings & Audit Logs */}
          {activeModule === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Admin Settings & Audit Logs</h1>
                <p className="text-xs text-gray-500 mt-1">Security activity trail, role permissions & store maintenance mode.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="font-bold text-sm text-gray-900">Admin Activity & Security Audit Trail</div>
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-gray-50 rounded border border-gray-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-800">{log.user}: </span>
                        <span className="text-gray-600">{log.action}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl p-4 space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Global Search (orders, products, customers, coupons)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-sm outline-hidden text-gray-800"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
              {searchQuery.trim() === '' ? (
                <div className="text-gray-400 text-center py-6">Type to search across all store records...</div>
              ) : (
                <>
                  <div className="font-bold text-gray-400 uppercase text-[10px] px-2">Products</div>
                  {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                    <div key={p.id} onClick={() => { setActiveModule('products'); setIsSearchOpen(false); }} className="p-2 hover:bg-gray-100 rounded cursor-pointer flex justify-between">
                      <span className="font-bold text-gray-800">{p.name}</span>
                      <span className="text-gray-500">₹{p.price}</span>
                    </div>
                  ))}

                  <div className="font-bold text-gray-400 uppercase text-[10px] px-2 pt-2">Orders</div>
                  {orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                    <div key={o.id} onClick={() => { setActiveModule('orders'); setIsSearchOpen(false); }} className="p-2 hover:bg-gray-100 rounded cursor-pointer flex justify-between">
                      <span className="font-bold text-[#7e0022]">{o.id} - {o.customerName}</span>
                      <span className="text-gray-500">₹{o.totalAmount}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {activeModal === 'productForm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-lg text-gray-900">{selectedItem ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Comfi Ultra Thin - Regular"
                  value={productForm.name} 
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">SKU Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. COMFI-REG-240-10"
                  value={productForm.sku} 
                  onChange={e => setProductForm({ ...productForm, sku: e.target.value })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 font-mono" 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category / Collection</label>
                <select 
                  value={productForm.category} 
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2"
                >
                  <option value="Daytime Essentials">Daytime Essentials</option>
                  <option value="Night & Heavy Flow">Night & Heavy Flow</option>
                  <option value="Organic Cotton Line">Organic Cotton Line</option>
                  <option value="Trial & Sample Packs">Trial & Sample Packs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Size & Length Variant</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={productForm.size} 
                    onChange={e => setProductForm({ ...productForm, size: e.target.value })} 
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Large">Large</option>
                    <option value="XL">XL</option>
                    <option value="Overnight">Overnight</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="240mm"
                    value={productForm.length} 
                    onChange={e => setProductForm({ ...productForm, length: e.target.value })} 
                    className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Regular Price (₹)</label>
                <input 
                  type="number" 
                  value={productForm.price} 
                  onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sale Price (₹)</label>
                <input 
                  type="number" 
                  value={productForm.salePrice} 
                  onChange={e => setProductForm({ ...productForm, salePrice: Number(e.target.value) })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Inventory Stock</label>
                <input 
                  type="number" 
                  value={productForm.stock} 
                  onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Min Stock Threshold Alert</label>
                <input 
                  type="number" 
                  value={productForm.minStockThreshold} 
                  onChange={e => setProductForm({ ...productForm, minStockThreshold: Number(e.target.value) })} 
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2" 
                />
              </div>
            </div>

            {/* Product & Variant Image URLs with Thumbnail Previews */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3 text-xs">
              <div className="font-bold text-gray-800 flex items-center gap-1.5">
                <Package size={14} className="text-[#d0385c]" /> Main Product Image & Variant Image URLs
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Main Product Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={productForm.imageUrl || ''} 
                      onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} 
                      className="flex-1 bg-white border border-gray-300 rounded p-2" 
                      placeholder="/images/cotton_pad_hero.jpg"
                    />
                    {productForm.imageUrl && (
                      <img src={productForm.imageUrl} alt="Main" className="w-9 h-9 rounded object-cover border border-gray-300" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">{productForm.size} Size Variant Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={productForm.variantImageUrl || ''} 
                      onChange={e => setProductForm({ ...productForm, variantImageUrl: e.target.value })} 
                      className="flex-1 bg-white border border-gray-300 rounded p-2" 
                      placeholder="/images/cotton_pad_box.jpg"
                    />
                    {productForm.variantImageUrl && (
                      <img src={productForm.variantImageUrl} alt="Variant" className="w-9 h-9 rounded object-cover border border-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Box with AI Auto-Generator Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Product Description</label>
                <button 
                  type="button"
                  onClick={handleAutoGenerateProductDescription}
                  className="bg-[#febac4]/30 hover:bg-[#febac4]/60 text-[#7e0022] px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border border-[#d0385c]/20 transition-all shadow-2xs"
                >
                  <Sparkles size={12} className="text-[#d0385c]" /> ✨ Auto-Generate Description (AI based on filled details)
                </button>
              </div>
              <textarea 
                rows={3} 
                placeholder="Click the AI button above to auto-generate from entered details, or type custom description..."
                value={productForm.description} 
                onChange={e => setProductForm({ ...productForm, description: e.target.value })} 
                className="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs leading-relaxed" 
              />
            </div>

            {/* SEO Meta Title & Description */}
            <div className="space-y-2 text-xs pt-1 border-t border-gray-100">
              <label className="font-bold text-gray-700 block">SEO Title & Meta Description</label>
              <input 
                type="text" 
                placeholder="SEO Title..."
                value={productForm.seoTitle || ''} 
                onChange={e => setProductForm({ ...productForm, seoTitle: e.target.value })} 
                className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs" 
              />
              <input 
                type="text" 
                placeholder="SEO Meta Description..."
                value={productForm.seoDescription || ''} 
                onChange={e => setProductForm({ ...productForm, seoDescription: e.target.value })} 
                className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs" 
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700">Cancel</button>
              <button 
                onClick={() => handleMutation(selectedItem ? 'updateItem' : 'addItem', 'products', productForm, selectedItem?.id)}
                className="px-5 py-2 bg-[#d0385c] text-white rounded-lg text-xs font-bold hover:bg-[#b02b4a]"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Coupon */}
      {activeModal === 'couponForm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-base text-gray-900">Create Discount Coupon</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Coupon Code</label>
              <input type="text" placeholder="e.g. FESTIVE20" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full bg-gray-50 border border-gray-300 rounded p-2 font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded p-2">
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed ₹">Fixed Amount (₹)</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Value</label>
                <input type="number" value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-300 rounded p-2" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Minimum Order Value (₹)</label>
              <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-300 rounded p-2" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700">Cancel</button>
              <button 
                onClick={() => handleMutation('addItem', 'coupons', couponForm)}
                className="px-5 py-2 bg-[#d0385c] text-white rounded-lg font-bold hover:bg-[#b02b4a]"
              >
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
