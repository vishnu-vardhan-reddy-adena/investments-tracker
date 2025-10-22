# 🔗 Transaction-Investment Linkage Guide

## Overview

Your portfolio tracker now has **automatic synchronization** between transactions and investments. When you buy or sell stocks, the system automatically updates your investment holdings.

---

## 🎯 How It Works

### Automatic Flow

```
You add transaction → Database trigger fires → Investment auto-updates
```

**Example:**
1. You record: Buy 10 TCS @ ₹3,500
2. System creates/updates investment with:
   - Units: 10
   - Amount Invested: ₹35,000
   - Purchase Price: ₹3,500
   - Sector/Industry: Auto-fetched

3. You record: Buy 5 more TCS @ ₹3,600
4. System updates investment:
   - Units: 15 (10 + 5)
   - Amount Invested: ₹53,000 (₹35,000 + ₹18,000)
   - Avg Purchase Price: ₹3,533.33

5. You record: Sell 5 TCS @ ₹3,800
6. System updates investment:
   - Units: 10 (15 - 5)
   - Amount Invested: ₹35,333.33 (proportional reduction)
   - Realized P&L: ₹1,333.50 (recorded separately)

---

## 📊 Database Architecture

### Tables & Relationships

```sql
transactions (Many)
    ↓
    └─ investment_id (Foreign Key)
         ↓
investments (One)
    ↓
    └─ stock_metadata_id (Foreign Key)
         ↓
stock_metadata (One)
```

### Triggers

#### 1. **Before Insert/Update Trigger**
```sql
CREATE TRIGGER trg_sync_investment_on_transaction
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_investment_from_transactions();
```

**What it does:**
- Calculates total holdings from all transactions for that symbol
- Creates new investment if doesn't exist
- Updates existing investment with:
  - Current units (Buy + Bonus + Split - Sell)
  - Average purchase price
  - Total amount invested
  - Sector/Industry/Market Cap from metadata
- Links transaction to investment via `investment_id`

#### 2. **After Delete Trigger**
```sql
CREATE TRIGGER trg_sync_investment_on_transaction_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_investment_on_transaction_delete();
```

**What it does:**
- Recalculates holdings after transaction deletion
- Updates investment accordingly
- Sets units to 0 if no holdings remain

---

## 🔢 Calculation Logic

### Holdings Calculation

```sql
Total Quantity = SUM of:
  + BUY transactions (quantity)
  - SELL transactions (quantity)
  + BONUS shares received
  + SPLIT additional shares
  
Average Price = Total Amount Paid / Total Quantity Bought

Total Invested = SUM of:
  + BUY (amount + fees)
  - SELL (amount - fees)
```

### Example Calculation

```
Transactions:
1. Buy 100 @ ₹50 = ₹5,000 + ₹20 fees = ₹5,020
2. Buy 50 @ ₹60 = ₹3,000 + ₹15 fees = ₹3,015
3. Sell 30 @ ₹70 = ₹2,100 - ₹10 fees = ₹2,090
4. Bonus 1:1 = +120 shares

Result:
Total Units = 100 + 50 - 30 + 120 = 240
Total Invested = ₹5,020 + ₹3,015 - ₹2,090 = ₹5,945
Avg Price = ₹8,020 / 150 = ₹53.47
Current Value = 240 × Current Price
```

---

## 🎬 Usage Examples

### Example 1: First Purchase

**Transaction:**
```
Type: Buy
Symbol: INFY
Quantity: 20
Price: ₹1,500
Brokerage: ₹20
Total: ₹30,020
```

**Result:**
- New investment created automatically
- Investment shows:
  ```
  Name: Infosys Ltd
  Symbol: INFY
  Units: 20
  Amount Invested: ₹30,020
  Purchase Price: ₹1,501
  Current Price: ₹1,500
  Current Value: ₹30,000
  Sector: Information Technology
  Industry: IT Services & Consulting
  Market Cap: Large Cap
  ```

### Example 2: Additional Purchase

**Transaction:**
```
Type: Buy
Symbol: INFY
Quantity: 10
Price: ₹1,600
Brokerage: ₹15
Total: ₹16,015
```

**Updated Investment:**
```
Units: 30 (20 + 10)
Amount Invested: ₹46,035 (₹30,020 + ₹16,015)
Avg Purchase Price: ₹1,534.50
Current Value: 30 × Current Price
```

### Example 3: Selling Shares

**Transaction:**
```
Type: Sell
Symbol: INFY
Quantity: 10
Price: ₹1,700
Brokerage: ₹15
STT: ₹5
Total: ₹16,980
```

**Updated Investment:**
```
Units: 20 (30 - 10)
Amount Invested: ₹30,690 (proportionally reduced)
Avg Purchase Price: ₹1,534.50 (unchanged)
Realized P&L: ₹1,635 (₹16,980 - ₹15,345)
```

### Example 4: Bonus Shares

**Transaction:**
```
Type: Bonus
Symbol: INFY
Ratio: 1:2 (1 bonus for 2 held)
Quantity: 10 (bonus shares received)
```

**Updated Investment:**
```
Units: 30 (20 + 10 bonus)
Amount Invested: ₹30,690 (no change, free shares)
Avg Purchase Price: ₹1,023 (₹30,690 / 30)
```

### Example 5: Stock Split

**Transaction:**
```
Type: Split
Symbol: INFY
Ratio: 1:2 (1 share becomes 2)
New Quantity: 60 (after split)
```

**Updated Investment:**
```
Units: 60 (30 × 2)
Amount Invested: ₹30,690 (no change)
Avg Purchase Price: ₹511.50 (₹30,690 / 60)
Current Price: Auto-adjusts on refresh
```

---

## 🔄 Automatic Sync Features

### 1. **Investment Auto-Creation**
- First transaction for a symbol creates investment automatically
- No need to manually add investment first
- Metadata (sector, industry) auto-fetched

### 2. **Holdings Auto-Update**
- Every transaction updates investment immediately
- Units, amount invested, avg price recalculated
- Works for buy, sell, bonus, split

### 3. **Metadata Linking**
- Transaction fetches stock metadata on insert
- Investment gets sector/industry/market cap
- Links to stock_metadata table via foreign key

### 4. **Zero Holdings Handling**
- If you sell all shares, units → 0
- Investment record kept for history
- Can be manually deleted if desired

---

## 🎯 Best Practices

### 1. **Always Use Transactions Page**
For stocks/ETFs, always use the Transactions page instead of manually adding investments. This ensures:
- ✅ Accurate holdings calculation
- ✅ Proper P&L tracking
- ✅ Complete audit trail
- ✅ Automatic metadata

### 2. **Record All Transactions**
Include:
- ✅ All buy/sell transactions
- ✅ Brokerage and fees (for accurate cost basis)
- ✅ Bonus shares received
- ✅ Stock splits
- ✅ Dividends (for income tracking)

### 3. **Transaction Order**
- Transactions are processed in chronological order
- If backdating, ensure dates are accurate
- System recalculates from all transactions

### 4. **Manual Investments**
Use manual investment entry (dashboard) for:
- ✅ Mutual Funds (not traded like stocks)
- ✅ EPF, PPF, FDs
- ✅ Gold, Real Estate
- ✅ Other non-stock investments

---

## 🛠️ Database Functions

### Function: calculate_holdings_from_transactions()

```sql
SELECT * FROM calculate_holdings_from_transactions(
  'user-uuid',
  'TCS'
);
```

**Returns:**
```
total_quantity | avg_price | total_invested
100           | 3533.33   | 353333.00
```

**Use Case:** Manually verify holdings calculation

### Manual Sync (if needed)

If for some reason sync doesn't work, you can manually trigger:

```sql
-- Recalculate holdings for specific stock
SELECT sync_investment_from_transactions()
WHERE symbol = 'TCS';
```

---

## 🚨 Important Notes

### Transaction Types and Investment Impact

| Transaction Type | Units Impact | Amount Impact | Notes |
|-----------------|--------------|---------------|-------|
| **Buy** | +quantity | +amount + fees | Increases holdings |
| **Sell** | -quantity | -amount - fees | Decreases holdings, creates realized P&L |
| **Bonus** | +quantity | No change | Free shares, reduces avg price |
| **Split** | × ratio | No change | Multiplies shares, adjusts price |
| **Dividend** | No change | No change | Income only, tracked separately |

### Data Integrity

- ✅ **Foreign Key Constraints**: Transactions link to investments
- ✅ **Triggers**: Auto-sync ensures data consistency
- ✅ **Recalculation**: Always accurate, calculated from all transactions
- ✅ **Audit Trail**: All transactions preserved, can't lose history

### Realized vs Unrealized P&L

**Unrealized P&L:**
```
Current Value - Amount Invested
= (Units × Current Price) - Total Invested
```

**Realized P&L (from sells):**
```sql
SELECT 
  symbol,
  SUM(CASE 
    WHEN transaction_type = 'sell' 
    THEN total_amount - (quantity * avg_purchase_price)
    ELSE 0 
  END) as realized_pnl
FROM transactions
WHERE user_id = 'your-uuid'
GROUP BY symbol;
```

---

## 📊 Reporting Queries

### 1. Holdings Report

```sql
SELECT 
  i.symbol,
  i.name,
  i.units,
  i.purchase_price as avg_price,
  i.current_price,
  i.amount_invested,
  i.current_value,
  i.current_value - i.amount_invested as unrealized_pnl,
  ((i.current_value - i.amount_invested) / i.amount_invested) * 100 as return_pct
FROM investments i
WHERE i.user_id = 'your-uuid'
  AND i.category IN ('Stock', 'ETF')
  AND i.units > 0
ORDER BY i.current_value DESC;
```

### 2. Transaction History by Stock

```sql
SELECT 
  t.transaction_date,
  t.transaction_type,
  t.quantity,
  t.price_per_unit,
  t.total_amount,
  t.brokerage_fee + t.stt_charges + t.other_charges as total_fees
FROM transactions t
WHERE t.user_id = 'your-uuid'
  AND t.symbol = 'TCS'
ORDER BY t.transaction_date DESC;
```

### 3. Realized P&L Summary

```sql
SELECT 
  t.symbol,
  COUNT(*) FILTER (WHERE transaction_type = 'sell') as num_sells,
  SUM(CASE 
    WHEN transaction_type = 'sell' 
    THEN total_amount - (brokerage_fee + stt_charges + other_charges)
    ELSE 0 
  END) as total_sell_proceeds,
  SUM(CASE 
    WHEN transaction_type = 'sell' 
    THEN quantity 
    ELSE 0 
  END) as total_sold_quantity
FROM transactions t
WHERE t.user_id = 'your-uuid'
GROUP BY t.symbol
HAVING SUM(CASE WHEN transaction_type = 'sell' THEN 1 ELSE 0 END) > 0;
```

---

## 🔧 Troubleshooting

### Issue: Investment not updating after transaction

**Solution:**
1. Check if transaction was inserted successfully
2. Verify trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_sync_investment_on_transaction';
   ```
3. Manually trigger sync:
   ```sql
   UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE symbol = 'TCS';
   ```

### Issue: Holdings don't match my records

**Solution:**
1. Check all transactions for that symbol:
   ```sql
   SELECT * FROM transactions WHERE symbol = 'TCS' ORDER BY transaction_date;
   ```
2. Manually calculate:
   ```sql
   SELECT * FROM calculate_holdings_from_transactions('user-uuid', 'TCS');
   ```
3. Compare with investment table

### Issue: Investment created with wrong sector/industry

**Solution:**
1. Stock metadata might be missing
2. Add to stock_metadata table manually
3. Re-trigger sync

---

## 🎓 Migration Guide

### For Existing Users

If you already have investments without transactions:

**Option 1: Create Opening Balance Transactions**
```sql
-- For each existing stock investment, create a buy transaction
INSERT INTO transactions (
  user_id, transaction_type, transaction_date, symbol, stock_name,
  quantity, price_per_unit, total_amount
)
SELECT 
  user_id, 'buy', COALESCE(date_purchased, CURRENT_DATE),
  symbol, name, units, purchase_price, amount_invested
FROM investments
WHERE category IN ('Stock', 'ETF') AND units > 0;
```

**Option 2: Keep Separate**
- Keep existing investments as-is
- Use transactions page for new trades only
- Gradually migrate by recording all future trades

---

## ✅ Benefits of Transaction-Investment Linkage

1. **Single Source of Truth**: Transactions are the primary record
2. **Accurate Holdings**: Auto-calculated from all transactions
3. **Complete History**: Never lose trade data
4. **Proper P&L**: Realized and unrealized tracked correctly
5. **Tax Reporting**: FIFO/LIFO calculations possible
6. **Audit Trail**: Full transparency for compliance
7. **Data Integrity**: Triggers ensure consistency
8. **Auto-metadata**: Sector/Industry auto-populated

---

## 🚀 Next Steps

1. ✅ Run `sql/enhanced_schema.sql` to create triggers
2. ✅ Test with a sample transaction (Buy TCS)
3. ✅ Verify investment auto-creates/updates
4. ✅ Record all future stock trades via Transactions page
5. ✅ Use dashboard for mutual funds and other investments
6. 📊 Generate P&L reports using provided queries

**Happy Trading! 📈💰**
