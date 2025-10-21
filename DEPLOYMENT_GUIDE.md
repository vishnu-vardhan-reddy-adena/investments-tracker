# 🚀 Complete Deployment Guide - Supabase + Next.js + Vercel

This guide will walk you through setting up your Investment Portfolio Tracker with automated deployment.

## 📋 Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Local Development Setup](#local-development)
3. [GitHub Repository Setup](#github-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Automated CI/CD](#automated-cicd)

---

## 1. Supabase Setup

### Step 1.1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Create an organization if you haven't already
4. Fill in project details:
   - **Name**: `investment-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

### Step 1.2: Get API Credentials

1. In your Supabase project dashboard, go to:
   - **Settings** (gear icon) → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 1.3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this entire SQL script:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create investments table
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

-- Create indexes for better performance
create index if not exists idx_investments_user_id on investments(user_id);
create index if not exists idx_investments_category on investments(category);

-- Enable Row Level Security
alter table investments enable row level security;

-- RLS Policies: Users can only access their own investments
create policy "Users can view own investments" on investments
  for select using (auth.uid() = user_id);

create policy "Users can insert own investments" on investments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own investments" on investments
  for update using (auth.uid() = user_id);

create policy "Users can delete own investments" on investments
  for delete using (auth.uid() = user_id);
```

4. Click **"Run"** or press `Ctrl+Enter`
5. You should see: ✅ **"Success. No rows returned"**

### Step 1.4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Optional: Enable other providers (Google, GitHub, etc.)
4. Go to **Authentication** → **Email Templates**
   - Customize confirmation email if desired
5. Go to **Authentication** → **Settings**
   - Enable **"Enable email confirmations"** if you want users to verify email
   - Or disable it for easier testing

✅ **Supabase Setup Complete!**

---

## 2. Local Development Setup

### Step 2.1: Configure Environment Variables

1. In your project root, create `.env.local` file:

```bash
# In PowerShell
New-Item -Path ".env.local" -ItemType File -Force
```

2. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 1.2!

### Step 2.2: Install Dependencies

```powershell
npm install
```

### Step 2.3: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 2.4: Test the Application

1. Go to `/login` route
2. Sign up with your email
3. Check email for confirmation (if enabled)
4. Login and test adding investments

✅ **Local Development Working!**

---

## 3. GitHub Repository Setup

### Step 3.1: Create .gitignore

Your project should already have `.gitignore`. Verify it includes:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# backup files
*.bak
```

⚠️ **Important**: `.env.local` is in `.gitignore` - your secrets won't be pushed!

### Step 3.2: Initialize Git

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Investment Portfolio Tracker"
```

### Step 3.3: Create GitHub Repository

**Option A: Using GitHub Website**

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `investment-tracker`
   - **Description**: "Investment Portfolio Tracker - Track stocks, mutual funds, EPF, PPF, and more"
   - **Visibility**: Private or Public (your choice)
3. **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

**Option B: Using GitHub CLI** (if you have it)

```powershell
gh repo create investment-tracker --private --source=. --remote=origin
```

### Step 3.4: Push to GitHub

Copy the commands from GitHub (they'll look like this):

```powershell
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/investment-tracker.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

✅ **Code Pushed to GitHub!**

---

## 4. Vercel Deployment

### Step 4.1: Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with **GitHub** (recommended for easier integration)
3. Authorize Vercel to access your GitHub account

### Step 4.2: Import Project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your `investment-tracker` repository
3. If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

### Step 4.3: Configure Project

1. **Framework Preset**: Should auto-detect **Next.js** ✅
2. **Root Directory**: Leave as `./` (default)
3. **Build and Output Settings**: Leave defaults
4. Click **"Environment Variables"** section

### Step 4.4: Add Environment Variables

Add these environment variables in Vercel:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

**How to add:**
1. Click **"Add"** under Environment Variables
2. Enter **Name** and **Value**
3. Select **"Production"**, **"Preview"**, and **"Development"** (all three)
4. Click **"Add"** to save
5. Repeat for second variable

### Step 4.5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. You'll see: 🎉 **"Congratulations!"** when done
4. Click **"Visit"** to see your live site

✅ **Live on Vercel!**

Your site will be at: `https://investment-tracker-xxxxx.vercel.app`

---

## 5. Automated CI/CD Pipeline

### 🎉 Already Set Up!

Vercel automatically configures CI/CD when you connect GitHub. Here's what happens:

### Automatic Deployments

**Production Deployment** (main branch):
```
You push to GitHub → Vercel detects push → Builds project → Deploys to production
```

**Preview Deployments** (feature branches):
```
You push to feature branch → Vercel builds → Creates preview URL → Comment on PR
```

### How It Works

1. **Push to `main` branch**:
   ```powershell
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```
   → Automatically deploys to production URL

2. **Push to feature branch**:
   ```powershell
   git checkout -b feature/new-feature
   git add .
   git commit -m "Work in progress"
   git push origin feature/new-feature
   ```
   → Creates preview deployment with unique URL

### Deployment Notifications

- GitHub: Check marks on commits ✅
- Vercel Dashboard: Shows deployment status
- Email: Notifications (if enabled)

### View Deployments

1. Go to your Vercel dashboard
2. Click on your project
3. See all deployments with:
   - Status (Building, Ready, Error)
   - Source (branch, commit)
   - URLs
   - Build logs

---

## 🔧 Advanced Configuration

### Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation (~24 hours)

### Build Configuration (Optional)

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### GitHub Actions (Optional - Advanced)

Create `.github/workflows/ci.yml` for additional CI checks:

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
```

---

## 📱 Complete Workflow Example

### Daily Development Workflow

```powershell
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-export

# 3. Make changes to code
# ... edit files ...

# 4. Test locally
npm run dev

# 5. Commit changes
git add .
git commit -m "Add export to Excel feature"

# 6. Push to GitHub
git push origin feature/add-export

# 7. Vercel automatically creates preview deployment
# Check preview URL in Vercel dashboard or GitHub PR

# 8. When ready, merge to main
git checkout main
git merge feature/add-export
git push origin main

# 9. Vercel automatically deploys to production 🎉
```

---

## 🐛 Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables
   - TypeScript errors (add `// @ts-ignore` temporarily)
   - Missing dependencies

### Environment Variables Not Working

1. Make sure they're prefixed with `NEXT_PUBLIC_`
2. Redeploy after adding variables
3. Check they're added for all environments

### Database Connection Error

1. Verify Supabase project is active
2. Check URL and key are correct
3. Test with Supabase dashboard
4. Verify RLS policies are created

### Local Works But Production Fails

1. Check environment variables in Vercel
2. Look at production build logs
3. Test production build locally:
   ```powershell
   npm run build
   npm start
   ```

---

## 🎯 Next Steps

- [ ] Setup Supabase project
- [ ] Configure local environment
- [ ] Create GitHub repository
- [ ] Deploy to Vercel
- [ ] Test automated deployments
- [ ] Add custom domain (optional)
- [ ] Setup monitoring (optional)

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Docs](https://docs.github.com)

---

## 🆘 Need Help?

- Supabase: [Discord](https://discord.supabase.com)
- Next.js: [GitHub Discussions](https://github.com/vercel/next.js/discussions)
- Vercel: [Support](https://vercel.com/support)

---

**Congratulations! You now have a fully automated deployment pipeline!** 🚀

Every push to GitHub automatically builds and deploys your application to Vercel! 🎉
