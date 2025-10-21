# Investment Portfolio Tracker - Features

## Overview
A comprehensive investment portfolio tracker built with Next.js, Supabase, and Tailwind CSS. Track all your investments in one place including stocks, mutual funds, ETFs, EPF, PPF, bonds, cryptocurrency, gold, real estate, and more.

## Supported Investment Types

### 1. **Stocks**
   - Track individual stock holdings
   - Record ticker symbol, units, purchase price, and current price
   - View real-time gains/losses

### 2. **Mutual Funds**
   - Track mutual fund investments
   - Record fund code, NAV, units
   - Monitor SIP investments

### 3. **ETFs (Exchange Traded Funds)**
   - Similar to stocks with tracking symbols
   - Monitor portfolio allocation

### 4. **EPF (Employee Provident Fund)**
   - Track employer contributions
   - Monitor accumulated balance
   - Record institution details

### 5. **PPF (Public Provident Fund)**
   - Track contributions
   - Record maturity dates
   - Monitor returns

### 6. **Fixed Deposits**
   - Track FD investments across banks
   - Record maturity dates and interest rates
   - Monitor locked-in investments

### 7. **Bonds**
   - Corporate and government bonds
   - Track coupon rates and maturity
   - Monitor bond portfolio

### 8. **Cryptocurrency**
   - Track crypto holdings
   - Record wallet addresses (in notes)
   - Monitor volatile gains/losses

### 9. **Gold**
   - Physical gold, gold bonds, gold ETFs
   - Track in grams or units
   - Monitor gold investments

### 10. **Real Estate**
   - Property investments
   - Track purchase price and current valuation
   - Record property details in notes

### 11. **NPS (National Pension System)**
   - Track pension contributions
   - Monitor accumulated corpus

### 12. **Savings Account**
   - Track bank balances
   - Monitor liquid assets

### 13. **Recurring Deposit**
   - Track RD investments
   - Record maturity dates

### 14. **Other**
   - Any other investment type not listed above

## Key Features

### 📊 Dashboard Summary
- **Total Invested**: Sum of all investments across categories
- **Current Value**: Real-time portfolio value
- **Total Gain/Loss**: Absolute gains or losses
- **Returns %**: Percentage returns on investment

### 📝 Add Investments
- **Basic Fields** (Always visible):
  - Category (dropdown with all 14 types)
  - Name (Investment name)
  - Symbol/Code (Ticker, fund code, etc.)
  - Amount Invested
  - Current Value
  - Purchase Date

- **Advanced Fields** (Toggle to show):
  - Units/Quantity (shares, grams, sq ft, etc.)
  - Purchase Price per Unit
  - Current Price per Unit
  - Maturity Date (for FDs, bonds, PPF, etc.)
  - Institution/Broker (bank name, broker, etc.)
  - Notes (additional details)

### 🔍 Filtering & Viewing
- Filter by category (All, Stocks, Mutual Funds, etc.)
- View investment count per category
- Sort by latest updated

### 📈 Visualizations
- **Pie Chart**: Portfolio distribution by category
- Shows current value allocation across investment types

### 📋 Investment Table
- Detailed list with:
  - Category badge
  - Investment name and symbol
  - Amount invested
  - Current value
  - Gain/Loss (absolute and percentage)
  - Delete option

### 🎨 UI Features
- Responsive design (mobile, tablet, desktop)
- Color-coded gains (green) and losses (red)
- Clean, modern interface with Tailwind CSS
- Focus states and hover effects
- Indian number formatting (₹ symbol and lakhs/crores)

## Database Schema

```sql
investments table:
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- category (text) - Investment type
- name (text) - Investment name
- symbol (text) - Ticker/code (optional)
- amount_invested (numeric) - Total invested
- current_value (numeric) - Current value
- units (numeric) - Quantity (optional)
- purchase_price (numeric) - Price per unit (optional)
- current_price (numeric) - Current price per unit (optional)
- date_purchased (date) - Purchase date (optional)
- maturity_date (date) - Maturity date (optional)
- notes (text) - Additional notes (optional)
- institution (text) - Bank/broker name (optional)
- updated_at (timestamp) - Last update time
- created_at (timestamp) - Creation time
```

## How to Use

### 1. **Add Your First Investment**
   - Select category from dropdown
   - Enter name (e.g., "Reliance Industries")
   - Enter symbol (e.g., "RELIANCE")
   - Enter amount invested and current value
   - (Optional) Toggle "Show Advanced Fields" for more details
   - Click "Add Investment"

### 2. **Track Multiple Investment Types**
   - Add stocks, mutual funds, EPF, PPF, etc.
   - Each type appears in the portfolio table
   - Portfolio distribution chart updates automatically

### 3. **Monitor Your Returns**
   - View summary cards at the top
   - Check individual investment gains/losses
   - Filter by category to focus on specific types

### 4. **Update Values**
   - Currently: Delete and re-add with new values
   - Future: Edit functionality coming soon

## Example Use Cases

### Stock Investor
- Track multiple stocks
- Monitor daily price changes
- View total equity portfolio

### Mutual Fund SIP Investor
- Add each SIP separately
- Track multiple fund houses
- Monitor fund performance

### Diversified Investor
- Track stocks + mutual funds + gold + real estate
- See complete portfolio allocation
- Balance risk across categories

### Retirement Planning
- Track EPF + PPF + NPS
- Monitor retirement corpus
- Plan long-term investments

### Fixed Income Investor
- Track FDs across banks
- Monitor maturity dates
- Track bond investments

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## Future Enhancements

- [ ] Edit investment functionality
- [ ] Auto-fetch stock prices from APIs
- [ ] Auto-fetch mutual fund NAV
- [ ] SIP tracking with recurring investments
- [ ] Export to Excel/PDF
- [ ] Performance charts over time
- [ ] XIRR calculation for returns
- [ ] Tax calculation (LTCG/STCG)
- [ ] Investment alerts and notifications
- [ ] Multi-currency support
- [ ] Goal-based investing
- [ ] Asset allocation recommendations

## Security
- User authentication with Supabase Auth
- Row Level Security (RLS) enabled
- Each user sees only their investments
- Secure password hashing

## Support
For issues or feature requests, please create an issue in the repository.
