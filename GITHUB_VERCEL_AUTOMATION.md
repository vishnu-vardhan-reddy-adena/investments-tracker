# 📦 GitHub to Vercel Auto-Deployment Setup

This document explains the automated CI/CD pipeline for your Investment Portfolio Tracker.

## 🔄 Automated Workflow

When you push code to GitHub, the following happens automatically:

### 1. GitHub Actions (CI Pipeline)
```
Push to GitHub
    ↓
Run Linting & Type Checks
    ↓
Build Next.js Application
    ↓
Upload Build Artifacts
    ↓
Notify Status
```

### 2. Vercel (CD Pipeline)
```
GitHub Push Detected
    ↓
Clone Repository
    ↓
Install Dependencies
    ↓
Build Next.js App
    ↓
Deploy to Vercel
    ↓
Update Production URL
```

## 🚀 Quick Deployment Steps

### Prerequisites
- ✅ Supabase project created
- ✅ Local development working
- ✅ Code ready to deploy

### Step 1: Create GitHub Repository

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repo (option 1: use website)
# Go to https://github.com/new and create repository

# OR (option 2: use GitHub CLI)
gh repo create investment-tracker --private --source=. --push
```

### Step 2: Push to GitHub

```powershell
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/investment-tracker.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Setup Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**: Select your `investment-tracker` repo
3. **Configure Project**:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_key
   ```
5. **Click Deploy**

### Step 4: Enable Auto-Deployment

✅ **Already Enabled!** Vercel automatically watches your GitHub repository.

## 🔧 Branch Deployment Strategy

### Main Branch (Production)
```powershell
git checkout main
git add .
git commit -m "Production ready feature"
git push origin main
```
**Result**: Deploys to production URL (https://your-app.vercel.app)

### Feature Branch (Preview)
```powershell
git checkout -b feature/new-feature
git add .
git commit -m "Work in progress"
git push origin feature/new-feature
```
**Result**: Creates preview deployment with unique URL

### Pull Request (Staging)
```powershell
# Create PR on GitHub
# Vercel automatically deploys preview
# Comment added to PR with preview URL
```

## 📊 Deployment Monitoring

### View Deployment Status

**GitHub**:
- Green checkmark ✅ = All checks passed
- Red X ❌ = Build failed
- Yellow circle 🟡 = In progress

**Vercel Dashboard**:
- Go to https://vercel.com/dashboard
- Click on your project
- See all deployments with logs

### Deployment URLs

**Production**: 
```
https://your-app.vercel.app
https://your-app-git-main-username.vercel.app
```

**Preview** (per branch):
```
https://your-app-git-feature-branch-username.vercel.app
```

## 🛠️ GitHub Actions Configuration

The CI pipeline runs on every push and checks:

1. **Linting**: ESLint checks code quality
2. **Type Checking**: TypeScript validates types
3. **Build**: Verifies Next.js builds successfully
4. **Artifacts**: Saves build output for debugging

### Configure GitHub Secrets

For GitHub Actions to work with environment variables:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔄 Daily Workflow

### Make Changes
```powershell
# 1. Pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-charts

# 3. Make changes
# ... edit files ...

# 4. Test locally
npm run dev

# 5. Commit & push
git add .
git commit -m "Add interactive charts"
git push origin feature/add-charts
```

### Review & Deploy
```powershell
# 6. Create Pull Request on GitHub
# 7. Review preview deployment
# 8. Merge PR to main
# 9. Automatic production deployment! 🎉
```

## 🐛 Troubleshooting

### Build Fails on Vercel

**Check**:
1. Build logs in Vercel dashboard
2. Environment variables are set
3. All dependencies in package.json
4. Build works locally: `npm run build`

**Common Issues**:
```powershell
# Missing types
npm install --save-dev @types/react @types/react-dom

# Clear cache and rebuild
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### GitHub Actions Fail

**Check**:
1. Workflow logs in GitHub Actions tab
2. Secrets are configured
3. Node version matches (18+)

**Re-run**:
- Go to Actions tab
- Click failed workflow
- Click "Re-run jobs"

### Environment Variables Not Working

**Vercel**:
1. Project Settings → Environment Variables
2. Add variables for: Production, Preview, Development
3. Redeploy after adding

**GitHub Actions**:
1. Repository Settings → Secrets
2. Add secrets with exact names
3. Re-run workflow

## 📈 Deployment Metrics

### Build Times
- **Average**: 1-2 minutes
- **Fast**: < 1 minute (incremental builds)
- **Slow**: 3-5 minutes (cold start, full rebuild)

### Deployment Regions
- **Default**: US East (iad1)
- **Configure** in `vercel.json` for other regions

## 🎯 Best Practices

### Commit Messages
```
feat: Add export to Excel feature
fix: Resolve login redirect issue
docs: Update deployment guide
style: Improve dashboard layout
refactor: Optimize database queries
test: Add unit tests for calculations
```

### Branch Naming
```
feature/add-export
fix/login-bug
hotfix/critical-error
docs/update-readme
```

### Version Control
```powershell
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Vercel can deploy from tags too
```

## 🔐 Security

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's environment variable UI
- ✅ Use different keys for dev/staging/prod

### API Keys
- ✅ Use Supabase RLS (Row Level Security)
- ✅ Only expose public keys (anon key)
- ✅ Never expose service role keys

## 📚 Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎉 Success!

Your Investment Portfolio Tracker now has:
- ✅ Automated testing on every push
- ✅ Automatic deployments to Vercel
- ✅ Preview URLs for every branch
- ✅ Production deployments on main branch
- ✅ Build logs and monitoring
- ✅ Zero-downtime deployments

**Push to GitHub → Automatic Deployment** 🚀
