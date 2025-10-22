// NSE API utility for fetching live stock prices

export interface NSEQuote {
  symbol: string
  lastPrice: number
  change: number
  pChange: number
  previousClose: number
  open: number
  high: number
  low: number
  timestamp: string
}

// Popular NSE API endpoints (unofficial)
const NSE_BASE_URL = 'https://www.nseindia.com/api'

// Proxy/CORS bypass - you may need to set up your own backend proxy
// For development, we'll use a mock implementation
export async function fetchNSEQuote(symbol: string): Promise<NSEQuote | null> {
  try {
    // Clean symbol (remove .NS suffix if present)
    const cleanSymbol = symbol.replace('.NS', '').toUpperCase()
    
    // Method 1: Try direct NSE API (may face CORS issues in browser)
    try {
      const response = await fetch(`${NSE_BASE_URL}/quote-equity?symbol=${cleanSymbol}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          symbol: cleanSymbol,
          lastPrice: data.priceInfo?.lastPrice || 0,
          change: data.priceInfo?.change || 0,
          pChange: data.priceInfo?.pChange || 0,
          previousClose: data.priceInfo?.previousClose || 0,
          open: data.priceInfo?.open || 0,
          high: data.priceInfo?.intraDayHighLow?.max || 0,
          low: data.priceInfo?.intraDayHighLow?.min || 0,
          timestamp: new Date().toISOString()
        }
      }
    } catch (corsError) {
      console.log('NSE direct API blocked by CORS, trying alternative...')
    }
    
    // Method 2: Yahoo Finance API (more reliable, no CORS)
    try {
      const yahooSymbol = `${cleanSymbol}.NS`
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        const result = data.chart?.result?.[0]
        const meta = result?.meta
        const quote = result?.indicators?.quote?.[0]
        
        if (meta && quote) {
          return {
            symbol: cleanSymbol,
            lastPrice: meta.regularMarketPrice || 0,
            change: meta.regularMarketPrice - meta.previousClose || 0,
            pChange: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
            previousClose: meta.previousClose || 0,
            open: quote.open?.[0] || meta.regularMarketPrice || 0,
            high: quote.high?.[0] || meta.regularMarketPrice || 0,
            low: quote.low?.[0] || meta.regularMarketPrice || 0,
            timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
          }
        }
      }
    } catch (yahooError) {
      console.error('Yahoo Finance API error:', yahooError)
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

// Fetch multiple quotes in batch
export async function fetchMultipleQuotes(symbols: string[]): Promise<Map<string, NSEQuote>> {
  const quotes = new Map<string, NSEQuote>()
  
  // Fetch in parallel with rate limiting
  const promises = symbols.map(async (symbol, index) => {
    // Add small delay to avoid rate limiting (50ms between requests)
    await new Promise(resolve => setTimeout(resolve, index * 50))
    const quote = await fetchNSEQuote(symbol)
    if (quote) {
      quotes.set(symbol.replace('.NS', '').toUpperCase(), quote)
    }
  })
  
  await Promise.all(promises)
  return quotes
}

// Get NIFTY 50 index value
export async function fetchNifty50(): Promise<number | null> {
  try {
    // Try Yahoo Finance for NIFTY 50
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      const meta = data.chart?.result?.[0]?.meta
      return meta?.regularMarketPrice || null
    }
    
    return null
  } catch (error) {
    console.error('Error fetching NIFTY 50:', error)
    return null
  }
}

// Cache management
const priceCache = new Map<string, { quote: NSEQuote; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export function getCachedQuote(symbol: string): NSEQuote | null {
  const cleanSymbol = symbol.replace('.NS', '').toUpperCase()
  const cached = priceCache.get(cleanSymbol)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.quote
  }
  
  return null
}

export function setCachedQuote(symbol: string, quote: NSEQuote): void {
  const cleanSymbol = symbol.replace('.NS', '').toUpperCase()
  priceCache.set(cleanSymbol, { quote, timestamp: Date.now() })
}
