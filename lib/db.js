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
      stock: 120,
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
      description: "Premium large ultra-thin pads offering high absorbency for medium to heavy flow days. Skin-friendly, extra flexible, and features advanced rash-protection technology.",
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
      description: "Extra-long pads optimized for heavy daytime or active protection. Maximized surface coverage with zero bulkiness, enabling free movement without leakage fears.",
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
      description: "Specialized overnight pads with an extra-wide back to prevent leaks while sleeping. Delivers up to 12-hour protection, remaining completely breathable.",
      features: [
        "360mm night safety length",
        "Extra-wide back wing coverage",
        "Up to 12-hour leak defense",
        "Zero-bulk comfortable sleep design"
      ],
      reviews: [
        { user: "Tanya G.", rating: 5, comment: "I slept peacefully for the first time without worrying about stains. Super wide back!", date: "2026-06-19" }
      ]
    }
  ],
  users: [],
  orders: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
}

// Check Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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
  }
};
