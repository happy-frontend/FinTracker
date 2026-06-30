-- FinTracker Initial Schema
-- Generated from live Supabase production database
-- Tables: expenses, income, investments, partners

-- Partners
create table if not exists public.partners (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  profit_share_percentage numeric default 0,
  investment_amount      numeric default 0, -- legacy column, kept for schema parity
  created_at             timestamptz default now()
);

-- Investments (capital contributions per partner)
create table if not exists public.investments (
  id         uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id),
  date       date not null,
  amount     numeric not null,
  notes      text,
  created_at timestamptz default now()
);

-- Income (event bookings / revenue)
create table if not exists public.income (
  id             uuid primary key default gen_random_uuid(),
  date           date not null,
  caterer        text not null,
  palace         text not null,
  no_of_waiters  integer default 0,
  booking_amount numeric default 0,
  amount_received numeric default 0,
  payment_status text not null,
  created_at     timestamptz default now()
);

-- Expenses (per event costs)
create table if not exists public.expenses (
  id             uuid primary key default gen_random_uuid(),
  date           date not null,
  caterer        text,
  palace         text,
  labour_cost    numeric default 0,
  transport_cost numeric default 0,
  description    text,
  created_at     timestamptz not null default timezone('utc'::text, now())
);
