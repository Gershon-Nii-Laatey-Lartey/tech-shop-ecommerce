-- 1. Ensure the 'products' bucket exists and is public
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Add 'options' column to products for flexible JSON-based variants if needed
-- (Though we have a product_variants table, JSON can be easier for quick flat options)
alter table public.products add column if not exists options jsonb default '[]'::jsonb;

-- 3. Ensure the columns for the visual preview are present
alter table public.products add column if not exists specification text;
alter table public.products add column if not exists brand text default 'BRAND TECH';
alter table public.products add column if not exists stock_status text default 'In Stock';
