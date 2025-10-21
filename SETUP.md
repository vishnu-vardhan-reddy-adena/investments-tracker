# Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Git (optional)

## Step 1: Install Dependencies
```powershell
npm install
```

## Step 2: Setup Supabase

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `sql/schema.sql`
3. Click "Run" to create the investments table

### Enable Row Level Security
Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on investments table
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own investments
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own investments
CREATE POLICY "Users can insert own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own investments
CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own investments
CREATE POLICY "Users can delete own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with values from:
Supabase Dashboard → Settings → API

## Step 4: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Create Account and Login

1. Click on the login page
2. Sign up with your email
3. Check your email for verification link
4. Login and start tracking your investments!

## Deployment (Optional)

### Deploy to Vercel
```powershell
npm install -g vercel
vercel
```

Follow the prompts and add your environment variables in Vercel dashboard.

## Troubleshooting

### Database Connection Error
- Check if environment variables are correct
- Ensure Supabase project is active
- Verify RLS policies are created

### Authentication Error
- Check if email confirmation is required in Supabase settings
- Verify Supabase auth configuration
- Clear browser cache and try again

### Build Errors
- Run `npm install` again
- Delete `.next` folder and rebuild
- Check Node.js version (should be 18+)

## Quick Start Example

After setup, try adding your first investment:

1. **Stock Example**:
   - Category: Stock
   - Name: Reliance Industries
   - Symbol: RELIANCE
   - Amount Invested: 50000
   - Current Value: 55000
   - Date Purchased: Select date

2. **Mutual Fund Example**:
   - Category: Mutual Fund
   - Name: HDFC Balanced Advantage Fund
   - Symbol: 119066
   - Amount Invested: 100000
   - Current Value: 110000
   - Institution: HDFC Mutual Fund

3. **EPF Example**:
   - Category: EPF
   - Name: Employee Provident Fund
   - Amount Invested: 500000
   - Current Value: 550000
   - Institution: EPFO

4. **Gold Example**:
   - Category: Gold
   - Name: Physical Gold
   - Amount Invested: 200000
   - Current Value: 220000
   - Units: 40 (grams)
   - Notes: 22K gold jewelry

## Database Maintenance

### Backup Your Data
Export data from Supabase Dashboard → Table Editor → investments → Export to CSV

### Update Existing Investments
Currently, you need to delete and re-add investments to update values.
Edit functionality will be added in a future update.

## Support
For issues, please check:
1. PORTFOLIO_FEATURES.md for feature documentation
2. GitHub issues (if available)
3. Supabase documentation: https://supabase.com/docs
