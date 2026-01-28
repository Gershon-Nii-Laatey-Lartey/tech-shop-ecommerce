-- Create products table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    price numeric not null,
    image text not null,
    category text not null,
    description text,
    is_new boolean default false,
    is_top boolean default false,
    is_featured boolean default false
);

-- Set up Row Level Security (RLS)
alter table public.products enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
on public.products
for select
to public
using (true);

-- Insert seed data
insert into public.products (name, price, image, category, description, is_new, is_top, is_featured)
values 
    ('SONIC-X', 249.00, '/hero-product.png', 'Audio', 'Experience pure sound with the Sonic-X headphones. Featuring advanced noise cancellation and 40-hour battery life.', true, false, false),
    ('TIME-LESS', 189.50, '/watch.png', 'Wearables', 'A masterpiece of minimalism. The Time-Less watch combines classic design with modern smart features.', true, true, false),
    ('BLADE M1', 1299.00, '/laptop.png', 'Computing', 'The ultimate tool for creators. Thin, light, and incredibly powerful with world-class performance.', false, false, false),
    ('Smart Watch WH22-6', 454.00, '/watch.png', 'Wearables', 'Advanced fitness tracker with heart rate monitoring and GPS tracking.', false, true, false),
    ('Nike White Therma-Fit Hoodie', 154.99, '/hero-product.png', 'Fashion', 'Stay warm and stylish with the Nike Therma-Fit Pullover Training Hoodie.', false, false, true),
    ('Lightweight Nike Trainer', 210.00, '/laptop.png', 'Fashion', 'Ultra-lightweight trainer shoes designed for maximum comfort and speed.', false, true, false);
