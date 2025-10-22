# 📊 Advanced Portfolio Analytics & Transactions Guide

## 🎯 What's New

Your portfolio tracker now includes **comprehensive analytics** and a **dedicated transactions management system** with the following features:

### ✅ New Features Implemented

1. **Sector-wise Analysis** - Portfolio distribution across IT, Banking, Pharma, Energy, etc.
2. **Industry-wise Analysis** - Granular breakdown by specific industries
3. **Market Cap Analysis** - Large Cap, Mid Cap, Small Cap distribution
4. **Dedicated Transactions Page** - Manage all buy/sell/bonus/split operations
5. **Auto-fetch Stock Metadata** - Automatic sector, industry, market cap detection
6. **Transaction Types** - Buy, Sell, Bonus, Split, Dividend tracking

---

## 📈 Analytics Dashboard

### Sector-wise Distribution

**What it shows:**
- Portfolio allocation across major sectors (IT, Banking, Pharma, Energy, FMCG, etc.)
- Visual donut chart with sector percentages
- Top 5 sectors with investment amounts
- Number of stocks in each sector

**How to use:**
1. Add stocks with symbols to your portfolio
2. System automatically fetches sector information
3. View sector distribution in the dashboard
4. Identify sector concentration risks

**Supported Sectors:**
- Information Technology
- Financial Services (Banking, NBFCs)
- Pharmaceuticals
- Automobile
- FMCG (Fast Moving Consumer Goods)
- Telecom
- Energy (Oil & Gas, Refineries)
- Metals & Mining
- Construction Materials
- Consumer Durables

### Industry-wise Analysis

**What it shows:**
- Detailed breakdown by specific industries
- Bar chart showing top 10 industries
- Investment concentration at industry level
- More granular than sector analysis

**Examples of Industries:**
- IT Services & Consulting
- Private Banks
- Public Banks
- NBFCs
- Generic Drugs
- Passenger Vehicles
- Refineries
- Steel
- Telecom Services

### Market Cap Distribution

**What it shows:**
- Portfolio split between Large Cap, Mid Cap, Small Cap, Micro Cap
- Donut chart with percentage allocation
- Risk profile based on market cap exposure
- Number of stocks in each category

**Market Cap Categories:**
- **Large Cap**: Market Cap ≥ ₹20,000 crores
- **Mid Cap**: Market Cap ₹5,000 - ₹20,000 crores
- **Small Cap**: Market Cap ₹1,000 - ₹5,000 crores
- **Micro Cap**: Market Cap < ₹1,000 crores

---

## 💼 Transactions Page

### Accessing Transactions

Click the **"📊 Transactions"** button in the dashboard header to open the dedicated transactions page.

### Transaction Types

#### 1. **BUY**

Record stock purchase transactions.

**Required Fields:**
- Symbol: NSE stock code (e.g., TCS, INFY)
- Transaction Date
- Quantity: Number of shares purchased
- Price per Unit: Purchase price per share

**Optional Fields:**
- Brokerage Fee
- STT Charges
- Other Charges
- Notes

**Example:**
```
Type: Buy
Date: 2024-10-15
Symbol: TCS
Quantity: 10
Price: ₹3,500
Brokerage: ₹20
Total: ₹35,020
```

#### 2. **SELL**

Record stock sale transactions.

**Required Fields:**
- Symbol
- Transaction Date
- Quantity: Number of shares sold
- Price per Unit: Selling price

**Calculation:**
Total Amount = (Quantity × Price) - Fees - Charges

**Example:**
```
Type: Sell
Date: 2024-11-20
Symbol: INFY
Quantity: 5
Price: ₹1,600
Brokerage: ₹15
Total: ₹7,985
```

#### 3. **BONUS**

Record bonus shares received.

**Required Fields:**
- Symbol
- Transaction Date
- Bonus Ratio (e.g., 1:1, 1:2)
- Bonus Quantity: Shares received

**Example:**
```
Type: Bonus
Date: 2024-09-10
Symbol: RELIANCE
Ratio: 1:1
Quantity: 10 (received 10 bonus shares)
```

#### 4. **SPLIT**

Record stock split events.

**Required Fields:**
- Symbol
- Transaction Date
- Split Ratio (e.g., 1:2, 2:1)
- New Quantity: Total shares after split

**Example:**
```
Type: Split
Date: 2024-08-05
Symbol: WIPRO
Ratio: 1:2 (1 share becomes 2)
Old Quantity: 100
New Quantity: 200
```

#### 5. **DIVIDEND**

Record dividend received.

**Required Fields:**
- Symbol
- Transaction Date
- Dividend Amount: Total dividend received

**Example:**
```
Type: Dividend
Date: 2024-07-15
Symbol: HDFCBANK
Amount: ₹1,200
```

### Auto-fetch on Symbol Entry

**How it works:**

1. Start typing stock symbol in the Symbol field
2. Search results appear with matching stocks
3. Click on a stock to auto-fill:
   - Stock Name
   - Current Price (if market is open)
   - Company details

**Supported:**
- All NSE stocks
- Popular ETFs
- Real-time price fetching

---

## 🔄 Automatic Metadata Detection

### When Adding Investments

When you add a Stock or ETF with a symbol, the system automatically fetches:

1. **Sector** - Primary business sector
2. **Industry** - Specific industry classification
3. **Market Cap Category** - Large/Mid/Small/Micro cap
4. **Company Name** - Official company name
5. **Current Price** - Latest trading price

### How to Ensure Data Quality

**Best Practices:**
1. Always enter the NSE symbol correctly (e.g., `TCS`, not `tcs` or `TCS.NS`)
2. Symbol is **case-insensitive** but use uppercase for consistency
3. Wait for auto-fetch to complete before submitting
4. Verify fetched data before saving

### Fallback Mechanism

If live data fetch fails:
- System uses local NSE database (50+ popular stocks)
- You can manually edit sector/industry later
- Metadata updates on next "Refresh Prices" action

---

## 📊 Using the Analytics

### Sector Diversification

**Ideal Portfolio:**
- No single sector > 30% of portfolio
- Minimum 3-4 different sectors
- Balance between growth (IT) and defensive (FMCG) sectors

**Red Flags:**
- 🔴 > 50% in one sector = High concentration risk
- 🟡 > 40% in one sector = Moderate risk
- 🟢 < 30% in any sector = Well diversified

### Market Cap Allocation

**Recommended Mix:**
- **Conservative**: 70% Large Cap, 20% Mid Cap, 10% Small Cap
- **Balanced**: 50% Large Cap, 30% Mid Cap, 20% Small Cap
- **Aggressive**: 40% Large Cap, 30% Mid Cap, 30% Small Cap

**Your Risk Profile:**
- More Large Cap = Lower risk, stable returns
- More Mid/Small Cap = Higher risk, potentially higher returns

---

## 🛠️ Setup Instructions

### Database Setup

Run the enhanced schema to add new tables:

```bash
# Navigate to your project
cd d:\Portfolio Tracker\investment-tracker

# Apply the new schema
# Option 1: Using Supabase Dashboard
# - Go to Supabase Dashboard > SQL Editor
# - Copy content from sql/enhanced_schema.sql
# - Execute the query

# Option 2: Using psql (if you have direct database access)
psql -h your-db-host -U postgres -d your-database -f sql/enhanced_schema.sql
```

### What Gets Created

1. **transactions table** - Stores all buy/sell/bonus/split/dividend records
2. **stock_metadata table** - Caches stock information (sector, industry, market cap)
3. **New columns in investments** - sector, industry, market_cap_category
4. **Views** - v_portfolio_by_sector, v_portfolio_by_industry, v_portfolio_by_market_cap
5. **Seed data** - 25+ popular NSE stocks with metadata

### Verification

After running the schema:

1. Go to Transactions page
2. Add a test transaction (e.g., Buy TCS)
3. Check if auto-fetch works
4. Return to dashboard
5. Verify sector/industry/market cap charts appear

---

## 💡 Tips & Tricks

### Transaction Management

1. **Import Historical Data**: Add all past transactions chronologically
2. **Track Fees Accurately**: Include brokerage, STT, stamp duty for accurate P&L
3. **Use Notes**: Add context like "Bought during market dip" for future reference
4. **Regular Updates**: Log transactions on the same day

### Analytics Insights

1. **Rebalance Regularly**: If one sector > 40%, consider rebalancing
2. **Monitor Market Cap Mix**: Adjust based on market conditions
3. **Sector Rotation**: Move between sectors based on economic cycles
4. **Risk Management**: Use analytics to identify and reduce concentration

### Data Quality

1. **Verify Symbols**: Always double-check NSE symbol before adding
2. **Update Prices**: Click "Refresh Prices" daily during market hours
3. **Review Metadata**: Check if sector/industry assignments make sense
4. **Clean Data**: Delete duplicate or incorrect transactions

---

## 🎨 UI Components

### New Charts

1. **Sector Donut Chart** - Color-coded by sector
2. **Industry Bar Chart** - Top 10 industries
3. **Market Cap Donut Chart** - Cap category distribution

### Color Scheme

**Sectors:**
- IT: Blue (#3b82f6)
- Financial Services: Green (#10b981)
- Pharmaceuticals: Red (#ef4444)
- FMCG: Purple (#8b5cf6)
- Telecom: Cyan (#06b6d4)
- Energy: Orange (#f97316)
- Metals: Gray (#64748b)

**Market Cap:**
- Large Cap: Green (#10b981)
- Mid Cap: Blue (#3b82f6)
- Small Cap: Orange (#f59e0b)
- Micro Cap: Red (#ef4444)

---

## 🔍 Troubleshooting

### "No sector data available"

**Cause**: Stocks don't have symbols or metadata hasn't been fetched

**Solution:**
1. Add symbols to your stock investments
2. Click "Refresh Prices" to fetch metadata
3. Manually add sector/industry if auto-fetch fails

### "Stock not found in search"

**Cause**: Incorrect symbol or stock not listed on NSE

**Solution:**
1. Verify symbol from NSE website
2. Use exact NSE ticker code
3. For new listings, wait 24-48 hours for data availability

### Transactions not updating portfolio

**Cause**: Transactions are independent of investments table currently

**Solution:**
- This is expected behavior
- Transactions are for record-keeping
- Manually update investments table for portfolio calculations
- Future update will sync transactions → investments automatically

---

## 🚀 Next Steps

1. ✅ Run `sql/enhanced_schema.sql` in Supabase
2. ✅ Navigate to /transactions page
3. ✅ Add your first transaction
4. ✅ Add symbols to existing investments
5. ✅ Click "Refresh Prices" to fetch metadata
6. ✅ View analytics in dashboard
7. 🔄 Set up regular transaction logging
8. 📊 Review portfolio diversification monthly

---

## 📞 Support

If you encounter any issues:

1. Check browser console for errors (F12)
2. Verify database schema is properly applied
3. Ensure Supabase environment variables are set
4. Test with a popular stock (e.g., TCS, INFY) first

**Common Stock Symbols for Testing:**
- TCS, INFY, WIPRO (IT)
- HDFCBANK, ICICIBANK (Banking)
- RELIANCE (Energy)
- SUNPHARMA (Pharma)
- MARUTI (Auto)

Happy Investing! 📈💰
