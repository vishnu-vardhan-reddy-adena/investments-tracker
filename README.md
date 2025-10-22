# 🪙 Investment Portfolio Tracker – Next.js + Supabase

A **professional-grade portfolio management system** to track and analyze ALL your investments in one place — with **live market data**, **advanced analytics**, and **transaction management** — built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

---

## ✨ What's New in v2.0

### 🆕 Advanced Analytics
- **Sector-wise Analysis**: See portfolio distribution across IT, Banking, Pharma, Energy, FMCG, etc.
- **Industry-wise Analysis**: Granular breakdown by specific industries
- **Market Cap Analysis**: Large Cap, Mid Cap, Small Cap distribution with risk assessment

### 🆕 Live Market Integration
- Real-time NSE stock prices via Yahoo Finance API
- NIFTY 50 index tracking
- One-click price refresh for all stocks
- Auto-update portfolio valuations

### 🆕 Dedicated Transactions Page
- Buy/Sell transaction recording with fees
- Bonus shares and stock split management
- Dividend tracking
- Complete transaction history and audit trail

### 🆕 Auto-metadata Fetching
- Enter NSE symbol → Auto-fetch company name, sector, industry, market cap
- 50+ popular stocks in local database
- Smart symbol search with auto-suggestions

---

## 🚀 Features

### Core Portfolio Management
- ✅ **14 Investment Categories**: Stocks, Mutual Funds, ETFs, EPF, PPF, FDs, Bonds, Crypto, Gold, Real Estate, NPS, Savings, RDs, Other
- ✅ **ROI & XIRR Calculations**: Simple returns and time-weighted returns
- ✅ **What-If Analyzer**: Test portfolio scenarios (-20% to +20%)
- ✅ **Top/Bottom Performers**: See best and worst investments
- ✅ **Advanced Fields**: Units, prices, dates, notes, institution details

### Live Market Data
- ✅ **Real-time Prices**: Live NSE stock prices
- ✅ **NIFTY 50 Tracking**: Index value in header
- ✅ **Auto-update**: One-click refresh for all stocks
- ✅ **Smart Caching**: 1-minute cache to prevent rate limits

### Advanced Analytics
- ✅ **Sector Distribution**: Portfolio breakdown by sectors with donut charts
- ✅ **Industry Analysis**: Top 10 industries with bar charts  
- ✅ **Market Cap Analysis**: Large/Mid/Small cap allocation and risk profile
- ✅ **Concentration Risk**: Identify overexposure to sectors/industries

### Transaction Management
- ✅ **Buy/Sell Tracking**: Record all stock transactions with fees (brokerage, STT)
- ✅ **Corporate Actions**: Bonus shares and stock splits
- ✅ **Dividend Recording**: Track dividend income
- ✅ **Transaction History**: Complete audit trail with filtering
- ✅ **Auto-calculations**: Total amounts with all charges included

### Professional UI
- ✅ **Dark Theme**: Gradient backgrounds with glass-effect cards
- ✅ **Donut Charts**: Beautiful visualizations with Recharts
- ✅ **Responsive Design**: Mobile, tablet, desktop optimized
- ✅ **Color Coding**: Sector/market cap specific colors
- ✅ **Smooth Animations**: Professional transitions and effects

### Security & Deployment
- ✅ **User Authentication**: Secure login via Supabase Auth  
- ✅ **Row Level Security**: Users see only their own data
- ✅ **Vercel Hosting**: Production-ready deployment
- ✅ **GitHub Actions**: Automated CI/CD pipeline
- ✅ **Environment Variables**: Secure configuration management

---

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)
```powershell
# Run the setup script
.\setup.ps1
```

### Option 2: Manual Setup
```powershell
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Add your Supabase credentials to .env.local

# 4. Run database setup wizard (Automated)
npm run setup

# OR manually run SQL migrations:
# Go to Supabase Dashboard > SQL Editor
# Run sql/schema.sql
# Run sql/enhanced_schema.sql

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🤖 Automated Database Setup

We provide **automated scripts** to simplify database migrations:

### Interactive Setup Wizard (Recommended)
```bash
npm run setup
```
- ✅ Validates environment configuration
- ✅ Lists migration files with details
- ✅ Shows SQL content for easy copy-paste
- ✅ Provides verification checklist
- ✅ Step-by-step guidance

### Database Helper
```bash
npm run db:setup
```
- Quick reference and Supabase links

### Advanced Migration (if service role key available)
```bash
npm run db:migrate
```
- Attempts automated SQL execution

📖 **Full Guide:** [DATABASE_AUTOMATION.md](DATABASE_AUTOMATION.md)

---

## 📚 Documentation

### Getting Started
- **[DATABASE_AUTOMATION.md](DATABASE_AUTOMATION.md)** 🤖 - Automated setup scripts guide
- **[QUICK_START.md](QUICK_START.md)** ⭐ - 5-minute setup guide with sample data
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

### New Features (v2.0)
- **[ANALYTICS_GUIDE.md](ANALYTICS_GUIDE.md)** 🆕 - Complete analytics documentation (Sector/Industry/Market Cap)
- **[NSE_API_GUIDE.md](NSE_API_GUIDE.md)** 🆕 - Live price integration guide
- **[FEATURES_SUMMARY.md](FEATURES_SUMMARY.md)** 🆕 - All features at a glance

### Deployment & Usage
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment guide (Supabase + Vercel + GitHub)
- **[GITHUB_VERCEL_AUTOMATION.md](GITHUB_VERCEL_AUTOMATION.md)** - Automated CI/CD pipeline setup
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the application
- **[PORTFOLIO_FEATURES.md](PORTFOLIO_FEATURES.md)** - Feature specifications

---

## 🎯 Use Cases

### For Long-term Investors
```
✓ Track stocks, mutual funds, EPF, PPF all in one place
✓ Monitor sector exposure and rebalance accordingly
✓ Calculate XIRR for accurate time-weighted returns
✓ View portfolio distribution across market caps
✓ Identify concentration risks early
```

### For Active Traders
```
✓ Record every buy/sell transaction with fees
✓ Track realized and unrealized P&L
✓ Manage corporate actions (bonus, splits)
✓ Live price updates during market hours
✓ Complete audit trail of all trades
```

### For Financial Planners
```
✓ Analyze client portfolios by sector/industry
✓ Assess risk based on market cap distribution
✓ Generate what-if scenarios for planning
✓ Track multiple investment types
✓ Professional visualizations for presentations
```

---

## 📊 Screenshots & Features

### Dashboard - Portfolio Overview
- **Metrics**: Total Invested, Current Value, Gains, ROI%, XIRR%
- **Charts**: Donut chart for category distribution
- **Tables**: Top 5 and Bottom 5 performers
- **Analytics**: What-If scenario analyzer

### Advanced Analytics Section 🆕
- **Sector Analysis**: Portfolio distribution across IT, Banking, Pharma, etc.
- **Industry Breakdown**: Granular view of specific industries
- **Market Cap**: Large/Mid/Small cap allocation with risk assessment

### Transactions Page 🆕
- **Transaction Types**: Buy, Sell, Bonus, Split, Dividend
- **Auto-fetch**: Enter symbol → Get company name, price, sector
- **History**: Complete transaction audit trail
- **Smart Search**: Symbol auto-complete with suggestions

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | Next.js 14 (App Router, TypeScript) | UI + API routes |
| Backend | Supabase | Database + Auth + API |
| Database | PostgreSQL (via Supabase) | Store investment data |
| Charts | Recharts | Portfolio visualization |
| Styling | TailwindCSS + Custom Dark Theme | Modern responsive UI |
| Live Data | Yahoo Finance API | Real-time stock prices |
| Hosting | Vercel | Deploy frontend easily |
| CI/CD | GitHub Actions | Automated deployment |

---

## 🧩 Project Structure

```
investment-tracker/
├── app/
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Supabase Auth UI
│   ├── dashboard/page.tsx      # Main dashboard with analytics
│   ├── transactions/page.tsx   # Transaction management 🆕
│   ├── globals.css             # Dark theme styles
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── PortfolioChart.tsx      # Donut chart for categories
│   └── AnalysisChart.tsx       # Sector/Industry/MarketCap charts 🆕
│
├── lib/
│   ├── supabaseClient.ts       # Supabase connection
│   ├── nseApi.ts               # Live price fetching 🆕
│   └── stockMetadata.ts        # Auto-fetch stock data 🆕
│
├── sql/
│   ├── schema.sql              # Original database schema
│   └── enhanced_schema.sql     # Transactions + Metadata 🆕
│
├── docs/                        # 10+ comprehensive guides 🆕
├── .github/workflows/ci.yml    # GitHub Actions workflow
├── .env.local.example          # Example environment variables
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
└── vercel.json                 # Vercel configuration
```
├── package.json # Dependencies & scripts
└── README.md # This file

sql
Copy code

---

## � Investment Categories Supported

1. **Stocks** - Individual equity holdings
2. **Mutual Funds** - SIP and lump sum investments
3. **ETFs** - Exchange Traded Funds
4. **EPF** - Employee Provident Fund
5. **PPF** - Public Provident Fund
6. **Fixed Deposits** - Bank FDs
7. **Bonds** - Corporate and government bonds
8. **Cryptocurrency** - Bitcoin, Ethereum, etc.
9. **Gold** - Physical gold, gold bonds, gold ETFs
10. **Real Estate** - Property investments
11. **NPS** - National Pension System
12. **Savings Account** - Bank balances
13. **Recurring Deposit** - RD investments
14. **Other** - Any other investment type

---

## �🗄️ Database Schema (Supabase)

Run this SQL in the Supabase SQL editor (`sql/schema.sql`):

```sql
create extension if not exists "uuid-ossp";

create table if not exists investments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  symbol text,
  amount_invested numeric not null default 0,
  current_value numeric not null default 0,
  units numeric,
  purchase_price numeric,
  current_price numeric,
  date_purchased date,
  maturity_date date,
  notes text,
  institution text,
  updated_at timestamp default now(),
  created_at timestamp default now()
);

create index if not exists idx_investments_user_id on investments(user_id);
create index if not exists idx_investments_category on investments(category);
⚙️ Environment Variables
Create a .env.local file in the project root:

bash
Copy code
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
🪄 Get these from your [Supabase Project → Settings → API].

💻 Local Development
1️⃣ Install dependencies
bash
Copy code
npm install
2️⃣ Set up environment
bash
Copy code
cp .env.local.example .env.local
Add your Supabase keys inside .env.local.

3️⃣ Run locally
bash
Copy code
npm run dev
Now open 👉 http://localhost:3000

🌐 Deployment
Frontend → Vercel
Push code to GitHub

Import repo into Vercel

Add environment variables (same as .env.local)

Deploy 🎉

Backend → Supabase
Create a Supabase project

Run SQL (see above)

Copy your API keys into .env.local

📊 Dashboard Preview
Feature	Description
📈 Portfolio Chart	Pie chart visualization by category
💰 Investment Table	Summary of each asset
🔄 Realtime Updates	Auto-sync with Supabase
🧮 Analytics	Investment vs. Returns

🧠 Future Enhancements
 Add live stock/MF price fetch (NSE or Yahoo API)

 Calculate CAGR / XIRR automatically

 Export portfolio to Excel / PDF

 Add Dark Mode

 Integrate Google Sheets sync

 AI-powered insights (performance trends, allocation tips)

👨‍💻 Development Guidelines
Use TypeScript for all new components

Follow modular structure (components, lib, app)

Prefer async/await with proper error handling

Keep Supabase queries scoped by user_id

Make UI responsive and minimal

🧠 GitHub Copilot Context
If you use GitHub Copilot, include this context at the top of your repo (in copilot-context.md):

“Build a Next.js + Supabase investment tracker that supports CRUD operations for multiple investment categories, with authentication, portfolio charts, and a clean Tailwind UI.”

🪄 Author
Vishnu Reddy
🧑‍💻 Full-Stack Developer | AWS & AI/ML Learner