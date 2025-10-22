# 🤖 AI Agent Instructions - Investment Portfolio Tracker

## 📋 Project Overview

This is a **professional-grade investment portfolio management system** built with **Next.js 14**, **TypeScript**, **Supabase**, and **Tailwind CSS**. The application allows users to track and analyze ALL their investments with live market data, advanced analytics, and comprehensive transaction management.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **APIs**: Yahoo Finance API (via NSE API proxy)
- **Package Manager**: npm

---

## 🎯 Core Functionality

### 1. Investment Categories (14 Types)
- Stocks, Mutual Funds, ETFs, Bonds, Cryptocurrency
- Gold, Fixed Deposit, PPF, EPF, NPS
- Real Estate, Savings Account, Recurring Deposit, Other

### 2. Key Features
- **Portfolio Management**: Add, edit, delete investments
- **Live Market Data**: Real-time NSE stock prices, NIFTY 50 tracking
- **Advanced Analytics**: Sector-wise, Industry-wise, Market Cap analysis
- **Transaction Management**: Buy/Sell, Bonus, Split, Dividend tracking
- **Performance Metrics**: ROI, XIRR, Top/Bottom performers
- **What-If Analysis**: Test portfolio scenarios (-20% to +20%)
- **Auto-metadata**: Fetch company details from NSE symbols

---

## 📁 Project Structure

```
investment-tracker/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with auth
│   ├── page.tsx                 # Home/landing page
│   ├── dashboard/page.tsx       # Main portfolio dashboard
│   ├── transactions/page.tsx    # Transaction management
│   └── login/page.tsx           # Authentication page
├── components/                   # React components
│   ├── AnalysisChart.tsx        # Sector/Industry/Market Cap charts
│   └── PortfolioChart.tsx       # Portfolio distribution chart
├── lib/                         # Utilities & helpers
│   ├── supabaseClient.ts        # Supabase client initialization
│   ├── nseApi.ts                # NSE/Yahoo Finance API integration
│   └── stockMetadata.ts         # Stock metadata lookup
├── sql/                         # Database schemas
│   ├── schema.sql               # Basic schema
│   └── enhanced_schema.sql      # Full schema with transactions
├── scripts/                     # Setup & migration scripts
│   ├── setup-wizard.js          # Interactive setup
│   └── migrate-db.js            # Database migration
└── public/                      # Static assets
```

---

## 🗄️ Database Schema

### Tables

#### 1. `investments`
Core portfolio holdings table
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (VARCHAR) - Investment name
- category (VARCHAR) - Investment type
- current_value (DECIMAL)
- invested_amount (DECIMAL)
- purchase_date (DATE)
- units (DECIMAL)
- price_per_unit (DECIMAL)
- institution (VARCHAR)
- notes (TEXT)
- symbol (VARCHAR) - NSE symbol for stocks
- sector (VARCHAR) - Stock sector
- industry (VARCHAR) - Stock industry
- market_cap (VARCHAR) - Large/Mid/Small/Micro Cap
- created_at, updated_at (TIMESTAMP)
```

#### 2. `transactions`
Transaction history table
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- investment_id (UUID, FK)
- investment_category (VARCHAR)
- transaction_type (VARCHAR) - buy/sell/bonus/split/dividend
- transaction_date (DATE)
- symbol (VARCHAR)
- stock_name (VARCHAR)
- quantity (DECIMAL)
- price_per_unit (DECIMAL)
- total_amount (DECIMAL)
- split_ratio (VARCHAR)
- bonus_ratio (VARCHAR)
- brokerage_fee (DECIMAL)
- stt_charges (DECIMAL)
- other_charges (DECIMAL)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `stock_metadata`
Stock information cache
```sql
- id (UUID, PK)
- symbol (VARCHAR)
- nse_symbol (VARCHAR)
- company_name (VARCHAR)
- sector (VARCHAR)
- industry (VARCHAR)
- market_cap_category (VARCHAR)
- market_cap (DECIMAL)
- pe_ratio, pb_ratio, dividend_yield (DECIMAL)
- is_nifty50, is_nifty_next50, is_nifty500 (BOOLEAN)
- data_source (VARCHAR)
- last_updated (TIMESTAMP)
```

### Row Level Security (RLS)
All tables use RLS policies - users can only access their own data via `auth.uid() = user_id`

---

## 🔧 Key Files & Their Purpose

### Frontend Components

#### `app/dashboard/page.tsx`
- Main portfolio dashboard
- Displays investment summary, category breakdown, top/bottom performers
- Handles add/edit/delete investment operations
- Integrates live price refresh functionality
- Shows XIRR, ROI, and What-If analysis

#### `app/transactions/page.tsx`
- Transaction management interface
- Forms for Buy, Sell, Bonus, Split, Dividend transactions
- Transaction history with filtering
- Auto-fetches stock metadata on symbol entry
- Calculates total amounts with fees

#### `components/AnalysisChart.tsx`
- Advanced analytics visualization
- Sector-wise distribution (donut chart)
- Industry-wise breakdown (bar chart)
- Market cap analysis (donut chart)
- Uses Recharts library

#### `components/PortfolioChart.tsx`
- Category-wise portfolio distribution
- Pie/donut chart visualization
- Shows percentage breakdown

### Backend/API Integration

#### `lib/supabaseClient.ts`
```typescript
// Supabase client initialization
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

#### `lib/nseApi.ts`
- Fetches live stock prices from Yahoo Finance API
- Endpoint: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.NS`
- Returns: current price, previous close, change percentage
- Includes 1-minute caching to prevent rate limits
- Fallback handling for API errors

#### `lib/stockMetadata.ts`
- Local database of 50+ popular NSE stocks
- Contains: symbol, name, sector, industry, market cap
- Fallback when API data is unavailable
- Used for auto-suggestions in transaction forms

---

## 🚀 Common Development Tasks

### Adding New Investment Categories
1. Update category enum in `sql/enhanced_schema.sql`
2. Add to category list in `app/dashboard/page.tsx` (form dropdown)
3. Update TypeScript types if needed

### Adding New Transaction Types
1. Update transaction_type enum in `sql/enhanced_schema.sql`
2. Add form section in `app/transactions/page.tsx`
3. Update transaction list display logic

### Modifying Analytics
1. Edit `components/AnalysisChart.tsx`
2. Update data aggregation logic in dashboard
3. Add new chart types using Recharts components

### Adding New Stock Metadata Fields
1. Update `stock_metadata` table schema
2. Modify `lib/nseApi.ts` to fetch new data
3. Update `lib/stockMetadata.ts` local database
4. Update UI to display new fields

---

## 🔑 Important Conventions

### Code Style
- Use TypeScript for all new files
- Follow Next.js 14 App Router conventions
- Use client components (`'use client'`) only when needed (state, effects, events)
- Server components by default for better performance
- Use Tailwind CSS classes for styling
- Follow camelCase for variables, PascalCase for components

### Database Operations
- Always use RLS policies
- Include `user_id` in all user data queries
- Use parameterized queries (Supabase handles this)
- Handle errors gracefully with try-catch

### API Calls
- Implement caching for external APIs
- Handle rate limits appropriately
- Provide fallback data when APIs fail
- Show loading states during data fetches

### State Management
- Use React hooks (useState, useEffect)
- Keep state local to components when possible
- Use callback functions for child-to-parent communication
- Debounce expensive operations (search, API calls)

---

## 🐛 Common Issues & Solutions

### Issue: Supabase Authentication Not Working
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Live Prices Not Updating
**Solution**: 
- Check Yahoo Finance API is accessible
- Verify symbol format (should end with `.NS` for NSE)
- Check console for CORS or network errors
- Clear cache if data is stale

### Issue: RLS Policies Blocking Queries
**Solution**: 
- Ensure `auth.uid()` matches `user_id` in query
- Check user is authenticated before querying
- Verify RLS policies are correctly set up in Supabase

### Issue: Transaction Not Linking to Investment
**Solution**: 
- Check `investment_id` is correctly passed
- Verify investment exists for the user
- Check foreign key constraints

---

## 📝 Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🧪 Testing Checklist

When making changes, test:
- [ ] User authentication (login/logout)
- [ ] Add/Edit/Delete investments
- [ ] Live price refresh
- [ ] Transaction creation (all types)
- [ ] Analytics charts rendering
- [ ] What-If analyzer
- [ ] Mobile responsiveness
- [ ] RLS policies (can't access other users' data)

---

## 📚 Key Dependencies

### Production
- `next@^14.2.5` - React framework
- `react@^18.2.0` - UI library
- `@supabase/supabase-js@^2.45.0` - Database client
- `recharts@^2.12.7` - Charts library
- `tailwindcss@^3.4.10` - CSS framework

### Development
- `typescript@^5.5.4` - Type checking
- `eslint` - Code linting

---

## 🔄 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. See `DEPLOYMENT_GUIDE.md` for details

### Manual Deployment
```powershell
npm run build
npm start
```

---

## 📖 Documentation References

- **Setup Guide**: `SETUP.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_CHECKLIST.md`
- **Features**: `FEATURES_SUMMARY.md`, `PORTFOLIO_FEATURES.md`
- **Quick Start**: `QUICK_START.md`
- **User Guide**: `USER_GUIDE.md`
- **NSE API**: `NSE_API_GUIDE.md`
- **Analytics**: `ANALYTICS_GUIDE.md`
- **Transactions**: `TRANSACTION_INVESTMENT_LINKAGE.md`
- **Automation**: `GITHUB_VERCEL_AUTOMATION.md`, `DATABASE_AUTOMATION.md`
- **Commands**: `COMMANDS.md`
- **Workflow**: `WORKFLOW_DIAGRAM.md`

---

## 🎯 AI Agent Guidelines

### When Asked to Add Features:
1. **Understand the context**: Review existing code structure
2. **Check database schema**: See if table changes are needed
3. **Follow conventions**: Match existing code style and patterns
4. **Update documentation**: Modify relevant .md files
5. **Test thoroughly**: Ensure RLS policies work correctly

### When Asked to Fix Bugs:
1. **Reproduce the issue**: Understand the problem context
2. **Check logs**: Look for console errors or Supabase logs
3. **Isolate the cause**: Database, API, Frontend, or Logic issue?
4. **Apply minimal fix**: Don't refactor unrelated code
5. **Verify solution**: Test the specific bug scenario

### When Asked to Refactor:
1. **Preserve functionality**: Don't break existing features
2. **Improve gradually**: Don't rewrite entire files
3. **Maintain types**: Keep TypeScript strict
4. **Update imports**: If moving code between files
5. **Test after refactoring**: Ensure nothing broke

### When Asked About Implementation:
1. **Provide context**: Explain why, not just how
2. **Show examples**: Use code snippets
3. **Reference docs**: Point to relevant documentation files
4. **Consider edge cases**: Mention potential issues
5. **Suggest best practices**: Recommend optimal approaches

---

## 🔐 Security Considerations

- **Never expose**: Supabase service role key (use anon key only)
- **Always use**: Row Level Security policies
- **Validate input**: Check user inputs on both client and server
- **Sanitize data**: Prevent SQL injection (Supabase handles this)
- **Use HTTPS**: For all API calls and deployments
- **Implement rate limiting**: For external API calls

---

## 🚦 Performance Tips

- **Lazy load**: Heavy components and charts
- **Cache**: External API responses
- **Debounce**: Search and filter operations
- **Optimize queries**: Use indexes, limit results
- **Use Next.js**: Image optimization and code splitting
- **Minimize re-renders**: Use React.memo, useMemo, useCallback

---

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Recharts Docs**: https://recharts.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Yahoo Finance API**: Public endpoint (no key needed)

---

## 🎓 Learning Path for New Contributors

1. **Understand Next.js 14**: App Router, Server/Client Components
2. **Learn Supabase**: Authentication, Database, RLS
3. **Study the schema**: Review `sql/enhanced_schema.sql`
4. **Explore components**: Start with `app/dashboard/page.tsx`
5. **Read docs**: Go through all .md files in root
6. **Make small changes**: Fix typos, update styles
7. **Add features**: Start with simple enhancements

---

## ✅ Code Review Checklist

Before submitting changes:
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] All forms validate correctly
- [ ] RLS policies tested (can't access other users' data)
- [ ] Responsive on mobile devices
- [ ] Loading states implemented
- [ ] Error handling added
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)

---

## 🎨 UI/UX Guidelines

- **Consistent spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, 16, etc.)
- **Color scheme**: Primary = blue-600, Success = green-600, Danger = red-600
- **Buttons**: Use consistent sizing (py-2 px-4 for standard buttons)
- **Forms**: Label above input, error messages below
- **Tables**: Striped rows, hover effects, responsive scrolling
- **Charts**: Consistent colors, clear legends, responsive sizing
- **Loading states**: Show spinners or skeletons during data fetches
- **Empty states**: Friendly messages when no data exists

---

## 🔮 Future Enhancement Ideas

- Multi-currency support
- Portfolio comparison (vs benchmarks)
- Tax calculation helpers
- Email notifications for price alerts
- Mobile app (React Native)
- AI-powered investment recommendations
- Social features (share portfolios)
- Integration with broker APIs
- Automated transaction imports
- Advanced charting (candlestick, technical indicators)

---

**Version**: 2.0  
**Last Updated**: October 2025  
**Maintainer**: AI Agent & Development Team

---

*This guide is a living document. Update it as the project evolves!*
