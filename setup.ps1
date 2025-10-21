# 🚀 Quick Start Script for Windows

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Investment Portfolio Tracker - Quick Setup            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Git not found. You'll need Git to push to GitHub." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 1: Installing Dependencies" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed. Skipping..." -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 2: Environment Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path ".env.local") {
    Write-Host "⚠ .env.local already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to reconfigure? (y/N)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing configuration..." -ForegroundColor Yellow
        $configureEnv = $false
    } else {
        $configureEnv = $true
    }
} else {
    $configureEnv = $true
}

if ($configureEnv) {
    Write-Host ""
    Write-Host "Please enter your Supabase credentials:" -ForegroundColor Cyan
    Write-Host "(Get these from: Supabase Dashboard → Settings → API)" -ForegroundColor Gray
    Write-Host ""
    
    $supabaseUrl = Read-Host "Supabase Project URL (https://xxxxx.supabase.co)"
    $supabaseKey = Read-Host "Supabase Anon Key (eyJ...)"
    
    if ($supabaseUrl -and $supabaseKey) {
        @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey
"@ | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "✓ Environment variables configured!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Skipping environment configuration (required values missing)" -ForegroundColor Yellow
        Write-Host "  Please manually create .env.local file with your Supabase credentials" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 3: Git Repository Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    $initGit = Read-Host "Initialize Git repository? (Y/n)"
    if ($initGit -ne "n") {
        git init
        git add .
        git commit -m "Initial commit: Investment Portfolio Tracker"
        Write-Host "✓ Git repository initialized!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps for GitHub:" -ForegroundColor Yellow
        Write-Host "1. Create a new repository on GitHub: https://github.com/new" -ForegroundColor Gray
        Write-Host "2. Run these commands:" -ForegroundColor Gray
        Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/investment-tracker.git" -ForegroundColor Gray
        Write-Host "   git branch -M main" -ForegroundColor Gray
        Write-Host "   git push -u origin main" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor White
Write-Host "   - Go to https://vercel.com/new" -ForegroundColor Gray
Write-Host "   - Import your GitHub repository" -ForegroundColor Gray
Write-Host "   - Add environment variables" -ForegroundColor Gray
Write-Host "   - Deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - DEPLOYMENT_GUIDE.md - Complete deployment guide" -ForegroundColor Gray
Write-Host "   - SETUP.md - Detailed setup instructions" -ForegroundColor Gray
Write-Host "   - USER_GUIDE.md - How to use the application" -ForegroundColor Gray
Write-Host "   - PORTFOLIO_FEATURES.md - Feature documentation" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy Tracking! 🚀📈" -ForegroundColor Cyan
