# 🤖 Automated Database Setup Guide

## Overview

We've created **automated scripts** to simplify the database migration process! Instead of manually copying SQL into Supabase Dashboard, you can now use simple commands.

---

## 🚀 Quick Setup Commands

### Option 1: Setup Wizard (Recommended for First Time)

```bash
npm run setup
```

**What it does:**
- ✅ Checks if `.env.local` exists
- ✅ Verifies Supabase credentials
- ✅ Lists all migration files
- ✅ Provides step-by-step instructions
- ✅ Shows SQL content for easy copy-paste
- ✅ Includes verification checklist

**Best for:** First-time setup, understanding what's being created

---

### Option 2: Database Setup Helper

```bash
npm run db:setup
```

**What it does:**
- ✅ Loads environment variables
- ✅ Validates Supabase URL and API keys
- ✅ Lists migration files with details
- ✅ Provides direct links to Supabase SQL Editor
- ✅ Shows file paths for manual execution

**Best for:** Quick reference, getting Supabase Dashboard links

---

### Option 3: Automated Migration (Advanced)

```bash
npm run db:migrate
```

**What it does:**
- ✅ Reads SQL migration files
- ✅ Attempts to execute via Supabase API
- ✅ Shows progress and results
- ✅ Reports success/error counts

**Note:** This requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for full access.

**Best for:** Advanced users, automated deployments

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variable loader
- All other project dependencies

### Step 2: Configure Environment

Create `.env.local` if it doesn't exist:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Optional
```

**Where to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the values

### Step 3: Run Setup Wizard

```bash
npm run setup
```

Follow the interactive prompts:
1. Confirms environment is configured
2. Lists migration files
3. Asks if you want to see SQL content
4. Provides verification checklist

### Step 4: Execute Migrations

**Manual Method (Recommended):**

1. Open Supabase Dashboard: [https://app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor**
3. Create new query
4. Copy content from `sql/schema.sql`
5. Click **RUN**
6. Repeat with `sql/enhanced_schema.sql`

**Automated Method (if service role key available):**

```bash
npm run db:migrate
```

### Step 5: Verify Setup

Check that these tables exist in Supabase:
- ✅ `investments`
- ✅ `transactions`
- ✅ `stock_metadata`

Check that these views exist:
- ✅ `v_portfolio_by_sector`
- ✅ `v_portfolio_by_industry`
- ✅ `v_portfolio_by_market_cap`

### Step 6: Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run setup` | Interactive setup wizard | First-time setup |
| `npm run db:setup` | Database setup helper | Get info & links |
| `npm run db:migrate` | Automated migration | Advanced/CI-CD |
| `npm run dev` | Start dev server | Development |
| `npm run build` | Build for production | Deployment |

---

## 📁 Migration Files

### 1. `sql/schema.sql`

**Creates:**
- `investments` table with all fields
- Row Level Security (RLS) policies
- Indexes for performance

**Size:** ~5 KB, 150 lines

### 2. `sql/enhanced_schema.sql`

**Creates:**
- `transactions` table (buy/sell/bonus/split/dividend)
- `stock_metadata` table (sector/industry/market cap)
- New columns in `investments` (sector, industry, market_cap_category)
- Analytics views (sector, industry, market cap)
- Helper functions
- Seed data (25+ popular NSE stocks)

**Size:** ~20 KB, 300+ lines

---

## 🔧 Troubleshooting

### Issue: `.env.local not found`

**Solution:**
```bash
cp .env.example .env.local
# Then edit .env.local with your credentials
```

### Issue: `@supabase/supabase-js not found`

**Solution:**
```bash
npm install
```

### Issue: `Permission denied` when running migrations

**Solution:**
1. Ensure you have `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Or use manual method via Supabase Dashboard

### Issue: `Already exists` errors

**Solution:**
These are normal when re-running migrations. The script uses `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT` clauses, so existing data is preserved.

### Issue: Script doesn't execute SQL

**Why:**
Direct SQL execution via REST API has limitations. The scripts provide:
- ✅ File paths for manual execution
- ✅ Direct links to Supabase SQL Editor
- ✅ SQL content display for copy-paste

**Workaround:**
Use the interactive wizard (`npm run setup`) which shows the SQL content for easy copy-paste.

---

## 🎯 Recommended Workflow

### For First-Time Setup:

1. **Run:** `npm install`
2. **Run:** `npm run setup`
3. **Follow:** Interactive prompts
4. **Execute:** SQL in Supabase Dashboard
5. **Run:** `npm run dev`

### For CI/CD Pipeline:

1. **Add:** Environment variables to CI/CD platform
2. **Run:** `npm install`
3. **Run:** `npm run db:migrate` (if service key available)
4. **Run:** `npm run build`
5. **Deploy:** to Vercel

### For Team Onboarding:

1. **Clone:** Repository
2. **Run:** `npm install`
3. **Run:** `npm run setup`
4. **Share:** `.env.local` template (without actual keys)
5. **Execute:** Migrations manually
6. **Run:** `npm run dev`

---

## 🔐 Security Notes

### `.env.local` Security:
- ✅ Included in `.gitignore` (never committed)
- ✅ Contains sensitive API keys
- ✅ Required for local development

### Service Role Key:
- ⚠️ Has admin privileges
- ⚠️ Should only be used server-side
- ⚠️ Not required for manual setup
- ✅ Optional for automated migrations

### Best Practices:
1. Never commit `.env.local` to git
2. Use environment variables in production
3. Rotate keys if accidentally exposed
4. Use anon key for client-side code
5. Use service key only for admin operations

---

## 📊 Migration Progress Tracking

### When running `npm run db:migrate`, you'll see:

```
🚀 Portfolio Tracker - Database Migration Script
============================================================
✅ Environment loaded
📍 Supabase URL: https://xxxxx.supabase.co

📋 Running migrations...

📄 Executing Base Schema...
  ✅ Progress: 10/50 statements
  ✅ Progress: 20/50 statements
  ...
  ✅ Base Schema completed:
     Success: 48 statements
     Errors: 2 statements

📄 Executing Enhanced Schema...
  ✅ Progress: 10/100 statements
  ...

============================================================
📊 Migration Summary:
   Total Success: 145
   Total Errors: 5

✅ All migrations completed successfully!
   Run: npm run dev
```

---

## 🆘 Getting Help

### If migrations fail:

1. **Check logs** for specific error messages
2. **Verify** Supabase credentials are correct
3. **Try manual method** via Supabase Dashboard
4. **Check** database permissions
5. **Review** migration file syntax

### Resources:

- **Setup Wizard:** `npm run setup` - Interactive help
- **Documentation:** `QUICK_START.md` - Quick guide
- **Analytics Guide:** `ANALYTICS_GUIDE.md` - Feature docs
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## ✅ Post-Setup Verification

After running migrations, verify:

### Database Tables:
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected output:**
- investments
- transactions
- stock_metadata

### Sample Data:
```sql
-- Check seed data
SELECT COUNT(*) FROM stock_metadata;
```

**Expected:** 25+ stocks

### Views:
```sql
-- List views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

**Expected:**
- v_portfolio_by_sector
- v_portfolio_by_industry
- v_portfolio_by_market_cap

---

## 🎉 Success!

Once migrations are complete:

1. ✅ Database is fully set up
2. ✅ Tables, views, and functions created
3. ✅ Seed data loaded (25+ stocks)
4. ✅ Ready for development

**Next Steps:**
- Run `npm run dev`
- Visit `http://localhost:3000`
- Go to Transactions page
- Add your first transaction
- Explore analytics dashboard

---

**Happy Coding! 🚀📊💰**
