# PROJECT SYNOPSIS
## Title of the Project: **COMFI: A Smart E-Commerce Platform for Custom Menstrual Hygiene Solutions and Personalized Period Subscriptions**

---

### **1. Title**
* **Title:** **COMFI: A Smart E-Commerce Platform for Custom Menstrual Hygiene Solutions and Personalized Period Subscriptions**
* **Scope and Self-Explanation:** The title reflects the project's direct-to-consumer (D2C) e-commerce approach, specializing in the personalization of menstrual hygiene packages (specifically sanitary pads) tailored dynamically to individual customer cycle parameters. 

---

### **2. Introduction**
* **Brief History:** Historically, menstrual hygiene management (MHM) products have been distributed through standard retail models as "one-size-fits-all" bulk packages. Commercial brands typically package a single pad size (e.g., Regular, Large, or XL) in standard counts. However, medical research shows that a user's cycle features highly variable menstrual flow rates across different days (e.g., heavy flow at the beginning, tapering down on later days, and varying physical coverage demands during sleep vs. active daytime hours).
* **Importance & Relevance:** Standard bulk packing forces users to either purchase multiple bulky packets to cover different needs, which is financially inefficient, or use sub-optimal sizes leading to discomfort, skin rashes, or leakage. The "Comfi" project addresses this gap by offering skin-friendly, hypoallergenic, ultra-thin, biodegradable sanitary pads customizable to individual needs.
* **Intent of the Project:** The primary goal is to build an intelligent, secure, full-stack web application that allows users to create personalized menstrual cycle packs. By conducting a diagnostic "Period Profile Finder Quiz" or using a manual "Build Your Own Pack" configurator, the system calculates the ideal product mix, grants bundle discounts, manages user subscriptions, integrates payment checkouts, and exposes a comprehensive dashboard for administrators to run catalog updates and CRM analytics.

---

### **3. Objective**
The project aims to achieve the following specific, point-wise objectives:
* To develop a user-friendly, responsive web application for personalized sanitary pad selection and purchase.
* To create a **Period Profile Finder Quiz** algorithm that dynamically recommends a customized box (e.g., a 20-pad cycle pack consisting of a calculated ratio of Regular 240mm, Large 280mm, XL 320mm, and Overnight 360mm pads) based on flow volume, leakage location, priority, and activity level.
* To build a **Build Your Own Pack** interactive compiler tool allowing users to customize their pad boxes with real-time price updates and bundle discounts (e.g., a 10% discount for orders reaching 20 pads).
* To design and implement a secure **Authentication System** using JSON Web Tokens (JWT) and bcryptjs hashing, supporting distinct roles for Customers and Administrators.
* To integrate an online checkout experience utilizing a mock checkout modal and a sandbox implementation of the **Razorpay Payment Gateway API**.
* To deploy an **Admin CRM and Dashboard Panel** that grants catalog management capabilities (Create, Read, Update, Delete - CRUD operations on products), order fulfillment tracking, and customer information retrieval.
* To engineer a hybrid database integration using **Supabase PostgreSQL** for cloud hosting with a fallback local **JSON File System Database** for local offline testing.

---

### **4. Stake Holders**
The system interacts with the following major stakeholders:
* **Client (Platform Owner/Retailer):** The business entity owning "Comfi", intending to sell customized sanitary pads, analyze sales metrics, manage customer databases, and maintain accurate inventory levels.
* **End Users (Customers):** Individuals purchasing menstrual hygiene solutions. 
  * *Designation/Role actions:* Register accounts, log in, modify profiles, browse the product catalog, read reviews, complete the recommendation quiz, compile custom packs, manage cart operations, proceed to checkout, initiate payments, and view order history.
* **Internal Users (Administrators):** Operation managers who log in through the secure admin portal.
  * *Designation/Role actions:* Oversee inventory, add/remove/edit product sizes and characteristics, monitor order statuses, update delivery details, and inspect customer purchasing histories for CRM profiling.
* **Technical User (Developers / System Administrators):** Development team maintaining the platform code, API endpoints, payment webhooks, database integrity, and managing hosting services (e.g., Vercel / Supabase).

---

### **5. Expected Modules and Sub-modules**
The application is structured into the following operational modules and sub-modules:

1. **Authentication and Account Management Module**
   * **Register / Signup:** Allows new customers to register by providing name, email, and password.
   * **Sign-in / Login:** Multi-role login handling validation and issue of secure JWT authorization tokens.
   * **Profile Management:** Enables customers to view details, update billing/shipping addresses, and access order tracking.
   * **Admin Access Controller:** Intercepts admin routes to block unauthorized client accounts.

2. **Smart Recommendation (Diagnostic Quiz) Module**
   * **Diagnostic Interface:** An interactive form collecting cycle properties (flow rate, leakage locations, cycle priority, activity levels).
   * **Scoring Engine:** A points-based algorithm determining primary pad needs (Regular, Large, XL, Overnight).
   * **Bundle Compiler:** Automates the creation of a personalized 20-pad pack recommendation based on the score patterns.
   * **Direct-to-Cart Exporter:** Translates recommendations into a checkout bundle item in a single tap.

3. **Custom Pack Builder Module ("Build Your Own Pack")**
   * **Interactive Slider / Counter Compiler:** Allows manual entry of individual quantities for each size.
   * **Dynamic Pricing Engine:** Calculates unit prices dynamically (Regular: 19.9, Large: 24.9, XL: 29.9, Overnight: 34.9) and applies a 10% discount when cumulative pack sizes equal/exceed 20.
   * **Cart Interface:** Bundles the customized structure as a singular multi-dimensional product.

4. **Product Catalog and Review Module**
   * **Catalog Browser:** Displays product variations (lengths, wing structures, features).
   * **Product Details View:** Displays deep features, eco-friendly certifications, and safety parameters.
   * **Customer Review System:** Displays user ratings and commentary per product.

5. **Cart, Checkout, and Payment Integration Module**
   * **Cart Manager:** LocalStorage synchronized utility supporting standard packages and custom mixes.
   * **Shipping Form:** Collects destination addresses and contact info.
   * **Razorpay Gateway Integrator:** Embeds the Razorpay checkout script and processes payments securely.
   * **Mock Payment Simulator:** A fall-through payment modal allowing end-to-end checkout validation in sandbox/offline environments.

6. **Admin Operations and CRM Dashboard**
   * **Product Manager (CRUD):** Admin portal to add new pad designs, edit pricing, update lengths, and manage stock quantities.
   * **Order Monitor:** Displays sales feeds, customer billing amounts, purchased products, and delivery status updates.
   * **CRM Dashboard:** Tracks active customers, overall sales volumes, and average order metrics.

---

### **6. Hardware and Software Requirements**

#### **Hardware Requirements:**
* **Minimum Processor:** Dual-Core Intel Core i3 / AMD Ryzen 3 (or equivalent), 2.0 GHz or higher.
* **Secondary Storage:** 5 GB free storage space (for source code, node_modules, and media assets).
* **Primary Storage (RAM):** 8 GB RAM (recommended for multi-threaded Next.js compilation) / 4 GB minimum.
* **System Architecture:** 64-bit operating system.

#### **Software Requirements:**
* **Operating System:** Windows 10/11, macOS, or Linux.
* **Programming Languages:** JavaScript (ES6+), HTML5, CSS3.
* **Runtime Environment:** Node.js (v18.0.0 or higher) / npm package manager.
* **Framework:** Next.js (v16 App Router) and React (v19).
* **Styling Framework:** Tailwind CSS (v4) with PostCSS.
* **Database & BaaS:** Supabase PostgreSQL Client / Native JSON file storage.
* **API Dependencies:** Razorpay Node SDK (for checkout interactions), Lucide React (icons), bcryptjs (hashing), jsonwebtoken (secure state tokens).
* **Web Browser:** Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge.
* **Network & Hosting Requirement:** Vercel (Frontend/Serverless hosting), HTTPS Protocol, SMTP services for emails.

---

### **7. Similar Software Study / Background Study**

* **Reference Target:** **Nua Woman (nuawoman.com)**
* **Type:** Web Application (Direct-to-Consumer Custom Menstrual Care Platform).
* **Hardware and Software Requirements:** Multi-platform cloud hosting (AWS/GCP), accessible via modern desktop and mobile browsers, database-backed CRM.
* **Modules:** Customizable Box Customizer, Auto-delivery Subscription Engine, E-Commerce Store, Period Tracker, and Blog Community.
* **Salient Features:**
  * Highly customizable sanitary pad count selection (Regular, Heavy, Super sizes) in a single cycle box.
  * Auto-renewing subscription plans with delivery intervals.
  * Direct delivery of toxin-free, rash-free, eco-conscious pads.
* **Limitations:**
  * Does not offer a rapid, non-account diagnostic quiz that maps directly to custom package pricing and automatically injects bundle discounts into the cart.
  * Subscription cancellation and custom plan management involve rigid navigation flows, increasing cart abandonment.
  * Lack of a simple, developer-friendly admin dashboard for immediate local inventory tracking and order status testing.
* **Remark:** Nua is the primary benchmark for personalized menstrual wellness. **Comfi** improves upon this baseline by integrating a direct diagnostic quiz recommendation engine, implementing an instant custom box compiler with immediate cart transitions, and delivering a clean, local-friendly hybrid database backend with an administrator CRM panel.
