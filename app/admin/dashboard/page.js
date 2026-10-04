"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import ScrollReveal from '../../components/ScrollReveal';
import { LogOut, Package, ShoppingCart, Users, Plus, Edit2, Trash2, Save, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { token, user, authLoading, logout, API_URL } = useApp();
  const router = useRouter();

  // Active view: 'catalog' | 'orders' | 'crm'
  const [activeTab, setActiveTab] = useState('catalog');

  // State arrays
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    size: 'Regular',
    length: '240mm',
    packCount: 10,
    price: 199,
    stock: 100,
    description: '',
    features: ''
  });

  // Security authorization checks
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error("Error loading products", err); }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error("Error loading orders", err); }
  };

  const fetchCustomers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/crm/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCustomers(await res.json());
    } catch (err) { console.error("Error loading CRM", err); }
  };

  const loadAllData = async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([fetchProducts(), fetchOrders(), fetchCustomers()]);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token, API_URL]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditProduct(null);
  };

  // Product CRUD
  const handleProductEditClick = (product) => {
    if (product === 'new') {
      setEditProduct('new');
      setProductForm({
        name: '',
        size: 'Regular',
        length: '240mm',
        packCount: 10,
        price: 199,
        stock: 100,
        description: '',
        features: ''
      });
    } else {
      setEditProduct(product);
      setProductForm({
        name: product.name,
        size: product.size,
        length: product.length || '',
        packCount: product.packCount || 10,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        features: product.features ? product.features.join(', ') : ''
      });
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Product deleted successfully.");
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const featuresArray = productForm.features 
      ? productForm.features.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    const payload = {
      ...productForm,
      packCount: Number(productForm.packCount),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      features: featuresArray
    };

    const isNew = editProduct === 'new';
    const method = isNew ? 'POST' : 'PUT';
    const endpoint = isNew ? '/products' : `/products/${editProduct.id || editProduct._id}`;

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isNew ? "Product added successfully!" : "Product updated successfully!");
        setEditProduct(null);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save product.");
      }
    } catch (err) {
      alert("Error saving product.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="utility-label text-accent font-black animate-pulse">Verifying credentials...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // redirects in useEffect
  }

  return (
    <div className="min-h-screen bg-background-primary text-primaryText flex flex-col">
      
      {/* Admin header */}
      <header className="bg-[#262626] text-[#fdf8f3] h-20 px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black tracking-tighter">COMFI ADMIN</span>
          <span className="bg-accent text-[#262626] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            Control Dashboard
          </span>
        </div>

        <button 
          onClick={() => { logout(); router.push('/admin'); }}
          className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#fdf8f3] hover:text-accent transition-colors"
        >
          <LogOut size={14} /> Log Out
        </button>
      </header>

      {/* Main dashboard navigation content grid */}
      <div className="flex-grow flex flex-col md:flex-row">
        
        {/* Sidebar navigation */}
        <aside className="w-full md:w-64 bg-background-secondary border-b md:border-b-0 md:border-r border-primaryText/5 p-6 flex flex-col gap-2">
          <span className="utility-label text-primaryText/40 mb-3 block">Navigation</span>
          
          <button
            onClick={() => handleTabChange('catalog')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'catalog' ? 'bg-[#262626] text-[#fdf8f3]' : 'hover:bg-primaryText/5 text-primaryText'
            }`}
          >
            <Package size={16} /> Catalog Mgr
          </button>
          
          <button
            onClick={() => handleTabChange('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'orders' ? 'bg-[#262626] text-[#fdf8f3]' : 'hover:bg-primaryText/5 text-primaryText'
            }`}
          >
            <ShoppingCart size={16} /> Orders Tracker
          </button>
          
          <button
            onClick={() => handleTabChange('crm')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${
              activeTab === 'crm' ? 'bg-[#262626] text-[#fdf8f3]' : 'hover:bg-primaryText/5 text-primaryText'
            }`}
          >
            <Users size={16} /> CRM Database
          </button>

          <div className="mt-auto pt-6 border-t border-primaryText/10">
            <button 
              onClick={loadAllData}
              className="w-full bg-background-primary border border-primaryText/10 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primaryText/5 flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Reload Data
            </button>
          </div>
        </aside>

        {/* Dashboard workspace panel */}
        <main className="flex-grow p-8">
          
          {loading && (
            <div className="bg-accent/10 border border-accent/20 text-primaryText text-xs font-bold p-3 rounded-lg mb-6 tracking-wider">
              Syncing live server database records...
            </div>
          )}

          {/* CATALOG MANAGEMENT TAB */}
          {activeTab === 'catalog' && (
            <ScrollReveal>
              <div className="flex justify-between items-center mb-8 border-b border-primaryText/10 pb-4">
                <div>
                  <h2 className="text-3xl font-black heading-premium text-primaryText">CATALOG MANAGEMENT</h2>
                  <p className="text-xs text-primaryText/50 mt-1">Manage Comfi ultra-thin pad product sizes, count listings, stock numbers, and pricing levels.</p>
                </div>
                {!editProduct && (
                  <button
                    onClick={() => handleProductEditClick('new')}
                    className="bg-accent text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                )}
              </div>

              {/* Edit/Add Form */}
              {editProduct ? (
                <form onSubmit={handleProductSubmit} className="bg-background-secondary p-8 rounded-2xl border border-primaryText/5 max-w-2xl flex flex-col gap-4">
                  <h3 className="utility-label text-accent font-black">{editProduct === 'new' ? 'ADD NEW CATALOG PRODUCT' : `EDIT: ${editProduct.name}`}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Product Title</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                        placeholder="Comfi Ultra Thin - Regular"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Sizing Category</label>
                      <select
                        value={productForm.size}
                        onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText font-bold"
                      >
                        <option value="Regular">Regular (240mm)</option>
                        <option value="Large">Large (280mm)</option>
                        <option value="XL">XL (320mm)</option>
                        <option value="Overnight">Overnight (360mm)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Length (mm)</label>
                      <input
                        type="text"
                        value={productForm.length}
                        onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                        placeholder="240mm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Pack Count</label>
                      <input
                        type="number"
                        value={productForm.packCount}
                        onChange={(e) => setProductForm({ ...productForm, packCount: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Price (₹)</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Inventory Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                      placeholder="Write comfort and safety product description details..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-primaryText/60 mb-1.5 block">Features Claims (comma separated)</label>
                    <input
                      type="text"
                      value={productForm.features}
                      onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                      className="w-full bg-background-primary border border-primaryText/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent text-primaryText"
                      placeholder="Zero irritation, Wide wings, Organic cotton feel"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="bg-accent text-[#262626] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                      <Save size={14} /> Save Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProduct(null)}
                      className="bg-background-primary text-primaryText border border-primaryText/10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primaryText/5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Catalog Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {products.map(product => (
                    <div key={product.id || product._id} className="bg-background-secondary p-6 rounded-2xl border border-primaryText/5 flex justify-between gap-4">
                      <div className="flex-grow">
                        <span className="utility-label text-accent font-black tracking-widest block mb-1">{product.size} • {product.length}</span>
                        <h4 className="text-xl font-black text-primaryText">{product.name}</h4>
                        
                        <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-primaryText/60">
                          <div>
                            Price: <span className="font-bold text-primaryText">₹{product.price}</span>
                          </div>
                          <div>
                            Stock: <span className={`font-bold ${product.stock < 20 ? 'text-red-500 font-black' : 'text-primaryText'}`}>{product.stock} units</span>
                          </div>
                          <div>
                            Pads: <span className="font-bold text-primaryText">{product.packCount} pcs</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-center">
                        <button
                          onClick={() => handleProductEditClick(product)}
                          className="p-2 bg-background-primary border border-primaryText/5 rounded-lg text-primaryText hover:text-accent transition-colors"
                          title="Edit Product details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleProductDelete(product.id || product._id)}
                          className="p-2 bg-background-primary border border-primaryText/5 rounded-lg text-primaryText hover:text-red-500 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>
          )}

          {/* ORDERS TRACKING TAB */}
          {activeTab === 'orders' && (
            <ScrollReveal>
              <div className="mb-8 border-b border-primaryText/10 pb-4">
                <h2 className="text-3xl font-black heading-premium text-primaryText">ORDERS TRACKING</h2>
                <p className="text-xs text-primaryText/50 mt-1">Track purchase details and logistics status of customer orders.</p>
              </div>

              <div className="flex flex-col gap-6">
                {orders.length > 0 ? (
                  orders.map(order => {
                    const paymentStatus = order.paymentStatus || order.payment_status;
                    const orderStatus = order.orderStatus || order.order_status;
                    return (
                      <div key={order.id || order._id} className="bg-background-secondary p-6 rounded-2xl border border-primaryText/5 flex flex-col gap-4">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-primaryText/5 pb-4 gap-4">
                          <div>
                            <div className="text-[10px] font-black text-primaryText/40 uppercase tracking-widest">
                              Order ID: {order.id || order._id} • {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                            </div>
                            <h4 className="text-sm font-bold text-primaryText mt-1">
                              Customer: {order.customerName} ({order.customerEmail})
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <select
                              value={paymentStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id || order._id, { paymentStatus: e.target.value })}
                              className="bg-background-primary border border-primaryText/10 text-xs px-3 py-1.5 rounded-lg font-bold text-primaryText focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed</option>
                            </select>

                            <select
                              value={orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id || order._id, { orderStatus: e.target.value })}
                              className="bg-background-primary border border-primaryText/10 text-xs px-3 py-1.5 rounded-lg font-bold text-primaryText focus:outline-none"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          <div>
                            <span className="utility-label text-primaryText/40 block mb-2">Order Items</span>
                            <ul className="space-y-1.5 list-disc list-inside text-primaryText/80 font-medium">
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  <span className="font-bold">{item.name}</span> x {item.quantity} (₹{item.price * item.quantity})
                                </li>
                              ))}
                            </ul>
                            <div className="text-sm font-black text-primaryText mt-4">
                              Total amount: ₹{order.totalAmount || order.total_amount}
                            </div>
                          </div>

                          <div>
                            <span className="utility-label text-primaryText/40 block mb-2">Delivery Address</span>
                            {order.shippingAddress ? (
                              <div className="leading-relaxed font-light text-primaryText/75">
                                <div className="font-bold text-primaryText">{order.shippingAddress.name}</div>
                                <div>{order.shippingAddress.address}</div>
                                <div>{order.shippingAddress.city} - {order.shippingAddress.postalCode}</div>
                                <div>Phone: {order.shippingAddress.phone}</div>
                              </div>
                            ) : (
                              <span className="text-primaryText/40 italic">No shipping details provided.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-primaryText/40 font-light bg-background-secondary rounded-2xl border border-primaryText/5">
                    No orders have been recorded in the database yet.
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* CRM DATABASE TAB */}
          {activeTab === 'crm' && (
            <ScrollReveal>
              <div className="mb-8 border-b border-primaryText/10 pb-4">
                <h2 className="text-3xl font-black heading-premium text-primaryText">CRM DATABASE</h2>
                <p className="text-xs text-primaryText/50 mt-1">Review basic database summaries of customers, purchase limits, and billing logs.</p>
              </div>

              <div className="bg-background-secondary rounded-2xl border border-primaryText/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-primaryText border-collapse">
                    <thead>
                      <tr className="bg-[#262626] text-[#fdf8f3] utility-label text-[9px] tracking-wider">
                        <th className="px-6 py-4">Customer Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4 text-center">Total Orders</th>
                        <th className="px-6 py-4 text-right">Lifetime Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primaryText/5">
                      {customers.length > 0 ? (
                        customers.map(cust => (
                          <tr key={cust.id} className="hover:bg-background-primary/45 transition-colors font-medium">
                            <td className="px-6 py-4 font-bold text-primaryText">{cust.name}</td>
                            <td className="px-6 py-4 text-primaryText/70">{cust.email}</td>
                            <td className="px-6 py-4 text-center">{cust.totalOrdersCount} orders</td>
                            <td className="px-6 py-4 text-right font-black text-primaryText">₹{cust.totalSpent}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-primaryText/40 font-light">
                            No customer records found. As users register and place orders, their CRM files will seed here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          )}

        </main>
      </div>

    </div>
  );
}
