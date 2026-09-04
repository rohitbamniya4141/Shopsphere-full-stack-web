# 🛍️ ShopSphere — AI-Powered Multi-Vendor E-Commerce Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

**A full-stack multi-vendor e-commerce platform built with Node.js, Express.js, and MongoDB.**

</div>

---

## 📌 Project Overview

ShopSphere is a complete multi-vendor e-commerce platform for bag products, where **Customers** shop, **Sellers** manage their own store, and a single **Owner** governs the platform. Every engineering decision in this project is backed by a concrete security or business requirement — not convention.

The idea behind ShopSphere came from a simple observation: students and professionals often struggle to find the right bag according to their requirements, budget, and usage.

ShopSphere is a multi-vendor e-commerce platform that allows customers to discover products, sellers to manage their stores, and administrators to control the marketplace.

Currently, the platform focuses on the Bags category including backpacks, laptop bags, travel bags, and lifestyle bags, while the architecture is designed for future expansion into multiple categories.

> This is not a tutorial clone. Every module was designed, debugged, and verified against the actual source code.

---

## ✨ Features

### 👤 Customer

- Register, login, and browse products
- Search by keyword (regex), filter by category and price range, sort by price or date
- Shopping cart with **server-side bill calculation** (never trusts client-side totals)
- Wishlist with duplicate prevention
- Razorpay payment with **HMAC-SHA256 server-side verification** before order creation
- Order tracking with full status history
- Purchase-gated product reviews and star ratings
- AI-powered product recommendations in **English and Hinglish**
- Downloadable **PDF invoice with embedded QR code**

### 🏪 Seller

- Register and await Owner approval before accessing the dashboard
- Full product CRUD with ownership verification on every operation
- Seller dashboard with **7 real-time metrics**, including per-seller revenue isolation powered by MongoDB Aggregation Pipelines (`$unwind`, `$match`, `$group`)
- Revenue isolated per seller from shared multi-seller orders

### 👑 Owner

- Approve or block seller accounts (takes effect immediately on next request, even mid-session)
- Platform-wide analytics: total products, orders, customers, revenue
- Full product management across all sellers
- Owner account creation locked to development environment with a one-time guard

---

## 🏗️ Architecture

ShopSphere follows **MVC (Model-View-Controller)** architecture:

View Layer:
EJS templates + Tailwind CSS

Controller Layer:
Handles business logic

Model Layer:
Mongoose schemas interacting with MongoDB

```
Browser
  │
  ▼
app.js ── Global Middleware (session, flash, cookies, body-parser, static)
  │
  ▼
Router Layer (7 Routers)
  ├── /          → index.js         [isLoggedIn]       → Customer pages
  ├── /users     → userRouter.js    [public]           → Auth routes
  ├── /sellers   → sellerRouter.js  [isSellerLoggedIn] → Seller dashboard
  ├── /owners    → ownerRouter.js   [isOwnerLoggedIn]  → Owner panel
  ├── /products  → productsRouter.js[isOwnerLoggedIn]  → Product management
  ├── /payment   → paymentRouter.js [isLoggedIn]       → Payment flow
  └── /ai        → aiRouter.js      [isLoggedIn]       → AI chat
  │
  ▼
Controller Layer (Business Logic)
  ├── authController.js
  ├── paymentController.js
  └── aiController.js
  │
  ├──▶ MongoDB (6 Collections: users, sellers, owners, products, orders, reviews)
  ├──▶ Razorpay API
  └──▶ Google Gemini API
  │
  ▼
EJS Template Engine → Complete HTML → Browser
```

---

## 🔐 Security Decisions (What Makes This Different)

| Problem                                     | My Solution                                                               | Where in Code                                                |
| ------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Role leakage across user types              | 3 separate collections, cookies, and middleware — zero overlap            | `isLoggedIn.js`, `isSellerLoggedIn.js`, `isOwnerLoggedIn.js` |
| Browser payment results can be faked        | HMAC-SHA256 verification on server before order creation                  | `paymentController.js` — `crypto.createHmac`                 |
| Invoice prices change after seller edits    | `purchasedItems[]` snapshot captures price at checkout, never overwritten | `order-model.js`                                             |
| AI recommends products not in stock         | MongoDB queried before Gemini API call — AI only sees real inventory      | `aiController.js` — `extractIntent()`                        |
| Blocked seller stays logged in              | Middleware re-checks `isBlocked` + `isApproved` on every request          | `isSellerLoggedIn.js` line 20                                |
| Stock over-sells during concurrent checkout | Stock validated at add-to-cart AND at checkout separately                 | `index.js` lines 115, 188–193                                |
| Duplicate reviews                           | Compound unique index `{product, user}` enforced at database level        | `review-model.js`                                            |

---

## 🗄️ Database Design

**6 MongoDB Collections** connected via Mongoose ObjectId references:

```
users          sellers         owners
  │               │               │
  │               │               │
  └──────────────▼───────────────┘
               products
                  │
         ┌────────┴────────┐
         ▼                 ▼
       orders           reviews
  (purchasedItems[])
  (statusHistory[])
```

| Collection   | Key Design Decision                                                           |
| ------------ | ----------------------------------------------------------------------------- |
| **users**    | `cart[]`, `wishlist[]`, `orders[]` — ObjectId arrays, populated on demand     |
| **sellers**  | `isApproved` + `isBlocked` — double-gated on login AND every middleware call  |
| **owners**   | Single owner enforced in code — creation blocked if any owner exists in DB    |
| **products** | Image paths stored in MongoDB while product assets are managed through application storage |
| **orders**   | `purchasedItems[]` snapshot — price frozen at checkout time forever           |
| **reviews**  | Unique compound index `{product, user}` — one review per customer per product |

---

## 💳 Razorpay Payment Flow

```
Customer clicks Pay
       │
       ▼
Server creates Razorpay order (amount × 100 paise)
       │
       ▼
Browser opens Razorpay popup
       │
       ▼
Customer completes payment
       │
       ▼
Browser sends { order_id, payment_id, signature }
       │
       ▼
Server: HMAC-SHA256 verification
       │
   ┌───┴───┐
   ▼       ▼
PASS      FAIL
   │       │
   ▼       ▼
Create   HTTP 400
Order    No order created
```

---

## 🤖 AI Recommendation Engine

The AI system uses a **database-first approach** to prevent hallucinations:

1. User sends query in English or Hinglish
2. `extractIntent()` parses category + price budget using regex
3. MongoDB queries matching **in-stock** products only
4. Real product data injected into Gemini prompt context
5. Gemini (`gemini-2.5-flash`) responds — only recommending real items
6. Auto-detects language via `SYSTEM_PROMPT` — replies in English or Hinglish

---

## 📦 Tech Stack

| Technology            | Version | Role                            |
| --------------------- | ------- | ------------------------------- |
| Node.js               | —       | Backend runtime                 |
| Express.js            | ^4.21.0 | Web framework, routing          |
| MongoDB               | —       | NoSQL database                  |
| Mongoose              | ^9.7.0  | Schema definitions, queries     |
| EJS                   | ^3.1.10 | Server-side HTML rendering      |
| jsonwebtoken          | ^9.0.3  | JWT generation and verification |
| bcrypt                | ^6.0.0  | Password hashing                |
| cookie-parser         | ^1.4.7  | JWT cookie management           |
| express-session       | ^1.19.0 | Session handling                |
| connect-flash         | ^0.1.1  | Flash messages                  |
| Multer                | ^2.2.0  | File upload (memory storage)    |
| Razorpay              | ^2.9.6  | Payment gateway                 |
| @google/generative-ai | ^0.24.1 | Gemini AI SDK                   |
| PDFKit                | ^0.19.1 | PDF invoice generation          |
| qrcode                | ^1.5.4  | QR code for invoices            |
| dotenv                | ^17.4.2 | Environment variable management |

---

## 📁 Folder Structure

```
ShopSphere/
├── app.js                     # Entry point — mounts all 7 routers
├── .env                       # Secrets (excluded from Git)
├── config/
│   ├── mongoose-connection.js # MongoDB connection
│   ├── razorpay.config.js     # Razorpay SDK instance
│   └── multer-config.js       # Multer memory storage
├── models/
│   ├── user-model.js
│   ├── seller-model.js
│   ├── owner-model.js
│   ├── product-model.js
│   ├── order-model.js
│   └── review-model.js
├── routes/
│   ├── index.js               # Customer routes
│   ├── userRouter.js
│   ├── sellerRouter.js
│   ├── ownerRouter.js
│   ├── productsRouter.js
│   ├── paymentRouter.js
│   └── aiRouter.js
├── controllers/
│   ├── authController.js
│   ├── paymentController.js
│   └── aiController.js
├── middlewares/
│   ├── isLoggedIn.js
│   ├── isSellerLoggedIn.js
│   └── isOwnerLoggedIn.js
├── utils/
│   ├── generateToken.js
│   └── generateInvoice.js     # PDFKit + QR code (237 lines)
├── views/                     # EJS templates
│   ├── shop.ejs
│   ├── cart.ejs
│   ├── orders.ejs
│   ├── wishlist.ejs
│   ├── product-details.ejs
│   ├── seller-dashboard.ejs
│   ├── seller-store.ejs
│   ├── createproducts.ejs
│   └── partials/
└── public/                    # Static CSS and assets
```

---

## 🚀# 🛍️ ShopSphere — AI-Native Multi-Vendor E-Commerce Platform

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

**A high-performance, full-stack multi-vendor e-commerce platform built with React, Node.js, and MongoDB.**

</div>

---

## 🚀 Project Overview

ShopSphere is an AI-powered multi-vendor e-commerce platform originally built with a Server-Side Rendered (EJS) architecture, recently **modernized into a scalable React Single Page Application (SPA)**. Every engineering decision in this project is backed by a concrete security or performance requirement.

The platform focuses on the Bags category (backpacks, laptop bags, travel bags) and supports three distinct personas: **Customers**, **Sellers**, and an **Owner/Admin**, with strict Role-Based Access Control (RBAC) enforcing data isolation.

> **Note on Quality Engineering:** This project utilizes verifiable benchmarks, cryptographic payment verification, strict multi-tenant authorization, and an embedded LLM API. 

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Decoupled React SPA:** Responsive, premium UI built with a custom Tailwind v4 component system (`Card`, `Button`, `Input`).
- **Domain-Aware AI Assistant:** Integrated Google Gemini LLM API acting as an in-store assistant, strictly grounded in live-inventory data to prevent hallucinations.
- **Secure Payments:** Razorpay integration with **server-side HMAC-SHA256 signature verification** before inventory deduction.
- **Shopping Cart & Wishlist:** Server-side bill calculation to prevent client-side price tampering.
- **Order Tracking & Invoices:** Downloadable PDF invoices with embedded QR codes, utilizing a historical snapshot pattern to preserve price accuracy against future catalog updates.

### 💼 Seller Panel
- **Isolated Multi-Tenant Data:** Full product CRUD operations with strict ownership verification middleware.
- **High-Performance Analytics:** Real-time seller dashboards tracking revenue and orders. 
  - *Engineering Highlight:* Refactored MongoDB aggregation pipelines (`$unwind`, `$match`, `$group`) and implemented compound indexes, **cutting analytics query latency by 51% (304ms → 148ms)** across a 1,000+ order benchmark dataset.

### 👑 Owner/Admin Panel
- **Governance:** Approve or block seller accounts instantly.
- **Platform Analytics:** Total products, orders, customers, and revenue across the entire platform.

---

## 🏛️ Architecture

ShopSphere recently migrated from an MVC monolith to a **Decoupled Client-Server Architecture**:

- **Frontend (`/client`):** React SPA utilizing React Router DOM and Tailwind v4. Served statically by Express in production to reduce server load and payload size.
- **Backend (`/`):** Node.js/Express REST API serving JSON.
- **Database:** MongoDB Atlas with Mongoose ODM.

### Security Implementation
- **Zero-Trust Auth:** Tokens (JWT) are stored exclusively in **HTTP-only, Same-Site cookies**, mathematically eliminating XSS token theft vectors. No `localStorage` is used for authentication.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or MongoDB Atlas)
- Razorpay account (test mode keys)
- Google AI Studio API key (Gemini)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rohitbamniya4141/Shopsphere-full-stack-web.git
cd Shopsphere-full-stack-web

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
npm install --prefix client
```

### Environment Variables
Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/shopsphere

# JWT Secrets (Use strong random strings)
JWT_SECRET=your_customer_secret
SELLER_JWT_SECRET=your_seller_secret
OWNER_JWT_SECRET=your_owner_secret

# Session Secret
EXPRESS_SESSION_SECRET=your_session_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Environment
NODE_ENV=development
```

### Running the Application (Development)
You can run both the React dev server and the Node backend concurrently:

```bash
# Terminal 1: Run Backend
npm run dev

# Terminal 2: Run Frontend
npm run client:dev
```
The React frontend runs at `http://localhost:5173` and the API at `http://localhost:3000`.

---

## 📊 Benchmarking & Performance

ShopSphere includes a built-in benchmarking suite to test the MongoDB indexes.

```bash
# 1. Seed the database with 1,000 synthetic orders
npm run seed:benchmark

# 2. Run the analytics performance test
npm run benchmark

# 3. Clear synthetic data when finished
npm run clear:benchmark
```

---

## 🚀 Deployment

ShopSphere is configured for zero-config deployments on platforms like **Railway** or **Render**. The backend is configured to automatically serve the compiled React SPA.

1. Set your environment variables in the deployment dashboard (ensure `NODE_ENV=production`).
2. The platform will automatically run the root `build` script (`npm run build`), which installs client dependencies and compiles the React app to `client/dist`.
3. Express will serve the static files dynamically!

---

## 📝 What I Learned Building This

- **Monolith to SPA Migration** – Decoupling EJS views into a scalable React frontend, building reusable UI components (Software IP), and slashing network payloads.
- **High-Performance MongoDB** – Utilizing `explain("executionStats")` to optimize slow `$group` aggregation pipelines from full collection scans (`COLLSCAN`) to O(log N) index scans (`IXSCAN`).
- **Cryptographic Security** – Server-side HMAC-SHA256 signature verification preventing payment spoofing.
- **Domain-Aware AI Prompting** – Preventing LLM hallucinations by injecting live MongoDB inventory data directly into the system prompt context.

---

## 📄 License & Author

**Rohit Bamniya**
- GitHub: [rohitbamniya4141](https://github.com/rohitbamniya4141)
- LinkedIn: [Rohit Bamniya](https://www.linkedin.com/in/rohit-bamniya-mcanitt)

This project is open source and available under the [MIT License](LICENSE).
