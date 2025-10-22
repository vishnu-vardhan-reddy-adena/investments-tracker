# 📊 Live Stock Price Integration - NSE API Guide

## Overview

Your portfolio tracker now integrates with live stock price data from NSE (National Stock Exchange of India) using Yahoo Finance API as the primary data source.

## Features

✅ **Live Price Updates**: Fetch real-time stock prices for your investments  
✅ **NIFTY 50 Index**: Display current NIFTY 50 value in the header  
✅ **Automatic Calculation**: Auto-update current values based on units × live price  
✅ **Caching**: 1-minute cache to prevent excessive API calls  
✅ **Batch Updates**: Update multiple stocks in one click  

## How to Use

### 1. Adding Stocks with Symbols

When adding a new stock investment, make sure to fill in the **Symbol** field:

```
Category: Stock
Name: Reliance Industries
Symbol: RELIANCE (or RELIANCE.NS)
Units: 10
Purchase Price: 2500
```

**Important Symbol Formats:**
- NSE stocks: Use the stock code (e.g., `RELIANCE`, `TCS`, `INFY`)
- You can optionally add `.NS` suffix (e.g., `RELIANCE.NS`)
- ETFs: Use ETF ticker (e.g., `NIFTYBEES`, `GOLDBEES`)

### 2. Refreshing Live Prices

Click the **"↻ Refresh Prices"** button in the dashboard header:

1. The system will find all Stock/ETF investments with symbols
2. Fetch live prices from Yahoo Finance API
3. Update `current_price` and `current_value` fields
4. Show success message with count of updated stocks

### 3. Viewing NIFTY 50

The NIFTY 50 index value is automatically loaded when you open the dashboard and displayed in the header.

## Technical Details

### API Endpoints

**Primary Source: Yahoo Finance API**
- Endpoint: `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.NS`
- No authentication required
- No rate limits for reasonable usage
- More reliable than NSE official API (no CORS issues)

**NIFTY 50 Index**
- Symbol: `^NSEI`
- Endpoint: `https://query1.finance.yahoo.com/v8/finance/chart/^NSEI`

### Data Retrieved

For each stock symbol, the API fetches:
- **Last Price**: Current trading price
- **Change**: Absolute change from previous close
- **% Change**: Percentage change
- **Previous Close**: Yesterday's closing price
- **Open**: Today's opening price
- **High/Low**: Intraday high and low prices
- **Timestamp**: Last update time

### Caching Strategy

```typescript
Cache Duration: 60 seconds (1 minute)
Storage: In-memory Map
Key: Stock symbol (uppercase)
Value: { quote, timestamp }
```

This prevents redundant API calls when refreshing frequently.

### Database Updates

When you click "Refresh Prices", the system:

1. Queries Supabase for investments with symbols
2. Fetches live quotes from Yahoo Finance
3. Calculates new current_value = units × current_price
4. Updates Supabase with:
   ```sql
   UPDATE investments 
   SET current_price = ?,
       current_value = ?
   WHERE id = ?
   ```

## Common NSE Stock Symbols

### Top 10 NSE Stocks
| Company | Symbol |
|---------|--------|
| Reliance Industries | RELIANCE |
| Tata Consultancy Services | TCS |
| HDFC Bank | HDFCBANK |
| Infosys | INFY |
| ICICI Bank | ICICIBANK |
| Hindustan Unilever | HINDUNILVR |
| ITC | ITC |
| State Bank of India | SBIN |
| Bharti Airtel | BHARTIARTL |
| Kotak Mahindra Bank | KOTAKBANK |

### Popular ETFs
| ETF Name | Symbol |
|----------|--------|
| Nifty BeES | NIFTYBEES |
| Gold BeES | GOLDBEES |
| Bank BeES | BANKBEES |
| Junior BeES | JUNIORBEES |
| Liquid BeES | LIQUIDBEES |

## Troubleshooting

### Issue: "No stocks with symbols found to update"

**Solution**: Make sure you've added the stock symbol when creating investments.

1. Edit your investment
2. Add the NSE symbol in the "Symbol" field
3. Save and try refreshing again

### Issue: Prices not updating

**Possible reasons:**
1. **Market is closed**: NSE trading hours are 9:15 AM - 3:30 PM IST (Mon-Fri)
2. **Invalid symbol**: Check if the symbol is correct
3. **Network issue**: Check your internet connection

**How to debug:**
1. Open browser console (F12)
2. Click "Refresh Prices"
3. Look for error messages
4. Common errors:
   - `CORS error`: Yahoo Finance API is blocked (try VPN)
   - `404`: Invalid stock symbol
   - `Rate limit`: Too many requests (wait 1 minute)

### Issue: NIFTY 50 showing "--"

**Solution**: 
1. Refresh the page
2. Check internet connection
3. Market might be closed (index updates during trading hours)

## API Limitations

### Yahoo Finance API
- **Rate Limiting**: ~2000 requests/hour per IP
- **Data Delay**: Real-time for most liquid stocks, 15-min delay for some
- **Market Hours**: Live prices only during NSE trading hours
- **Availability**: Free, no API key needed

### Best Practices

1. **Don't spam refresh**: Wait at least 1 minute between refreshes
2. **Update symbols carefully**: Use exact NSE ticker codes
3. **Check market hours**: Prices update only during trading hours
4. **Verify units**: Ensure units are correct for accurate value calculation

## Example Workflow

### Adding a Stock Investment

```
1. Click "Add New Investment"
2. Fill in details:
   - Category: Stock
   - Name: Tata Consultancy Services
   - Symbol: TCS
   - Amount Invested: 35000
   - Current Value: 35000 (initial)
   - Units: 10
   - Purchase Price: 3500
   - Current Price: 3500 (will be updated)
   - Date Purchased: 2024-01-15

3. Click "Add"
4. Investment appears in the list
```

### Updating Prices

```
1. Click "↻ Refresh Prices" button
2. System fetches live price for TCS (let's say ₹3,650)
3. Calculates new value: 10 units × ₹3,650 = ₹36,500
4. Updates database:
   - current_price: 3650
   - current_value: 36500
5. Shows success: "Successfully updated 1 stock prices!"
6. Dashboard automatically refreshes
7. ROI and XIRR recalculated with new values
```

## Advanced Features

### Automatic Price Updates (Future Enhancement)

You can add a scheduled job to auto-refresh prices:

```typescript
// Set up interval (refresh every 5 minutes during market hours)
useEffect(() => {
  const isMarketHours = () => {
    const now = new Date()
    const hours = now.getHours()
    const day = now.getDay()
    // Monday-Friday, 9:15 AM - 3:30 PM IST
    return day >= 1 && day <= 5 && hours >= 9 && hours <= 15
  }

  const interval = setInterval(() => {
    if (isMarketHours()) {
      refreshLivePrices()
    }
  }, 5 * 60 * 1000) // 5 minutes

  return () => clearInterval(interval)
}, [])
```

### Price Alerts (Future Enhancement)

Set up alerts when stock hits target price:

```typescript
interface PriceAlert {
  symbol: string
  targetPrice: number
  condition: 'above' | 'below'
  notified: boolean
}
```

## Security & Privacy

✅ **No API Keys Required**: Yahoo Finance API is public  
✅ **Client-Side Only**: All API calls from browser  
✅ **No Data Sharing**: Your portfolio data stays in your Supabase  
✅ **HTTPS Only**: Secure connections  

## Support & Resources

- **NSE Website**: [www.nseindia.com](https://www.nseindia.com)
- **Yahoo Finance**: [finance.yahoo.com](https://finance.yahoo.com)
- **Stock Symbols**: Check NSE website for official ticker codes
- **Market Hours**: Mon-Fri, 9:15 AM - 3:30 PM IST

## Next Steps

1. ✅ Add symbols to your existing stock investments
2. ✅ Click "Refresh Prices" to update values
3. ✅ Monitor NIFTY 50 index
4. 🔄 Set up automatic refresh (optional)
5. 📊 Track real-time performance

---

**Pro Tip**: Update prices before market close (3:30 PM IST) to get the most accurate daily performance!
