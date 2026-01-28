-- 1. Add 'images' column to support multiple product photos
alter table public.products add column if not exists images text[] default '{}'::text[];

-- 2. Add 'features' column for structured bullet points
alter table public.products add column if not exists features text[] default '{}'::text[];

-- 3. Add 'discount_price' for sales
alter table public.products add column if not exists discount_price numeric;
