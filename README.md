<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

# 🌾 Agro-Tech Platform

> **A full-stack agricultural marketplace connecting farmers with equipment providers and labour services — powered by AI.**

---

## 📖 Overview

**Agro-Tech** is a production-grade agricultural technology platform that bridges the gap between **farmers** 👨‍🌾, **equipment/labour providers** 🚜, and **platform administrators** 🛡️. It features a real-time booking engine, integrated payment processing with Razorpay, an AI-powered chatbot assistant, and comprehensive admin analytics.

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "🖥️ Client — React 19 + Vite"
        A[🌐 Landing Page] --> B[🔐 Auth Module]
        B --> C{👤 Role Router}
        C -->|superadmin| D[🛡️ Admin Dashboard]
        C -->|provider| E[🚜 Provider Dashboard]
        C -->|labour| F[👷 Labour Dashboard]
        C -->|user| G[👨‍🌾 Farmer Dashboard]
        A --> H[📦 Equipment Listings]
        A --> I[🧑‍🤝‍🧑 Labour Listings]
    end

    subgraph "⚙️ Server — FastAPI + AsyncPG"
        J[🔑 Auth Router] --> K[(🐘 PostgreSQL)]
        L[📊 Admin Router] --> K
        M[🏪 Marketplace Router] --> K
        N[💳 Payments Router] --> O[💰 Razorpay API]
        P[🤖 Chatbot Router] --> Q[🧠 Gemini AI]
        R[📈 Analytics Router] --> K
        S[💸 Payouts Router] --> K
    end

    G -- "REST API (Axios)" --> J
    G -- "Book Equipment/Labour" --> M
    G -- "Make Payments" --> N
    D -- "Manage Platform" --> L
    D -- "View Analytics" --> R
    E -- "Manage Listings" --> M
    H -- "Browse & Book" --> M
    I -- "Browse & Book" --> M

    style A fill:#10b981,stroke:#059669,color:#fff
    style D fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style E fill:#f59e0b,stroke:#d97706,color:#fff
    style F fill:#3b82f6,stroke:#2563eb,color:#fff
    style G fill:#10b981,stroke:#059669,color:#fff
    style K fill:#4169E1,stroke:#3457c9,color:#fff
    style O fill:#0C2451,stroke:#091b3d,color:#fff
    style Q fill:#4285f4,stroke:#3367d6,color:#fff
```

---

## 🧩 System Flow

```mermaid
sequenceDiagram
    participant 👨‍🌾 Farmer
    participant 🖥️ Client
    participant ⚙️ API
    participant 🐘 Database
    participant 💰 Razorpay
    participant 🧠 Gemini

    👨‍🌾 Farmer->>🖥️ Client: Browse Equipment / Labour
    🖥️ Client->>⚙️ API: GET /api/v1/marketplace
    ⚙️ API->>🐘 Database: Query available listings
    🐘 Database-->>⚙️ API: Return results
    ⚙️ API-->>🖥️ Client: JSON Response
    🖥️ Client-->>👨‍🌾 Farmer: Display listings

    👨‍🌾 Farmer->>🖥️ Client: Create Booking
    🖥️ Client->>⚙️ API: POST /api/v1/payments/create-order
    ⚙️ API->>💰 Razorpay: Create Order (advance)
    💰 Razorpay-->>⚙️ API: Order ID
    ⚙️ API-->>🖥️ Client: Payment details
    🖥️ Client->>💰 Razorpay: Process payment
    💰 Razorpay-->>🖥️ Client: Payment success
    🖥️ Client->>⚙️ API: POST /api/v1/payments/verify
    ⚙️ API->>🐘 Database: Record transaction + update booking
    ⚙️ API-->>🖥️ Client: Booking confirmed ✅

    👨‍🌾 Farmer->>🖥️ Client: Ask AI Assistant
    🖥️ Client->>⚙️ API: POST /api/v1/chatbot
    ⚙️ API->>🧠 Gemini: Generate response
    🧠 Gemini-->>⚙️ API: AI response
    ⚙️ API-->>🖥️ Client: Streamed answer
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o| PROFILE : has
    USER ||--o{ EQUIPMENT : owns
    USER ||--o{ LABOUR_SERVICE : provides
    USER ||--o{ BOOKING : makes
    USER ||--o| WALLET : has
    USER ||--o{ BANK_DETAIL : has
    USER ||--o{ WITHDRAWAL_REQUEST : creates

    EQUIPMENT ||--o{ BOOKING : "booked via"
    LABOUR_SERVICE ||--o{ BOOKING : "booked via"
    BOOKING ||--o{ TRANSACTION : generates

    USER {
        int id PK
        string email UK
        string hashed_password
        enum role "superadmin | provider | labour | user"
        bool is_active
        enum kyc_status
    }

    EQUIPMENT {
        int id PK
        int owner_id FK
        string name
        string type
        float hourly_rate
        float daily_rate
        bool is_available
    }

    LABOUR_SERVICE {
        int id PK
        int provider_id FK
        string skills
        float hourly_rate
        bool is_available
        bool is_public
    }

    BOOKING {
        int id PK
        int user_id FK
        int equipment_id FK
        int labour_id FK
        enum status "pending | confirmed | completed | cancelled"
        float total_price
        float advance_amount
        enum payment_status
    }

    TRANSACTION {
        int id PK
        int booking_id FK
        enum payment_stage "advance | final"
        float total_amount
        float admin_commission
        float provider_amount
        bool is_released
    }

    WALLET {
        int id PK
        int user_id FK
        float balance
        float total_earned
    }
```

---

## 👥 User Roles & Permissions

| Role | Access | Key Capabilities |
|------|--------|-------------------|
| 🛡️ **Super Admin** | `/dashboard/admin/*` | Manage users, equipment, labour, bookings, payments, view analytics |
| 🚜 **Provider** | `/dashboard/provider/*` | List equipment, manage bookings, view payments & wallet |
| 👷 **Labour** | `/dashboard/labour/*` | List skills/services, manage bookings, view earnings |
| 👨‍🌾 **User (Farmer)** | `/dashboard/user/*` | Browse marketplace, book equipment/labour, make payments |

---

## 🚀 Features

### 🌐 Public
- 🏠 Premium animated landing page
- 📦 Equipment marketplace with filters
- 🧑‍🤝‍🧑 Labour services marketplace
- 🤖 AI-powered agricultural chatbot (Gemini)

### 🔐 Authentication & Security
- 📧 Email/password registration with role selection
- 🔑 JWT-based stateless authentication (7-day tokens)
- 🛡️ Role-based route protection
- 🔄 Automatic session restoration

### 📊 Admin Panel
- 📈 Platform-wide analytics & revenue dashboards
- 👥 User / Farmer / Provider management
- 📦 Equipment & Labour oversight
- 📋 Booking lifecycle management
- 💰 Commission tracking & payout management

### 💳 Payments & Finance
- 💰 Razorpay integration (advance + final payments)
- 🏦 Provider wallet system with balance tracking
- 🏧 Bank detail management & withdrawal requests
- 📊 Commission splits (admin / provider)
- 🧾 Complete transaction audit trail

### 🔔 Notifications
- 📡 Service Worker-based background notifications
- 🔔 Real-time booking & payment alerts

---

## 📁 Project Structure

```
agri-tech/
├── 📂 client/                          # 🖥️  Frontend (React 19 + Vite + TypeScript)
│   ├── 📂 src/
│   │   ├── 📂 api/                     #     Axios client & interceptors
│   │   ├── 📂 components/              #     Shared UI components
│   │   │   ├── Chatbot.tsx             #     🤖 AI Assistant widget
│   │   │   ├── DashboardLayout.tsx     #     📐 Dashboard shell
│   │   │   ├── ProtectedRoute.tsx      #     🛡️  Route guard
│   │   │   └── Sidebar.tsx             #     📋 Navigation sidebar
│   │   ├── 📂 features/
│   │   │   ├── 📂 auth/               #     🔐 Login & Registration
│   │   │   ├── 📂 dashboard/          #     📊 Role-specific dashboards
│   │   │   │   ├── 📂 admin/          #     🛡️  Admin sub-pages
│   │   │   │   ├── ProviderDashboard   #     🚜 Provider hub
│   │   │   │   ├── LabourDashboard     #     👷 Labour hub
│   │   │   │   └── UserDashboard       #     👨‍🌾 Farmer hub
│   │   │   ├── 📂 listings/           #     📦 Marketplace pages
│   │   │   └── 📂 public/             #     🌐 Landing page
│   │   ├── 📂 hooks/                   #     🪝 Custom hooks
│   │   ├── 📂 store/                   #     🗃️  Redux Toolkit state
│   │   └── 📂 layouts/                 #     📐 Page layouts
│   ├── .env                            #     🔧 Environment variables
│   ├── tailwind.config.js              #     🎨 Tailwind configuration
│   └── vite.config.ts                  #     ⚡ Vite configuration
│
├── 📂 server/                          # ⚙️  Backend (FastAPI + Async SQLAlchemy)
│   ├── 📂 api/routers/
│   │   ├── admin.py                    #     🛡️  Admin CRUD endpoints
│   │   ├── analytics.py                #     📈 Revenue & platform stats
│   │   ├── auth.py                     #     🔐 JWT auth endpoints
│   │   ├── chatbot.py                  #     🤖 Gemini AI integration
│   │   ├── commissions.py              #     💸 Commission management
│   │   ├── marketplace.py              #     🏪 Public listings
│   │   ├── payments.py                 #     💳 Razorpay integration
│   │   ├── payouts.py                  #     🏧 Withdrawal processing
│   │   ├── provider.py                 #     🚜 Provider management
│   │   ├── public.py                   #     🌐 Public endpoints
│   │   └── user.py                     #     👤 User operations
│   ├── 📂 core/
│   │   ├── config.py                   #     ⚙️  Settings (Pydantic)
│   │   ├── database.py                 #     🐘 Async DB engine
│   │   └── security.py                 #     🔑 Password hashing & JWT
│   ├── 📂 models/
│   │   └── entity.py                   #     🗄️  SQLAlchemy ORM models
│   ├── 📂 schemas/                     #     📝 Pydantic request/response models
│   ├── 📂 services/                    #     🔧 Business logic layer
│   ├── 📂 alembic/                     #     🔄 Database migrations
│   ├── main.py                         #     🚀 Application entry point
│   ├── requirements.txt                #     📦 Python dependencies
│   └── .env                            #     🔧 Environment variables
│
└── .gitignore                          # 🚫 Git ignore rules
```

---

## ⚡ Quick Start

### 📋 Prerequisites

| Tool | Version |
|------|---------|
| 🐍 Python | 3.10+ |
| 📦 Node.js | 18+ |
| 🐘 PostgreSQL | 14+ (or Neon serverless) |

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/agri-tech.git
cd agri-tech
```

### 2️⃣ Setup the Server

```bash
cd server
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

Create `server/.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/agritech
SECRET_KEY=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

Run the server:

```bash
uvicorn main:app --reload --port 8000
```

### 3️⃣ Setup the Client

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Run the client:

```bash
npm run dev
```

### 4️⃣ Open the app

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [http://localhost:3000](http://localhost:3000) |
| ⚙️ API | [http://localhost:8000](http://localhost:8000) |
| 📄 API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ Frontend | React 19, TypeScript, Vite | UI & build tooling |
| 🎨 Styling | Tailwind CSS, Framer Motion | Design system & animations |
| 🗃️ State | Redux Toolkit, React Query | Client state & server cache |
| ⚙️ Backend | FastAPI, Uvicorn | Async REST API |
| 🐘 Database | PostgreSQL, AsyncPG | Persistent storage |
| 🔄 ORM | SQLAlchemy 2.0 (async) | Database operations |
| 🔄 Migrations | Alembic | Schema versioning |
| 🔐 Auth | python-jose (JWT), Passlib | Authentication & hashing |
| 💳 Payments | Razorpay | Payment processing |
| 🤖 AI | Google Gemini | Agricultural chatbot |
| ☁️ Media | Cloudinary | Image uploads & CDN |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

| Module | Endpoint Prefix | Description |
|--------|----------------|-------------|
| 🔐 Auth | `/auth` | Register, login, session restore |
| 🛡️ Admin | `/admin` | User/equipment/labour/booking CRUD |
| 🚜 Provider | `/provider` | Equipment & labour management |
| 👤 User | `/user` | Bookings & profile |
| 🏪 Marketplace | `/marketplace` | Public listings |
| 💳 Payments | `/payments` | Razorpay order creation & verification |
| 💸 Commissions | `/commissions` | Commission tracking |
| 🏧 Payouts | `/payouts` | Withdrawal requests |
| 📈 Analytics | `/analytics` | Platform statistics |
| 🤖 Chatbot | `/chatbot` | AI assistant |
| 🌐 Public | `/public` | Public-facing data |

> 📄 Full interactive docs available at `/docs` (Swagger UI) when the server is running.

---

## 📜 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  Built with ❤️ for Indian Agriculture 🇮🇳
</p>
