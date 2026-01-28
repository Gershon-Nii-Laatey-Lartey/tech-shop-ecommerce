-- Create roles enum
create type public.user_role as enum ('admin', 'user');

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    role user_role default 'user'::public.user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles: Users can read their own profile
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- Profiles: Admins can view all profiles
create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Profiles: Admins can update roles (be careful with this!)
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Create product variants table
create table if not exists public.product_variants (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    option_type text not null, -- e.g., 'Color', 'Size', 'Storage'
    option_value text not null, -- e.g., 'Midnight Black', 'L', '512GB'
    price_impact numeric default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on product_variants
alter table public.product_variants enable row level security;

-- Variants: Public read access
create policy "Public can view variants"
on public.product_variants for select
to public
using (true);

-- Variants: Admin full access
create policy "Admins can manage variants"
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Update products table RLS for admin management
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Create cart_items table
create table if not exists public.cart_items (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    variant_id uuid references public.product_variants(id) on delete set null,
    quantity integer default 1 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on cart_items
alter table public.cart_items enable row level security;

-- Cart: Users manage their own items
create policy "Users manage their own cart"
on public.cart_items
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Storage bucket setup (Note: Supabase CLI doesn't create buckets via SQL as easily, but we define the policy)
-- Public read access to product-images
create policy "Public read access for products"
on storage.objects for select
to public
using (bucket_id = 'products');

-- Admin write access for product-images
create policy "Admins can upload product images"
on storage.objects for all
to authenticated
using (
  bucket_id = 'products' AND
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
