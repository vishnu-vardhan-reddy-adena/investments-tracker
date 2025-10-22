-- Enhanced Schema for Portfolio Tracker with Transactions and Stock Metadata

-- ============================================
-- 1. TRANSACTIONS TABLE (ENHANCED)
-- ============================================
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  
  -- Investment Type (to filter options)
  investment_category VARCHAR(50) CHECK (investment_category IN (
    'Stock', 'Mutual Fund', 'ETF', 'Bond', 'Cryptocurrency', 
    'Gold', 'Fixed Deposit', 'PPF', 'EPF', 'NPS', 
    'Real Estate', 'Savings Account', 'Recurring Deposit', 'Other'
  )),
  
  -- Transaction Details
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'bonus', 'split', 'dividend')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Stock/Investment Information
  symbol VARCHAR(50),
  stock_name VARCHAR(255),
  
  -- Quantity & Pricing
  quantity DECIMAL(15, 4),
  price_per_unit DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  
  -- Split/Bonus specific
  split_ratio VARCHAR(20), -- e.g., "1:2", "2:1"
  bonus_ratio VARCHAR(20), -- e.g., "1:1", "1:2"
  
  -- Fees & Charges
  brokerage_fee DECIMAL(15, 2) DEFAULT 0,
  stt_charges DECIMAL(15, 2) DEFAULT 0,
  other_charges DECIMAL(15, 2) DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- RLS Policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. STOCK METADATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Stock Identification
  symbol VARCHAR(50) UNIQUE NOT NULL,
  nse_symbol VARCHAR(50),
  company_name VARCHAR(255) NOT NULL,
  
  -- Classification
  sector VARCHAR(100), -- e.g., "Information Technology", "Banking", "Pharmaceuticals"
  industry VARCHAR(100), -- e.g., "Software Services", "Private Banks", "Generic Drugs"
  market_cap_category VARCHAR(20) CHECK (market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap')),
  
  -- Market Data
  market_cap DECIMAL(20, 2), -- in crores
  pe_ratio DECIMAL(10, 2),
  pb_ratio DECIMAL(10, 2),
  dividend_yield DECIMAL(5, 2),
  
  -- Index Membership
  in_nifty_50 BOOLEAN DEFAULT false,
  in_nifty_500 BOOLEAN DEFAULT false,
  
  -- Exchange
  exchange VARCHAR(20) DEFAULT 'NSE',
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_metadata_symbol ON stock_metadata(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_sector ON stock_metadata(sector);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_industry ON stock_metadata(industry);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_market_cap ON stock_metadata(market_cap_category);

-- RLS for stock_metadata (public read access)
ALTER TABLE stock_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view stock metadata" ON stock_metadata;
CREATE POLICY "Anyone can view stock metadata"
  ON stock_metadata FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage stock metadata" ON stock_metadata;
CREATE POLICY "Service role can manage stock metadata"
  ON stock_metadata FOR ALL
  USING (true);

-- ============================================
-- 3. ALTER INVESTMENTS TABLE (Add new fields)
-- ============================================

-- Add sector, industry, market_cap fields to investments table
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS market_cap_category VARCHAR(20) CHECK (market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap')),
ADD COLUMN IF NOT EXISTS stock_metadata_id UUID REFERENCES stock_metadata(id);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to calculate total holdings from transactions
CREATE OR REPLACE FUNCTION calculate_holdings_from_transactions(p_user_id UUID, p_symbol VARCHAR)
RETURNS TABLE (
  total_quantity DECIMAL,
  avg_price DECIMAL,
  total_invested DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE 
      WHEN transaction_type = 'buy' THEN quantity
      WHEN transaction_type = 'sell' THEN -quantity
      WHEN transaction_type = 'bonus' THEN quantity
      WHEN transaction_type = 'split' THEN quantity
      ELSE 0
    END), 0) as total_quantity,
    
    CASE 
      WHEN SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END) > 0 
      THEN SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) / 
           SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END)
      ELSE 0 
    END as avg_price,
    
    COALESCE(SUM(CASE 
      WHEN transaction_type = 'buy' THEN total_amount + COALESCE(brokerage_fee, 0) + COALESCE(stt_charges, 0) + COALESCE(other_charges, 0)
      WHEN transaction_type = 'sell' THEN -(total_amount - COALESCE(brokerage_fee, 0) - COALESCE(stt_charges, 0) - COALESCE(other_charges, 0))
      ELSE 0
    END), 0) as total_invested
    
  FROM transactions
  WHERE user_id = p_user_id 
    AND symbol = p_symbol;
END;
$$ LANGUAGE plpgsql;

-- Function to sync investment from transactions
CREATE OR REPLACE FUNCTION sync_investment_from_transactions()
RETURNS TRIGGER AS $$
DECLARE
  v_investment_id UUID;
  v_holdings RECORD;
  v_metadata RECORD;
BEGIN
  -- Get or create investment record for this symbol
  SELECT id INTO v_investment_id
  FROM investments
  WHERE user_id = NEW.user_id 
    AND symbol = NEW.symbol
    AND category IN ('Stock', 'ETF')
  LIMIT 1;
  
  -- Calculate current holdings from all transactions
  SELECT * INTO v_holdings
  FROM calculate_holdings_from_transactions(NEW.user_id, NEW.symbol);
  
  -- Get stock metadata
  SELECT * INTO v_metadata
  FROM stock_metadata
  WHERE symbol = NEW.symbol
  LIMIT 1;
  
  -- If investment doesn't exist, create it
  IF v_investment_id IS NULL AND v_holdings.total_quantity > 0 THEN
    INSERT INTO investments (
      user_id,
      category,
      name,
      symbol,
      amount_invested,
      current_value,
      units,
      purchase_price,
      current_price,
      sector,
      industry,
      market_cap_category,
      stock_metadata_id
    ) VALUES (
      NEW.user_id,
      CASE WHEN v_metadata.industry = 'Index ETF' OR v_metadata.industry = 'Commodity ETF' OR v_metadata.industry = 'Sectoral ETF' 
           THEN 'ETF' ELSE 'Stock' END,
      COALESCE(NEW.stock_name, v_metadata.company_name, NEW.symbol),
      NEW.symbol,
      v_holdings.total_invested,
      v_holdings.total_quantity * COALESCE(v_holdings.avg_price, 0),
      v_holdings.total_quantity,
      v_holdings.avg_price,
      v_holdings.avg_price,
      v_metadata.sector,
      v_metadata.industry,
      v_metadata.market_cap_category,
      v_metadata.id
    )
    RETURNING id INTO v_investment_id;
    
  -- If investment exists, update it
  ELSIF v_investment_id IS NOT NULL THEN
    UPDATE investments
    SET 
      units = v_holdings.total_quantity,
      amount_invested = v_holdings.total_invested,
      purchase_price = v_holdings.avg_price,
      -- Keep current_price and current_value if already set, otherwise use avg_price
      current_price = COALESCE(current_price, v_holdings.avg_price),
      current_value = CASE 
        WHEN current_price IS NOT NULL THEN v_holdings.total_quantity * current_price
        ELSE v_holdings.total_quantity * v_holdings.avg_price
      END,
      sector = COALESCE(sector, v_metadata.sector),
      industry = COALESCE(industry, v_metadata.industry),
      market_cap_category = COALESCE(market_cap_category, v_metadata.market_cap_category),
      stock_metadata_id = COALESCE(stock_metadata_id, v_metadata.id),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = v_investment_id;
    
    -- If holdings reached zero, optionally delete the investment
    IF v_holdings.total_quantity <= 0 THEN
      -- Option 1: Delete the investment
      -- DELETE FROM investments WHERE id = v_investment_id;
      
      -- Option 2: Keep it but mark as zero (current approach)
      UPDATE investments
      SET units = 0, current_value = 0
      WHERE id = v_investment_id;
    END IF;
  END IF;
  
  -- Link transaction to investment
  IF TG_OP = 'INSERT' THEN
    NEW.investment_id := v_investment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.investment_id := v_investment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-sync investments when transactions are added/updated
DROP TRIGGER IF EXISTS trg_sync_investment_on_transaction ON transactions;
CREATE TRIGGER trg_sync_investment_on_transaction
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_investment_from_transactions();

-- Function to handle transaction deletion
CREATE OR REPLACE FUNCTION sync_investment_on_transaction_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_investment_id UUID;
  v_holdings RECORD;
BEGIN
  -- Get investment for this symbol
  SELECT id INTO v_investment_id
  FROM investments
  WHERE user_id = OLD.user_id 
    AND symbol = OLD.symbol
  LIMIT 1;
  
  IF v_investment_id IS NOT NULL THEN
    -- Recalculate holdings after deletion
    SELECT * INTO v_holdings
    FROM calculate_holdings_from_transactions(OLD.user_id, OLD.symbol);
    
    IF v_holdings.total_quantity > 0 THEN
      -- Update investment with new holdings
      UPDATE investments
      SET 
        units = v_holdings.total_quantity,
        amount_invested = v_holdings.total_invested,
        purchase_price = v_holdings.avg_price,
        current_value = CASE 
          WHEN current_price IS NOT NULL THEN v_holdings.total_quantity * current_price
          ELSE v_holdings.total_quantity * v_holdings.avg_price
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = v_investment_id;
    ELSE
      -- No holdings left, set to zero
      UPDATE investments
      SET units = 0, current_value = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = v_investment_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transaction deletion
DROP TRIGGER IF EXISTS trg_sync_investment_on_transaction_delete ON transactions;
CREATE TRIGGER trg_sync_investment_on_transaction_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_investment_on_transaction_delete();

-- ============================================
-- 5. SEED DATA - Common NSE Stocks Metadata
-- ============================================

INSERT INTO stock_metadata (symbol, nse_symbol, company_name, sector, industry, market_cap_category, in_nifty_50, market_cap) VALUES
-- IT Sector
('RELIANCE', 'RELIANCE', 'Reliance Industries Ltd', 'Energy', 'Refineries', 'Large Cap', true, 1800000),
('TCS', 'TCS', 'Tata Consultancy Services', 'Information Technology', 'IT Services & Consulting', 'Large Cap', true, 1400000),
('INFY', 'INFY', 'Infosys Ltd', 'Information Technology', 'IT Services & Consulting', 'Large Cap', true, 650000),
('WIPRO', 'WIPRO', 'Wipro Ltd', 'Information Technology', 'IT Services & Consulting', 'Large Cap', true, 280000),
('HCLTECH', 'HCLTECH', 'HCL Technologies Ltd', 'Information Technology', 'IT Services & Consulting', 'Large Cap', true, 360000),
('TECHM', 'TECHM', 'Tech Mahindra Ltd', 'Information Technology', 'IT Services & Consulting', 'Large Cap', true, 125000),

-- Banking & Financial Services
('HDFCBANK', 'HDFCBANK', 'HDFC Bank Ltd', 'Financial Services', 'Private Banks', 'Large Cap', true, 1200000),
('ICICIBANK', 'ICICIBANK', 'ICICI Bank Ltd', 'Financial Services', 'Private Banks', 'Large Cap', true, 750000),
('SBIN', 'SBIN', 'State Bank of India', 'Financial Services', 'Public Banks', 'Large Cap', true, 580000),
('KOTAKBANK', 'KOTAKBANK', 'Kotak Mahindra Bank', 'Financial Services', 'Private Banks', 'Large Cap', true, 380000),
('AXISBANK', 'AXISBANK', 'Axis Bank Ltd', 'Financial Services', 'Private Banks', 'Large Cap', true, 320000),
('BAJFINANCE', 'BAJFINANCE', 'Bajaj Finance Ltd', 'Financial Services', 'NBFCs', 'Large Cap', true, 440000),

-- FMCG
('HINDUNILVR', 'HINDUNILVR', 'Hindustan Unilever Ltd', 'FMCG', 'Personal Care', 'Large Cap', true, 620000),
('ITC', 'ITC', 'ITC Ltd', 'FMCG', 'Diversified FMCG', 'Large Cap', true, 580000),
('NESTLEIND', 'NESTLEIND', 'Nestle India Ltd', 'FMCG', 'Packaged Foods', 'Large Cap', true, 220000),

-- Pharma
('SUNPHARMA', 'SUNPHARMA', 'Sun Pharmaceutical Industries', 'Pharmaceuticals', 'Generic Drugs', 'Large Cap', true, 320000),
('DRREDDY', 'DRREDDY', 'Dr Reddys Laboratories', 'Pharmaceuticals', 'Generic Drugs', 'Large Cap', true, 95000),
('CIPLA', 'CIPLA', 'Cipla Ltd', 'Pharmaceuticals', 'Generic Drugs', 'Large Cap', true, 110000),

-- Auto
('MARUTI', 'MARUTI', 'Maruti Suzuki India Ltd', 'Automobile', 'Passenger Vehicles', 'Large Cap', true, 380000),
('M&M', 'M&M', 'Mahindra & Mahindra Ltd', 'Automobile', 'Passenger Vehicles', 'Large Cap', true, 280000),
('TATAMOTORS', 'TATAMOTORS', 'Tata Motors Ltd', 'Automobile', 'Passenger Vehicles', 'Large Cap', true, 350000),

-- Telecom
('BHARTIARTL', 'BHARTIARTL', 'Bharti Airtel Ltd', 'Telecom', 'Telecom Services', 'Large Cap', true, 780000),

-- Metals
('TATASTEEL', 'TATASTEEL', 'Tata Steel Ltd', 'Metals & Mining', 'Steel', 'Large Cap', true, 170000),
('HINDALCO', 'HINDALCO', 'Hindalco Industries Ltd', 'Metals & Mining', 'Aluminium', 'Large Cap', true, 120000),

-- ETFs
('NIFTYBEES', 'NIFTYBEES', 'Nippon India ETF Nifty BeES', 'ETF', 'Index ETF', 'Large Cap', false, 0),
('GOLDBEES', 'GOLDBEES', 'Nippon India ETF Gold BeES', 'ETF', 'Commodity ETF', 'Large Cap', false, 0),
('BANKBEES', 'BANKBEES', 'Nippon India ETF Bank BeES', 'ETF', 'Sectoral ETF', 'Large Cap', false, 0)

ON CONFLICT (symbol) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  sector = EXCLUDED.sector,
  industry = EXCLUDED.industry,
  market_cap_category = EXCLUDED.market_cap_category,
  market_cap = EXCLUDED.market_cap,
  in_nifty_50 = EXCLUDED.in_nifty_50,
  last_updated = CURRENT_TIMESTAMP;

-- ============================================
-- 6. VIEWS FOR ANALYTICS
-- ============================================

-- Sector-wise portfolio view
CREATE OR REPLACE VIEW v_portfolio_by_sector AS
SELECT 
  i.user_id,
  COALESCE(i.sector, 'Uncategorized') as sector,
  COUNT(*) as num_investments,
  SUM(i.current_value) as total_value,
  SUM(i.amount_invested) as total_invested,
  SUM(i.current_value - i.amount_invested) as total_gain,
  CASE 
    WHEN SUM(i.amount_invested) > 0 
    THEN (SUM(i.current_value - i.amount_invested) / SUM(i.amount_invested)) * 100
    ELSE 0
  END as return_pct
FROM investments i
GROUP BY i.user_id, COALESCE(i.sector, 'Uncategorized');

-- Industry-wise portfolio view
CREATE OR REPLACE VIEW v_portfolio_by_industry AS
SELECT 
  i.user_id,
  COALESCE(i.industry, 'Uncategorized') as industry,
  COUNT(*) as num_investments,
  SUM(i.current_value) as total_value,
  SUM(i.amount_invested) as total_invested,
  SUM(i.current_value - i.amount_invested) as total_gain,
  CASE 
    WHEN SUM(i.amount_invested) > 0 
    THEN (SUM(i.current_value - i.amount_invested) / SUM(i.amount_invested)) * 100
    ELSE 0
  END as return_pct
FROM investments i
GROUP BY i.user_id, COALESCE(i.industry, 'Uncategorized');

-- Market Cap wise portfolio view
CREATE OR REPLACE VIEW v_portfolio_by_market_cap AS
SELECT 
  i.user_id,
  COALESCE(i.market_cap_category, 'Uncategorized') as market_cap_category,
  COUNT(*) as num_investments,
  SUM(i.current_value) as total_value,
  SUM(i.amount_invested) as total_invested,
  SUM(i.current_value - i.amount_invested) as total_gain,
  CASE 
    WHEN SUM(i.amount_invested) > 0 
    THEN (SUM(i.current_value - i.amount_invested) / SUM(i.amount_invested)) * 100
    ELSE 0
  END as return_pct
FROM investments i
WHERE i.category IN ('Stock', 'ETF')
GROUP BY i.user_id, COALESCE(i.market_cap_category, 'Uncategorized');

-- ============================================
-- 7. VIEW FOR INVESTMENT OPTIONS (NEW)
-- ============================================

-- View to get all user investments for dropdown in transactions
CREATE OR REPLACE VIEW v_user_investment_options AS
SELECT 
  i.id,
  i.user_id,
  i.category,
  i.name,
  i.symbol,
  i.sector,
  i.industry,
  i.current_value,
  i.units,
  -- Create a display label for dropdown
  CASE 
    WHEN i.symbol IS NOT NULL AND i.symbol != '' 
    THEN i.name || ' (' || i.symbol || ')'
    ELSE i.name
  END as display_name,
  -- Group label for dropdown
  i.category as group_label
FROM investments i
WHERE i.category IN ('Stock', 'Mutual Fund', 'ETF', 'Bond', 'Cryptocurrency', 'Gold', 'NPS')
ORDER BY i.category, i.name;

COMMENT ON TABLE transactions IS 'Stores all buy/sell/bonus/split/dividend transactions';
COMMENT ON TABLE stock_metadata IS 'Cached stock metadata including sector, industry, market cap';
COMMENT ON VIEW v_portfolio_by_sector IS 'Portfolio breakdown by sector';
COMMENT ON VIEW v_portfolio_by_industry IS 'Portfolio breakdown by industry';
COMMENT ON VIEW v_portfolio_by_market_cap IS 'Portfolio breakdown by market capitalization';
COMMENT ON VIEW v_user_investment_options IS 'User investments formatted for dropdown selection in transactions';
