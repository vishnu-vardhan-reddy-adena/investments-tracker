// Stock metadata fetching utility - Auto-fetch company details from NSE/Yahoo Finance

export interface StockMetadata {
  symbol: string
  companyName: string
  sector: string
  industry: string
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap'
  marketCap: number
  exchange: string
  peRatio?: number
  pbRatio?: number
  dividendYield?: number
  inNifty50?: boolean
}

// NSE Sector mapping
const NSE_SECTORS: Record<string, { sector: string; industry: string }> = {
  // IT
  'TCS': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  'INFY': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  'WIPRO': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  'HCLTECH': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  'TECHM': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  'LTI': { sector: 'Information Technology', industry: 'IT Services & Consulting' },
  
  // Banking
  'HDFCBANK': { sector: 'Financial Services', industry: 'Private Banks' },
  'ICICIBANK': { sector: 'Financial Services', industry: 'Private Banks' },
  'KOTAKBANK': { sector: 'Financial Services', industry: 'Private Banks' },
  'AXISBANK': { sector: 'Financial Services', industry: 'Private Banks' },
  'INDUSINDBK': { sector: 'Financial Services', industry: 'Private Banks' },
  'SBIN': { sector: 'Financial Services', industry: 'Public Banks' },
  'PNB': { sector: 'Financial Services', industry: 'Public Banks' },
  'BANKBARODA': { sector: 'Financial Services', industry: 'Public Banks' },
  
  // NBFC
  'BAJFINANCE': { sector: 'Financial Services', industry: 'NBFCs' },
  'BAJAJFINSV': { sector: 'Financial Services', industry: 'NBFCs' },
  'CHOLAFIN': { sector: 'Financial Services', industry: 'NBFCs' },
  
  // Auto
  'MARUTI': { sector: 'Automobile', industry: 'Passenger Vehicles' },
  'TATAMOTORS': { sector: 'Automobile', industry: 'Passenger Vehicles' },
  'M&M': { sector: 'Automobile', industry: 'Passenger Vehicles' },
  'EICHERMOT': { sector: 'Automobile', industry: 'Two Wheelers' },
  'HEROMOTOCO': { sector: 'Automobile', industry: 'Two Wheelers' },
  'BAJAJ-AUTO': { sector: 'Automobile', industry: 'Two Wheelers' },
  
  // Pharma
  'SUNPHARMA': { sector: 'Pharmaceuticals', industry: 'Generic Drugs' },
  'DRREDDY': { sector: 'Pharmaceuticals', industry: 'Generic Drugs' },
  'CIPLA': { sector: 'Pharmaceuticals', industry: 'Generic Drugs' },
  'DIVISLAB': { sector: 'Pharmaceuticals', industry: 'Generic Drugs' },
  'AUROPHARMA': { sector: 'Pharmaceuticals', industry: 'Generic Drugs' },
  
  // FMCG
  'HINDUNILVR': { sector: 'FMCG', industry: 'Personal Care' },
  'ITC': { sector: 'FMCG', industry: 'Diversified FMCG' },
  'NESTLEIND': { sector: 'FMCG', industry: 'Packaged Foods' },
  'BRITANNIA': { sector: 'FMCG', industry: 'Packaged Foods' },
  'DABUR': { sector: 'FMCG', industry: 'Personal Care' },
  
  // Telecom
  'BHARTIARTL': { sector: 'Telecom', industry: 'Telecom Services' },
  'IDEA': { sector: 'Telecom', industry: 'Telecom Services' },
  
  // Energy
  'RELIANCE': { sector: 'Energy', industry: 'Refineries' },
  'ONGC': { sector: 'Energy', industry: 'Oil & Gas Exploration' },
  'BPCL': { sector: 'Energy', industry: 'Refineries' },
  'IOC': { sector: 'Energy', industry: 'Refineries' },
  
  // Metals
  'TATASTEEL': { sector: 'Metals & Mining', industry: 'Steel' },
  'HINDALCO': { sector: 'Metals & Mining', industry: 'Aluminium' },
  'JSWSTEEL': { sector: 'Metals & Mining', industry: 'Steel' },
  'VEDL': { sector: 'Metals & Mining', industry: 'Diversified Metals' },
  'COALINDIA': { sector: 'Metals & Mining', industry: 'Coal' },
  
  // Cement
  'ULTRACEMCO': { sector: 'Construction Materials', industry: 'Cement' },
  'GRASIM': { sector: 'Construction Materials', industry: 'Cement' },
  'SHREECEM': { sector: 'Construction Materials', industry: 'Cement' },
  
  // Consumer Durables
  'TITAN': { sector: 'Consumer Durables', industry: 'Gems & Jewellery' },
  'ASIANPAINT': { sector: 'Consumer Durables', industry: 'Paints' },
  
  // ETFs
  'NIFTYBEES': { sector: 'ETF', industry: 'Index ETF' },
  'GOLDBEES': { sector: 'ETF', industry: 'Commodity ETF' },
  'BANKBEES': { sector: 'ETF', industry: 'Sectoral ETF' },
  'JUNIORBEES': { sector: 'ETF', industry: 'Index ETF' },
}

const NIFTY_50_STOCKS = [
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK', 'BAJAJ-AUTO',
  'BAJFINANCE', 'BAJAJFINSV', 'BHARTIARTL', 'BPCL', 'BRITANNIA', 'CIPLA',
  'COALINDIA', 'DIVISLAB', 'DRREDDY', 'EICHERMOT', 'GRASIM', 'HCLTECH',
  'HDFCBANK', 'HDFCLIFE', 'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR', 'ICICIBANK',
  'INDUSINDBK', 'INFY', 'ITC', 'JSWSTEEL', 'KOTAKBANK', 'LT', 'M&M', 'MARUTI',
  'NESTLEIND', 'NTPC', 'ONGC', 'POWERGRID', 'RELIANCE', 'SBIN', 'SHREECEM',
  'SUNPHARMA', 'TATAMOTORS', 'TATASTEEL', 'TCS', 'TECHM', 'TITAN', 'ULTRACEMCO',
  'UPL', 'WIPRO'
]

/**
 * Fetch stock metadata from Yahoo Finance API
 */
export async function fetchStockMetadata(symbol: string): Promise<StockMetadata | null> {
  try {
    const cleanSymbol = symbol.replace('.NS', '').toUpperCase()
    
    // Try Yahoo Finance for detailed stock data
    const yahooSymbol = `${cleanSymbol}.NS`
    const response = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=summaryProfile,defaultKeyStatistics,price`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )
    
    if (!response.ok) {
      console.warn(`Yahoo Finance API failed for ${cleanSymbol}`)
      return getFallbackMetadata(cleanSymbol)
    }
    
    const data = await response.json()
    const result = data.quoteSummary?.result?.[0]
    
    if (!result) {
      return getFallbackMetadata(cleanSymbol)
    }
    
    const profile = result.summaryProfile || {}
    const keyStats = result.defaultKeyStatistics || {}
    const price = result.price || {}
    
    // Get company name
    const companyName = price.longName || price.shortName || cleanSymbol
    
    // Get sector and industry
    let sector = profile.sector || 'Unknown'
    let industry = profile.industry || 'Unknown'
    
    // Override with NSE mapping if available
    const nseMapping = NSE_SECTORS[cleanSymbol]
    if (nseMapping) {
      sector = nseMapping.sector
      industry = nseMapping.industry
    }
    
    // Get market cap
    const marketCap = price.marketCap || 0
    const marketCapInCrores = marketCap / 10000000 // Convert to crores
    
    // Determine market cap category
    let marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap'
    if (marketCapInCrores >= 20000) {
      marketCapCategory = 'Large Cap'
    } else if (marketCapInCrores >= 5000) {
      marketCapCategory = 'Mid Cap'
    } else if (marketCapInCrores >= 1000) {
      marketCapCategory = 'Small Cap'
    } else {
      marketCapCategory = 'Micro Cap'
    }
    
    return {
      symbol: cleanSymbol,
      companyName,
      sector,
      industry,
      marketCapCategory,
      marketCap: marketCapInCrores,
      exchange: 'NSE',
      peRatio: keyStats.forwardPE?.raw || keyStats.trailingPE?.raw,
      pbRatio: keyStats.priceToBook?.raw,
      dividendYield: keyStats.dividendYield?.raw ? keyStats.dividendYield.raw * 100 : undefined,
      inNifty50: NIFTY_50_STOCKS.includes(cleanSymbol)
    }
    
  } catch (error) {
    console.error(`Error fetching metadata for ${symbol}:`, error)
    return getFallbackMetadata(symbol.replace('.NS', '').toUpperCase())
  }
}

/**
 * Get fallback metadata from local NSE mapping
 */
function getFallbackMetadata(symbol: string): StockMetadata | null {
  const nseMapping = NSE_SECTORS[symbol]
  
  if (!nseMapping) {
    return {
      symbol,
      companyName: symbol,
      sector: 'Unknown',
      industry: 'Unknown',
      marketCapCategory: 'Small Cap',
      marketCap: 0,
      exchange: 'NSE',
      inNifty50: NIFTY_50_STOCKS.includes(symbol)
    }
  }
  
  return {
    symbol,
    companyName: symbol,
    sector: nseMapping.sector,
    industry: nseMapping.industry,
    marketCapCategory: NIFTY_50_STOCKS.includes(symbol) ? 'Large Cap' : 'Mid Cap',
    marketCap: 0,
    exchange: 'NSE',
    inNifty50: NIFTY_50_STOCKS.includes(symbol)
  }
}

/**
 * Search for stock by partial symbol or name
 */
export async function searchStock(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&enableEnhancedTrivialQuery=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    const quotes = data.quotes || []
    
    return quotes
      .filter((q: any) => q.exchange === 'NSI' || q.symbol?.endsWith('.NS'))
      .map((q: any) => ({
        symbol: q.symbol.replace('.NS', ''),
        name: q.longname || q.shortname || q.symbol
      }))
      .slice(0, 10)
    
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

/**
 * Batch fetch metadata for multiple stocks
 */
export async function fetchMultipleStockMetadata(symbols: string[]): Promise<Map<string, StockMetadata>> {
  const metadataMap = new Map<string, StockMetadata>()
  
  const promises = symbols.map(async (symbol, index) => {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, index * 100))
    const metadata = await fetchStockMetadata(symbol)
    if (metadata) {
      metadataMap.set(symbol.replace('.NS', '').toUpperCase(), metadata)
    }
  })
  
  await Promise.all(promises)
  return metadataMap
}

/**
 * Get sector color for charts
 */
export function getSectorColor(sector: string): string {
  const sectorColors: Record<string, string> = {
    'Information Technology': '#3b82f6',
    'Financial Services': '#10b981',
    'Automobile': '#f59e0b',
    'Pharmaceuticals': '#ef4444',
    'FMCG': '#8b5cf6',
    'Telecom': '#06b6d4',
    'Energy': '#f97316',
    'Metals & Mining': '#64748b',
    'Construction Materials': '#a855f7',
    'Consumer Durables': '#ec4899',
    'ETF': '#6366f1',
    'Unknown': '#9ca3af',
    'Uncategorized': '#9ca3af'
  }
  
  return sectorColors[sector] || '#9ca3af'
}

/**
 * Get market cap color
 */
export function getMarketCapColor(category: string): string {
  const colors: Record<string, string> = {
    'Large Cap': '#10b981',
    'Mid Cap': '#3b82f6',
    'Small Cap': '#f59e0b',
    'Micro Cap': '#ef4444',
    'Uncategorized': '#9ca3af'
  }
  
  return colors[category] || '#9ca3af'
}
