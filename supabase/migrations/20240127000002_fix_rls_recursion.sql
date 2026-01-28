-- 1. Create a security definer function to check admin status without recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop existing policies that might be recursing
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can manage variants" on public.product_variants;
drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Admins can upload product images" on storage.objects;

-- 3. Re-create policies using the helper function
create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin());

create policy "Admins can manage variants"
on public.product_variants
for all
to authenticated
using (public.is_admin());

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin());

-- Storage: Admin write access
create policy "Admins can upload product images"
on storage.objects for all
to authenticated
using (
  bucket_id = 'products' AND
  public.is_admin()
);
