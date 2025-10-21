# 🚀 Quick Command Reference

## Initial Setup (One Time)

```powershell
# Option 1: Automated Setup
.\setup.ps1

# Option 2: Manual Setup
npm install
cp .env.example .env.local
# Add Supabase credentials to .env.local
npm run dev
```

## GitHub Setup (One Time)

```powershell
# Initialize and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/investment-tracker.git
git branch -M main
git push -u origin main
```

## Daily Development

```powershell
# Start development
npm run dev                  # → http://localhost:3000

# Before committing
npm run lint                 # Check code quality
npm run build                # Test build
npx tsc --noEmit            # Type check
```

## Git Workflow

```powershell
# Check status
git status

# Create feature branch
git checkout -b feature/my-feature

# Stage and commit
git add .
git commit -m "feat: Add my feature"

# Push to GitHub (auto-deploys preview)
git push origin feature/my-feature

# Merge to main (auto-deploys production)
git checkout main
git merge feature/my-feature
git push origin main
```

## Deployment

```powershell
# Production deployment
git push origin main         # → Automatic deploy to Vercel

# Preview deployment
git push origin feature/*    # → Preview URL created

# Check deployment
# → Visit Vercel dashboard or GitHub Actions tab
```

## Vercel CLI (Optional)

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy from CLI
vercel                       # Preview
vercel --prod               # Production

# Check logs
vercel logs
```

## Supabase CLI (Optional)

```powershell
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > lib/database.types.ts
```

## Troubleshooting

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run build

# Check for errors
npm run lint
npx tsc --noEmit

# View detailed build logs
npm run build -- --debug
```

## Environment Variables

```powershell
# Local (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Vercel (via dashboard)
# Settings → Environment Variables → Add

# GitHub Secrets (for Actions)
# Settings → Secrets and variables → Actions → New secret
```

## Useful URLs

```bash
# Local
http://localhost:3000              # Development
http://localhost:3000/login        # Login page
http://localhost:3000/dashboard    # Dashboard

# Production (after deployment)
https://your-app.vercel.app
https://your-app-git-main-username.vercel.app

# Dashboards
https://supabase.com/dashboard     # Supabase
https://vercel.com/dashboard       # Vercel
https://github.com/YOUR_USERNAME   # GitHub
```

## Common Tasks

```powershell
# Update dependencies
npm update

# Check outdated packages
npm outdated

# Install new package
npm install package-name

# Run production build locally
npm run build && npm start

# Export static site (if needed)
npm run build && npm run export
```

## Git Tags (Versioning)

```powershell
# Create version tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# List tags
git tag

# Deploy specific tag
# → Can deploy from Vercel dashboard
```

## Quick Fixes

```powershell
# Fix: Port already in use
# → Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Fix: Node modules issues
Remove-Item -Recurse -Force node_modules
npm install

# Fix: Git issues
git reset --hard HEAD
git clean -fd

# Fix: Vercel deployment stuck
# → Redeploy from Vercel dashboard
```

## Backup & Restore

```powershell
# Backup database (Supabase dashboard)
# → Database → Backups → Create backup

# Export data
# → Table Editor → Export to CSV

# Backup code
git push origin main              # GitHub is your backup!
```

## Monitoring

```powershell
# Check Vercel deployment status
vercel ls

# View logs
vercel logs

# Check build analytics
# → Vercel Dashboard → Analytics
```

## Keyboard Shortcuts

### VS Code
- `Ctrl + `` - Open terminal
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `F5` - Start debugging

### Browser DevTools
- `F12` - Open DevTools
- `Ctrl + Shift + C` - Element inspector
- `Ctrl + Shift + J` - Console

## Documentation

```
DEPLOYMENT_GUIDE.md          # Complete deployment guide
GITHUB_VERCEL_AUTOMATION.md  # CI/CD pipeline details
DEPLOYMENT_CHECKLIST.md      # Step-by-step checklist
SETUP.md                     # Setup instructions
USER_GUIDE.md                # User documentation
PORTFOLIO_FEATURES.md        # Feature list
```

## Help & Support

```bash
# Documentation
npm run dev -- --help
vercel --help
supabase --help

# Community
https://discord.supabase.com
https://github.com/vercel/next.js/discussions
https://stackoverflow.com
```

---

**Save this file for quick reference!** 📌
