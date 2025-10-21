# 🪙 Investment Portfolio Tracker – Next.js + Supabase

A comprehensive web app to **track and visualize ALL your investments in one place** — including Stocks, Mutual Funds, ETFs, EPF, PPF, Fixed Deposits, Bonds, Cryptocurrency, Gold, Real Estate, NPS, Savings Accounts, Recurring Deposits, and more — built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

---

## 🚀 Features

- ✅ **14 Investment Categories**: Track stocks, mutual funds, ETFs, EPF, PPF, FDs, bonds, crypto, gold, real estate, NPS, savings, RDs, and more
- ✅ **User Authentication**: Secure login via Supabase Auth  
- ✅ **Portfolio Summary Dashboard**: View total invested, current value, gains/losses, and returns %
- ✅ **Advanced Fields**: Track units, purchase price, current price, maturity dates, institution details, and notes
- ✅ **Real-time Sync**: All data synced with Supabase database  
- ✅ **Interactive Visualizations**: Pie chart showing portfolio distribution by category (Recharts)  
- ✅ **Smart Filtering**: Filter investments by category
- ✅ **Detailed Investment Table**: View all investments with gains/losses calculated automatically
- ✅ **Responsive UI**: Beautiful design that works on mobile, tablet, and desktop (TailwindCSS)
- ✅ **Indian Currency Support**: ₹ symbol with lakhs/crores formatting
- ✅ **Secure per-user data**: Row Level Security ensures users see only their own investments  
- ✅ **Easy deployment**: Deploy on **Vercel + Supabase** in minutes
- ✅ **Automated CI/CD**: Push to GitHub → Auto-deploy to Vercel 🚀

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

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment guide (Supabase + Vercel + GitHub)
- **[GITHUB_VERCEL_AUTOMATION.md](GITHUB_VERCEL_AUTOMATION.md)** - Automated CI/CD pipeline setup
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the application
- **[PORTFOLIO_FEATURES.md](PORTFOLIO_FEATURES.md)** - Feature documentation

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | Next.js (App Router, TypeScript) | UI + API routes |
| Backend | Supabase | Database + Auth + API |
| Database | PostgreSQL (via Supabase) | Store investment data |
| Charts | Recharts | Portfolio visualization |
| Styling | TailwindCSS | Modern responsive UI |
| Hosting | Vercel | Deploy frontend easily |

---

## 🧩 Project Structure

invest-tracker/
├── app/
│ ├── page.tsx # Landing page
│ ├── login/page.tsx # Supabase Auth UI
│ ├── dashboard/page.tsx # Investment dashboard
│ ├── globals.css # Tailwind styles
│ └── layout.tsx # Root layout
│
├── components/
│ └── PortfolioChart.tsx # Chart component using Recharts
│
├── lib/
│ └── supabaseClient.ts # Supabase connection
│
├── .env.local.example # Example environment variables
├── tailwind.config.js # Tailwind config
├── tsconfig.json # TypeScript config
├── next.config.js # Next.js config
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