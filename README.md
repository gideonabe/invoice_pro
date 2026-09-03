# InvoicePro ✽

**Premium Invoicing Platform for Modern Creators & Agencies**

A slick, top-tier SaaS invoicing application built with Next.js 16, featuring beautiful templates, real-time payment tracking, Paystack integration, and a premium dark-mode executive template.

**Live Site:** https://invoice-promax.vercel.app/

[![Project Screenshot](https://invoice-promax.vercel.app/thumbnail.png)](https://invoice-promax.vercel.app/)

---

## 🚀 Features

### Core Capabilities
- **Invoice Builder** — Real-time, WYSIWYG invoice editor with customizable templates
- **Template Vault** — Standard (free) and Executive dark-mode (premium) templates
- **Payment Tracking** — Monitor paid, part-paid, and unpaid invoices with auto-calculated balances
- **Paystack Integration** — Secure payment processing with webhook-based subscription upgrades
- **Dashboard Analytics** — Revenue tracking, outstanding balances, and document metrics (Premium)
- **WhatsApp Sharing** — Native sharing integration for instant client delivery
- **PDF Generation** — Browser-native print-to-PDF with optimized styling
- **Cloud Sync** — Supabase-powered authentication and real-time database storage

### Premium Features (₦5,000/month)
- Executive dark-mode template with indigo glow aesthetics
- Full dashboard analytics and financial telemetry
- Cloud client database and invoice history
- Unlimited template access

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.2.1 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase SSR (Magic Link OTP) |
| **Payments** | Paystack API |
| **Notifications** | Sonner (Toast) |

---

## 📁 Project Structure

```
invoice_pro/
├── app/
│   ├── api/
│   │   ├── checkout/           # Paystack payment initialization
│   │   └── webhook/paystack/   # Payment success webhooks
│   ├── auth/callback/          # Supabase OAuth handler
│   ├── builder/                # Invoice editor workspace
│   ├── dashboard/              # User analytics & invoice ledger
│   ├── login/                  # Magic link authentication
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout with metadata
│   └── not-found.tsx           # 404 error page
├── components/
│   └── PremiumDarkTemplate.tsx # Executive dark-mode invoice
├── lib/
│   └── supabase.ts             # Browser Supabase client
├── package.json
└── tsconfig.json
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Supabase project ([supabase.com](https://supabase.com))
- Paystack merchant account ([paystack.com](https://paystack.com))

### Installation

```bash
# Clone repository
cd invoice_pro

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 🔐 Environment Variables

Create a `.env.local` file with the following keys:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Application
SITE_URL=http://localhost:3000
```

> **Note:** For production, update `SITE_URL` to your deployed domain (e.g., `https://invoicepro.vercel.app`).

---

## 💾 Supabase Keep-Alive System

InvoicePro includes an automated keep-alive mechanism to prevent Supabase's free tier from pausing your database:

### How It Works

1. **`/api/keep-alive` route** — Lightweight API endpoint that pings the `profiles` table
2. **Vercel Cron Job** — Executes the endpoint every 4 minutes (configured in `vercel.json`)
3. **Prevents Idle Timeout** — Supabase pauses databases after ~7 days of inactivity; this ensures constant activity

### Files Added
- **`app/api/keep-alive/route.ts`** — Health check endpoint
- **`vercel.json`** — Cron job schedule configuration

### Deployment
The cron job is automatically configured when you deploy to Vercel. No additional setup required.

### Monitoring
Check Vercel Dashboard → **Crons** tab to view execution history and verify the keep-alive system is active.

### Cost
 **Completely free** — Vercel's free tier includes unlimited cron executions (within rate limits).

---

## 🗄 Database Schema

### `profiles` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches Supabase auth.users.id) |
| tier | TEXT | User subscription tier: `'free'` or `'pro'` |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last modification timestamp |

### `invoices` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK to profiles.id) |
| company_id | UUID | Associated business (FK to companies.id) |
| invoice_number | TEXT | Unique invoice identifier |
| customer_name | TEXT | Client name |
| customer_phone | TEXT | Client contact |
| issue_date | DATE | Invoice date |
| status | TEXT | `'Not paid'`, `'Part-paid'`, or `'Paid'` |
| subtotal | NUMERIC | Total invoice amount |
| amount_paid | NUMERIC | Payment received |
| payment_method | TEXT | BANK, CASH, CRYPTO, POS |
| template_used | TEXT | `'standard'` or `'premium-dark'` |

### `invoice_items` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | Parent invoice (FK to invoices.id) |
| description | TEXT | Item/service name |
| quantity | INTEGER | Item count |
| rate | NUMERIC | Price per unit |

### `companies` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK to profiles.id) |
| name | TEXT | Business name |
| email | TEXT | Contact email |
| phone | TEXT | Contact phone |
| address | TEXT | Business address |
| website | TEXT | Website URL |

---

## 💳 Payment Flow

1. **User clicks "Upgrade to Premium"** → Triggers `/api/checkout`
2. **API creates Paystack session** → Returns authorization URL
3. **User completes payment** → Paystack processes transaction
4. **Webhook fires** → `/api/webhook/paystack` receives `charge.success`
5. **Server upgrades user** → Updates `profiles.tier` to `'pro'` via admin client
6. **User redirected** → `/dashboard?payment=success` shows upgraded features

---

## 🎨 Design System

InvoicePro follows a minimalist, high-contrast aesthetic:

- **Background:** `#F4F4F2` (warm off-white)
- **Text:** `#0F0F0F` (near-black)
- **Borders:** `black/10` (subtle dividers)
- **Accent:** `#A855F7` (purple for premium features)
- **Typography:** Inter font, tight letter-spacing, tracking-widest for labels
- **Animations:** Custom easing `[0.16, 1, 0.3, 1]` for buttery-smooth transitions

---

## 📜 Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🔒 Security Notes

- **Service Role Key** is only used in server-side webhook handlers (never exposed to client)
- **Paystack signature verification** validates webhook authenticity using HMAC-SHA512
- **Supabase RLS** (Row Level Security) protects user data isolation
- **Magic Link Auth** eliminates password vulnerabilities

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy automatically on push

---

## 🔮 Future Enhancements

### Short-Term Roadmap
- **Multi-Currency Support** — USD, EUR, GBP with automatic exchange rate conversion
- **Recurring Invoices** — Automated billing cycles for subscription-based services
- **Email Integration** — Direct PDF delivery via Resend or SendGrid
- **Invoice Reminders** — Automated follow-ups for outstanding balances
- **Expense Tracking** — Log business expenses alongside invoice revenue
- **Client Portal** — Dedicated view for customers to access all their invoices
- **Bulk Actions** — Select and export/delete multiple invoices simultaneously

### Medium-Term Features
- **AI-Powered Suggestions** — Smart item descriptions and pricing recommendations
- **Financial Reports** — Monthly/quarterly revenue charts and tax summaries
- **Template Marketplace** — Community-contributed invoice designs with ratings
- **Custom Domains** — Branded invoice URLs (e.g., `invoices.youragency.com`)
- **Team Collaboration** — Multi-user workspaces with role-based permissions
- **Payment Reminders** — SMS notifications via Twilio for overdue invoices
- **CSV/Excel Export** — Bulk data downloads for accounting software import

### Long-Term Vision
- **Stripe Integration** — Alternative payment processor with global coverage
- **Multi-Language Support** — i18n for international creators and agencies
- **API Access** — RESTful endpoints for third-party integrations and automation
- **Mobile App** — React Native iOS/Android app for on-the-go invoicing
- **Accounting Sync** — Native integrations with QuickBooks, Xero, and Wave
- **Analytics Dashboard** — Advanced charts with client lifetime value metrics
- **White-Label Mode** — Complete rebranding for enterprise agency deployments

---

## 📄 License

© 2026 InvoicePro. All rights reserved.

---

**Built with precision. Designed for impact.** ✽
