import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DB_FILE = path.join(process.cwd(), 'data/db.json');

// Ensure database directory and file exist for fallback
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultDB = {
  products: [
    {
      id: "prod_regular_10",
      name: "Comfi Ultra Thin - Regular",
      size: "Regular",
      length: "240mm",
      packCount: 10,
      price: 199,
      salePrice: 179,
      stock: 120,
      minStockThreshold: 30,
      sku: "COMFI-REG-240-10",
      category: "Daytime Essentials",
      visibility: "Published",
      featured: true,
      description: "Ultra-thin regular pads with wide wings designed for active daytime comfort. Features an irritation-free cotton feel, quick absorption lock layer, and leak-proof barriers.",
      features: [
        "Breathable top layer for zero irritation",
        "Wide wings for secure fit",
        "Individually wrapped in paper for hygienic disposal",
        "Dry-lock core prevents daytime leaks"
      ],
      seoTitle: "Comfi Ultra Thin Regular 240mm Pads | Organic Cotton Comfort",
      seoDescription: "Buy Comfi Ultra Thin Regular 240mm pads. Rash-free 100% organic cotton top sheet with leak lock technology.",
      reviews: [
        { id: "rev_1", user: "Sarah M.", email: "sarah.m@example.com", rating: 5, comment: "Incredibly thin and comfortable. Forgot I was even wearing it!", date: "2026-06-15", verified: true, status: "approved" },
        { id: "rev_2", user: "Aisha K.", email: "aisha.k@example.com", rating: 4, comment: "Great for regular days, rash-free indeed.", date: "2026-06-10", verified: true, status: "approved" }
      ]
    },
    {
      id: "prod_large_10",
      name: "Comfi Ultra Thin - Large",
      size: "Large",
      length: "280mm",
      packCount: 10,
      price: 249,
      salePrice: 229,
      stock: 85,
      minStockThreshold: 20,
      sku: "COMFI-LRG-280-10",
      category: "Daytime Essentials",
      visibility: "Published",
      featured: true,
      description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days. Skin-friendly, extra flexible, and features advanced rash-protection technology.",
      features: [
        "Ultra-absorbent gel core",
        "Hypoallergenic skin-safe top sheet",
        "Wide-wing grip to prevent shifting",
        "Super breathable back sheet"
      ],
      seoTitle: "Comfi Ultra Thin Large 280mm Pads | High Absorbency Protection",
      seoDescription: "Buy Comfi Large 280mm pads for medium to heavy flow days. Skin-friendly cotton feel with extra flexible wings.",
      reviews: [
        { id: "rev_3", user: "Priya R.", email: "priya.r@example.com", rating: 5, comment: "Hands down the best pad I have used. Zero rashes, completely dry.", date: "2026-06-18", verified: true, status: "approved" }
      ]
    },
    {
      id: "prod_xl_10",
      name: "Comfi Ultra Thin - XL",
      size: "XL",
      length: "320mm",
      packCount: 10,
      price: 299,
      salePrice: 279,
      stock: 15,
      minStockThreshold: 25,
      sku: "COMFI-XL-320-10",
      category: "Night & Heavy Flow",
      visibility: "Published",
      featured: false,
      description: "Extra-long pads optimized for heavy daytime or active protection. Maximized surface coverage with zero bulkiness, enabling free movement without leakage fears.",
      features: [
        "320mm extra protection coverage",
        "High fluid absorption limit",
        "Contoured shape for active movement",
        "Individually sealed for hygiene"
      ],
      seoTitle: "Comfi Ultra Thin XL 320mm Pads | Maximum Active Coverage",
      seoDescription: "Shop Comfi XL 320mm extra-long pads for heavy flow days. Ultra-absorbent contoured core with zero leakage.",
      reviews: [
        { id: "rev_4", user: "Meera S.", email: "meera.s@example.com", rating: 5, comment: "The length is perfect and it feels so light. Love the cottony texture.", date: "2026-06-20", verified: true, status: "approved" }
      ]
    },
    {
      id: "prod_overnight_10",
      name: "Comfi Ultra Thin - Overnight",
      size: "Overnight",
      length: "360mm",
      packCount: 10,
      price: 349,
      salePrice: 319,
      stock: 45,
      minStockThreshold: 15,
      sku: "COMFI-OVR-360-10",
      category: "Night & Heavy Flow",
      visibility: "Published",
      featured: true,
      description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping. Delivers up to 12-hour protection, remaining completely breathable.",
      features: [
        "360mm night safety length",
        "Extra-wide back wing coverage",
        "Up to 12-hour leak defense",
        "Zero-bulk comfortable sleep design"
      ],
      seoTitle: "Comfi Ultra Thin Overnight 360mm Pads | 12-Hour Night Defense",
      seoDescription: "Sleep peaceful with Comfi Overnight 360mm pads. Extra-wide back wings prevent leaks all night long.",
      reviews: [
        { id: "rev_5", user: "Tanya G.", email: "tanya.g@example.com", rating: 5, comment: "I slept peacefully for the first time without worrying about stains. Super wide back!", date: "2026-06-19", verified: true, status: "approved" }
      ]
    }
  ],
  users: [
    { id: "usr_101", name: "Ananya Sharma", email: "ananya.s@example.com", phone: "+91 98765 43210", role: "customer", status: "Active", totalOrders: 4, totalSpent: 1246, tags: ["VIP", "Repeat Customer"], notes: "Prefers eco-paper packaging.", address: "Flat 402, Lotus Apartments, Indiranagar, Bengaluru 560038" },
    { id: "usr_102", name: "Rohan Varma", email: "rohan.v@example.com", phone: "+91 98123 45678", role: "customer", status: "Active", totalOrders: 2, totalSpent: 648, tags: ["Gift Purchaser"], notes: "Ordered for family.", address: "B-12, Green Glen Layout, Bellandur, Bengaluru 560103" },
    { id: "usr_103", name: "Sneha Patel", email: "sneha.p@example.com", phone: "+91 97654 32109", role: "customer", status: "Active", totalOrders: 5, totalSpent: 1895, tags: ["VIP", "High Value"], notes: "Always orders Overnight + XL combo.", address: "78, Sector 15, Vashi, Navi Mumbai 400703" },
    { id: "usr_104", name: "Kavita Rao", email: "kavita.r@example.com", phone: "+91 96543 21098", role: "customer", status: "Flagged", totalOrders: 1, totalSpent: 349, tags: ["Suspicious", "COD Reject Risk"], notes: "Unresponsive phone verification.", address: "Plot 12, MG Road, Pune 411001" }
  ],
  orders: [
    {
      id: "ORD-9821",
      customerName: "Ananya Sharma",
      customerEmail: "ananya.s@example.com",
      customerPhone: "+91 98765 43210",
      totalAmount: 548,
      items: [
        { id: "prod_large_10", name: "Comfi Ultra Thin - Large", price: 249, quantity: 1 },
        { id: "prod_xl_10", name: "Comfi Ultra Thin - XL", price: 299, quantity: 1 }
      ],
      paymentMethod: "Razorpay (UPI)",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      shippingAddress: "Flat 402, Lotus Apartments, Indiranagar, Bengaluru 560038",
      courier: "Delhivery",
      trackingNumber: "DEL-8890123",
      createdAt: "2026-10-10T14:30:00.000Z"
    },
    {
      id: "ORD-9820",
      customerName: "Sneha Patel",
      customerEmail: "sneha.p@example.com",
      customerPhone: "+91 97654 32109",
      totalAmount: 698,
      items: [
        { id: "prod_overnight_10", name: "Comfi Ultra Thin - Overnight", price: 349, quantity: 2 }
      ],
      paymentMethod: "Razorpay (Credit Card)",
      paymentStatus: "Paid",
      orderStatus: "Shipped",
      shippingAddress: "78, Sector 15, Vashi, Navi Mumbai 400703",
      courier: "Bluedart",
      trackingNumber: "BD-904128",
      createdAt: "2026-10-09T18:15:00.000Z"
    },
    {
      id: "ORD-9819",
      customerName: "Rohan Varma",
      customerEmail: "rohan.v@example.com",
      customerPhone: "+91 98123 45678",
      totalAmount: 448,
      items: [
        { id: "prod_regular_10", name: "Comfi Ultra Thin - Regular", price: 199, quantity: 1 },
        { id: "prod_large_10", name: "Comfi Ultra Thin - Large", price: 249, quantity: 1 }
      ],
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "Pending",
      orderStatus: "Pending COD Verification",
      shippingAddress: "B-12, Green Glen Layout, Bellandur, Bengaluru 560103",
      courier: "Shiprocket",
      trackingNumber: "SR-334120",
      createdAt: "2026-10-09T11:20:00.000Z"
    },
    {
      id: "ORD-9818",
      customerName: "Kavita Rao",
      customerEmail: "kavita.r@example.com",
      customerPhone: "+91 96543 21098",
      totalAmount: 349,
      items: [
        { id: "prod_overnight_10", name: "Comfi Ultra Thin - Overnight", price: 349, quantity: 1 }
      ],
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "Pending",
      orderStatus: "Cancelled",
      shippingAddress: "Plot 12, MG Road, Pune 411001",
      courier: "N/A",
      trackingNumber: "-",
      createdAt: "2026-10-08T09:10:00.000Z"
    }
  ],
  coupons: [
    { id: "coup_1", code: "WELCOME10", discountType: "Percentage", value: 10, minOrderValue: 299, expiryDate: "2026-12-31", usageCount: 45, maxUses: 500, status: "Active" },
    { id: "coup_2", code: "FREESHIP", discountType: "Free Shipping", value: 49, minOrderValue: 399, expiryDate: "2026-11-30", usageCount: 120, maxUses: 1000, status: "Active" },
    { id: "coup_3", code: "COMFI50", discountType: "Fixed ₹", value: 50, minOrderValue: 499, expiryDate: "2026-10-31", usageCount: 18, maxUses: 200, status: "Active" }
  ],
  collections: [
    { id: "col_1", name: "Daytime Essentials", slug: "daytime-essentials", productCount: 2, description: "Ultra-breathable 240mm & 280mm pads for active days.", status: "Active" },
    { id: "col_2", name: "Night & Heavy Flow", slug: "night-heavy-flow", productCount: 2, description: "Maximum coverage 320mm & 360mm pads for leak-free sleep.", status: "Active" },
    { id: "col_3", name: "Trial & Sample Packs", slug: "trial-packs", productCount: 1, description: "Starter combo packs to discover your ideal absorbency match.", status: "Active" }
  ],
  inventoryLogs: [
    { id: "stk_1", productId: "prod_regular_10", productName: "Comfi Ultra Thin - Regular", change: +50, type: "Restock", reason: "Supplier Shipment #PO-402", date: "2026-10-08T10:00:00.000Z" },
    { id: "stk_2", productId: "prod_xl_10", productName: "Comfi Ultra Thin - XL", change: -10, type: "Adjustment", reason: "Quality Inspection Audit", date: "2026-10-07T14:30:00.000Z" }
  ],
  shippingRates: [
    { id: "ship_1", zoneName: "Standard All-India", minOrder: 0, maxOrder: 499, rate: 49, status: "Active" },
    { id: "ship_2", zoneName: "Free Shipping Above ₹499", minOrder: 499, maxOrder: 10000, rate: 0, status: "Active" },
    { id: "ship_3", zoneName: "Express Metro Delivery", minOrder: 0, maxOrder: 10000, rate: 99, status: "Active" }
  ],
  supportTickets: [
    { id: "tkt_1", customerName: "Ananya Sharma", email: "ananya.s@example.com", subject: "Track Order #ORD-9821", category: "Shipping Query", priority: "Medium", status: "Resolved", date: "2026-10-10" },
    { id: "tkt_2", customerName: "Sneha Patel", email: "sneha.p@example.com", subject: "Product exchange question", category: "Returns", priority: "Low", status: "Open", date: "2026-10-09" }
  ],
  auditLogs: [
    { id: "log_1", user: "Admin", action: "Updated Stock for Comfi Regular 240mm (+50)", ip: "192.168.1.1", timestamp: "2026-10-10T15:20:00.000Z" },
    { id: "log_2", user: "Admin", action: "Changed Order ORD-9820 status to Shipped", ip: "192.168.1.1", timestamp: "2026-10-09T18:20:00.000Z" },
    { id: "log_3", user: "Admin", action: "Created Coupon Code WELCOME10", ip: "192.168.1.1", timestamp: "2026-10-08T12:00:00.000Z" }
  ],
  contentSettings: {
    announcementBar: "✨ Free Shipping on all orders above ₹499 | 100% Organic Cotton Pads",
    heroTitle: "Feel Light. Feel Rash-Free. Feel Comfi.",
    heroSubtitle: "India's gentlest organic cotton ultra-thin pads designed for zero irritation.",
    quizHeadline: "Find Your Perfect Fit in 60 Seconds",
    maintenanceMode: false
  }
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
}

// Check Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// JSON File Database helpers
const fileDB = {
  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading local DB, resetting to defaults", err);
      return defaultDB;
    }
  },
  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  },
  getCollection(name) {
    const data = this.read();
    return data[name] || [];
  },
  saveCollection(name, items) {
    const data = this.read();
    data[name] = items;
    this.write(data);
  }
};

// Database Model Interfaces
export const db = {
  products: {
    async find(query = {}) {
      if (isSupabaseConfigured) {
        let builder = supabase.from('products').select('*');
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) {
            builder = builder.eq(key, value);
          }
        }
        const { data, error } = await builder;
        if (error) throw error;
        return data || [];
      }
      
      let items = fileDB.getCollection('products');
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          items = items.filter(item => String(item[key]) === String(value));
        }
      }
      return items;
    },

    async findById(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) {
          if (error.code === 'PGRST116') return null; // No row found
          throw error;
        }
        return data;
      }
      const items = fileDB.getCollection('products');
      return items.find(item => item.id === id) || null;
    },

    async create(productData) {
      const newProduct = {
        id: 'prod_' + Math.random().toString(36).substr(2, 9),
        reviews: [],
        features: [],
        ...productData
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('products');
      items.push(newProduct);
      fileDB.saveCollection('products', items);
      return newProduct;
    },

    async findByIdAndUpdate(id, updateData) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('products');
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...updateData };
      fileDB.saveCollection('products', items);
      return items[idx];
    },

    async findByIdAndDelete(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('products');
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) return null;
      const deleted = items.splice(idx, 1)[0];
      fileDB.saveCollection('products', items);
      return deleted;
    }
  },

  users: {
    // Used primarily in JSON mode, Supabase uses Auth API but profiles are updated
    async find(query = {}) {
      if (isSupabaseConfigured) {
        let builder = supabase.from('profiles').select('*');
        for (const [key, value] of Object.entries(query)) {
          builder = builder.eq(key, value);
        }
        const { data, error } = await builder;
        if (error) throw error;
        return data || [];
      }
      let items = fileDB.getCollection('users');
      for (const [key, value] of Object.entries(query)) {
        items = items.filter(item => String(item[key]) === String(value));
      }
      return items;
    },

    async findOne(query) {
      if (isSupabaseConfigured) {
        // Query from profiles table
        let builder = supabase.from('profiles').select('*');
        for (const [key, value] of Object.entries(query)) {
          builder = builder.eq(key, value);
        }
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('users');
      return items.find(user => {
        return Object.entries(query).every(([k, v]) => String(user[k]) === String(v));
      }) || null;
    },

    async create(userData) {
      const newUser = {
        id: userData.id || 'user_' + Math.random().toString(36).substr(2, 9),
        role: userData.role || 'customer',
        ...userData
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('profiles').insert([{
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }]).select().single();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('users');
      items.push(newUser);
      fileDB.saveCollection('users', items);
      return newUser;
    },

    async findById(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) return null;
        return data;
      }
      const items = fileDB.getCollection('users');
      return items.find(user => user.id === id || user._id === id) || null;
    },

    async findByIdAndUpdate(id, updateData) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('profiles').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }

      const items = fileDB.getCollection('users');
      const idx = items.findIndex(item => item.id === id || item._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...updateData };
      fileDB.saveCollection('users', items);
      return items[idx];
    }
  },

  otps: {
    async findOne(query) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('otps').select('*').match(query).maybeSingle();
        if (error) return null;
        return data;
      }
      const items = fileDB.getCollection('otps') || [];
      return items.find(otp => {
        return Object.entries(query).every(([k, v]) => String(otp[k]) === String(v));
      }) || null;
    },
    async create(otpData) {
      const newOtp = {
        id: 'otp_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...otpData
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('otps').insert([newOtp]).select().single();
        if (error) throw error;
        return data;
      }
      const items = fileDB.getCollection('otps') || [];
      items.push(newOtp);
      fileDB.saveCollection('otps', items);
      return newOtp;
    },
    async deleteMany(query) {
      if (isSupabaseConfigured) {
        let builder = supabase.from('otps').delete();
        for (const [key, value] of Object.entries(query)) {
          builder = builder.eq(key, value);
        }
        await builder;
        return;
      }
      let items = fileDB.getCollection('otps') || [];
      items = items.filter(otp => {
        return !Object.entries(query).every(([k, v]) => String(otp[k]) === String(v));
      });
      fileDB.saveCollection('otps', items);
    }
  },

  orders: {
    async find(query = {}) {
      if (isSupabaseConfigured) {
        let builder = supabase.from('orders').select('*').order('created_at', { ascending: false });
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) {
            builder = builder.eq(key, value);
          }
        }
        const { data, error } = await builder;
        if (error) throw error;
        return data || [];
      }

      let items = fileDB.getCollection('orders');
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          items = items.filter(item => String(item[key]) === String(value));
        }
      }
      return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async findById(id) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error) return null;
        return data;
      }
      const items = fileDB.getCollection('orders');
      return items.find(order => order.id === id) || null;
    },

    async create(orderData) {
      const newOrder = {
        id: 'ord_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(), // compatibility field
        payment_status: 'Pending',
        paymentStatus: 'Pending',
        order_status: 'Processing',
        orderStatus: 'Processing',
        ...orderData
      };

      if (isSupabaseConfigured) {
        // Adapt fields to snake_case for Supabase
        const adaptedOrder = {
          id: newOrder.id,
          user_id: orderData.userId,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          items: orderData.items,
          total_amount: orderData.totalAmount,
          shipping_address: orderData.shippingAddress,
          payment_status: newOrder.payment_status,
          order_status: newOrder.order_status,
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: orderData.razorpayPaymentId
        };
        const { data, error } = await supabase.from('orders').insert([adaptedOrder]).select().single();
        if (error) throw error;
        // Adapt back to camelCase
        return {
          ...data,
          userId: data.user_id,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          totalAmount: data.total_amount,
          shippingAddress: data.shipping_address,
          paymentStatus: data.payment_status,
          orderStatus: data.order_status,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          createdAt: data.created_at
        };
      }

      const items = fileDB.getCollection('orders');
      items.push(newOrder);
      fileDB.saveCollection('orders', items);
      return newOrder;
    },

    async findByIdAndUpdate(id, updateData) {
      if (isSupabaseConfigured) {
        // Adapt fields
        const adapted = {};
        if (updateData.paymentStatus !== undefined) adapted.payment_status = updateData.paymentStatus;
        if (updateData.orderStatus !== undefined) adapted.order_status = updateData.orderStatus;
        if (updateData.razorpayPaymentId !== undefined) adapted.razorpay_payment_id = updateData.razorpayPaymentId;
        if (updateData.trackingDetails !== undefined) adapted.tracking_details = updateData.trackingDetails;

        const { data, error } = await supabase.from('orders').update(adapted).eq('id', id).select().single();
        if (error) throw error;
        return {
          ...data,
          userId: data.user_id,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          totalAmount: data.total_amount,
          shippingAddress: data.shipping_address,
          paymentStatus: data.payment_status,
          orderStatus: data.order_status,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          createdAt: data.created_at
        };
      }

      const items = fileDB.getCollection('orders');
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...updateData };
      fileDB.saveCollection('orders', items);
      return items[idx];
    }
  },

  generic: {
    async getCollection(name) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from(name).select('*');
          if (!error && data && data.length > 0) return data;
        } catch (e) {
          // fallback to local
        }
      }
      return fileDB.getCollection(name);
    },
    async saveCollection(name, items) {
      fileDB.saveCollection(name, items);
      return items;
    },
    async addItem(name, itemData) {
      const items = fileDB.getCollection(name);
      const newItem = {
        id: itemData.id || `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
        ...itemData
      };
      items.unshift(newItem);
      fileDB.saveCollection(name, items);
      return newItem;
    },
    async updateItem(name, id, updateData) {
      const items = fileDB.getCollection(name);
      const idx = items.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updateData, updatedAt: new Date().toISOString() };
        fileDB.saveCollection(name, items);
        return items[idx];
      }
      return null;
    },
    async deleteItem(name, id) {
      const items = fileDB.getCollection(name);
      const filtered = items.filter(i => String(i.id) !== String(id));
      fileDB.saveCollection(name, filtered);
      return true;
    }
  }
};
