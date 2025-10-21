# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly for automated deployment.

## 📋 Pre-Deployment Checklist

### 1. Local Development
- [ ] Application runs locally (`npm run dev`)
- [ ] Can login/signup successfully
- [ ] Can add/delete investments
- [ ] Dashboard displays correctly
- [ ] Charts render properly
- [ ] No console errors

### 2. Supabase Configuration
- [ ] Supabase project created
- [ ] Database schema executed (`sql/schema.sql`)
- [ ] RLS policies enabled
- [ ] Authentication configured
- [ ] Email confirmation settings configured
- [ ] API keys copied (URL + anon key)

### 3. Environment Variables
- [ ] `.env.local` file created locally
- [ ] Supabase URL added
- [ ] Supabase anon key added
- [ ] Values tested and working
- [ ] `.env.local` in `.gitignore` ✅

### 4. Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] All files committed to Git

## 🐙 GitHub Setup Checklist

### 5. Git Repository
- [ ] Git initialized (`git init`)
- [ ] `.gitignore` file present
- [ ] Initial commit created
- [ ] All changes committed

### 6. GitHub Repository
- [ ] GitHub account created
- [ ] New repository created on GitHub
- [ ] Repository is private/public (your choice)
- [ ] Remote origin added
- [ ] Code pushed to main branch

### 7. GitHub Secrets (for Actions)
- [ ] Go to: Settings → Secrets and variables → Actions
- [ ] `NEXT_PUBLIC_SUPABASE_URL` secret added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret added

## 🚀 Vercel Deployment Checklist

### 8. Vercel Account
- [ ] Vercel account created (signup with GitHub)
- [ ] GitHub connection authorized

### 9. Project Import
- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js ✅
- [ ] Root directory: `./` ✅

### 10. Environment Variables in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] Variables set for: Production ✅
- [ ] Variables set for: Preview ✅
- [ ] Variables set for: Development ✅

### 11. First Deployment
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Deployment successful ✅
- [ ] Production URL received

## 🧪 Post-Deployment Testing

### 12. Production Site Testing
- [ ] Visit production URL
- [ ] Homepage loads correctly
- [ ] Can navigate to `/login`
- [ ] Can signup with email
- [ ] Can login successfully
- [ ] Dashboard loads
- [ ] Can add investment
- [ ] Can delete investment
- [ ] Chart displays correctly
- [ ] Filtering works
- [ ] Mobile responsive

### 13. Auto-Deployment Testing
- [ ] Make small code change
- [ ] Commit and push to main branch
- [ ] Check GitHub Actions runs
- [ ] Check Vercel detects push
- [ ] New deployment triggered
- [ ] Deployment succeeds
- [ ] Changes visible on production

## 🔧 Optional Enhancements

### 14. Custom Domain (Optional)
- [ ] Domain purchased
- [ ] Added in Vercel → Settings → Domains
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Domain working

### 15. Monitoring (Optional)
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup
- [ ] Performance monitoring active

### 16. Additional Features (Optional)
- [ ] Social auth providers enabled (Google, GitHub)
- [ ] Custom email templates
- [ ] Production database backups configured

## 🎯 Success Criteria

### All Systems Go ✅
- [ ] **Local**: Application runs without errors
- [ ] **Database**: Supabase connected and working
- [ ] **GitHub**: Code pushed and versioned
- [ ] **CI**: GitHub Actions pass all checks
- [ ] **CD**: Vercel deploys automatically
- [ ] **Production**: Live site working perfectly
- [ ] **Auto-Deploy**: Push to GitHub → Auto-deploy working

## 📊 Deployment Commands Reference

### Local Development
```powershell
npm run dev          # Start dev server
npm run build        # Test production build
npm run lint         # Check code quality
npm start            # Run production build locally
```

### Git Commands
```powershell
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

### Deployment
```
Push to GitHub → Automatic deployment!
```

## 🆘 Troubleshooting Guide

### Issue: Build Fails Locally
**Solution**:
```powershell
# Clear cache
rm -r .next node_modules package-lock.json
npm install
npm run build
```

### Issue: Vercel Build Fails
**Check**:
1. Environment variables set correctly
2. Build logs for specific errors
3. All dependencies in `package.json`
4. TypeScript errors resolved

### Issue: Database Connection Error
**Check**:
1. Supabase project is active
2. URL and keys are correct
3. RLS policies are created
4. Network access allowed

### Issue: Auto-Deploy Not Working
**Check**:
1. Vercel connected to correct GitHub repo
2. Correct branch selected (main)
3. GitHub permissions granted
4. Check Vercel dashboard for errors

## 📞 Support Resources

- **Supabase**: https://discord.supabase.com
- **Next.js**: https://github.com/vercel/next.js/discussions
- **Vercel**: https://vercel.com/support
- **GitHub**: https://docs.github.com

---

## 🎉 Completion Checklist

When you can check ALL of these, you're done! 🎊

- [ ] ✅ Local development working
- [ ] ✅ Supabase database setup
- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Vercel deployment successful
- [ ] ✅ Production site accessible
- [ ] ✅ Auto-deployment working
- [ ] ✅ All tests passing

**Congratulations! Your Investment Portfolio Tracker is live with automated CI/CD!** 🚀

---

## 🎯 Next Steps After Deployment

1. **Share your app** - Send production URL to friends/family
2. **Add investments** - Start tracking your portfolio
3. **Monitor performance** - Check Vercel analytics
4. **Plan features** - What's next for your app?
5. **Get feedback** - Improve based on user input

---

**Need help?** Check the documentation files or create an issue!

Happy Investing! 📈💰
