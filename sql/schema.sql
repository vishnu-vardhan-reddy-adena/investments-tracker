create extension if not exists "uuid-ossp";

create table if not exists investments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  symbol text, -- Stock ticker, mutual fund code, etc.
  amount_invested numeric not null default 0,
  current_value numeric not null default 0,
  units numeric, -- Number of shares, units of mutual fund, grams of gold, etc.
  purchase_price numeric, -- Price per unit at purchase
  current_price numeric, -- Current price per unit
  date_purchased date,
  maturity_date date, -- For FDs, bonds, PPF, etc.
  notes text, -- Additional notes
  institution text, -- Bank, broker, fund house name
  updated_at timestamp default now(),
  created_at timestamp default now()
);

-- Create index for better query performance
create index if not exists idx_investments_user_id on investments(user_id);
create index if not exists idx_investments_category on investments(category);
