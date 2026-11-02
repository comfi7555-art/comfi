# Comfi | Premium Ultra Thin Sanitary Pads

> **Zero Leaks. Zero Irritation. Engineered for Unmatched Comfort.**

Comfi is a modern D2C feminine wellness e-commerce platform crafted with Next.js, Tailwind CSS, Supabase, and Razorpay. Designed with a warm apothecary aesthetic, interactive customized pad pack builders, and secure customer accounts.

---

## ✨ Features

- **🌸 Custom Pack Builder**: Build your own custom mix of Regular (240mm), Large (280mm), and Overnight (360mm) pads.
- **🛡️ Secure Customer Hub**: Complete account management with saved addresses, orders, and Google OAuth / Email authentication.
- **⚡ Ultra-Fast Next.js App Router**: Optimized SEO metadata, OpenGraph cards, and fast page transitions.
- **🎨 Luxury Aesthetic**: Bespoke typography with Playfair Display, soft blush palettes, and fluid GSAP micro-interactions.
- **💳 Payments & Checkout**: Razorpay integration with automated order calculation and GST verification.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (Optional for testing)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# JWT Secret
JWT_SECRET=your-secret-key
```

### 3. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS
- **Animations**: GSAP & Lucide Icons
- **Database / Auth**: Supabase & Local DB Fallback
- **Payments**: Razorpay

---

## 📄 License

Proprietary © 2026 Comfi Care. All rights reserved.
