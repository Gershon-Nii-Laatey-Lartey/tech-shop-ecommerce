-- Add role column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Update existing profiles to have user role if null
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view products"
    ON public.products
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update products"
    ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete products"
    ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert sample products
INSERT INTO public.products (name, description, price, image, category, stock, is_new, is_featured) VALUES
('SONIC-X', 'Premium wireless headphones with active noise cancellation', 249.00, '/hero-product.png', 'Audio', 50, true, true),
('TIME-LESS', 'Smart watch with health tracking and notifications', 189.50, '/watch.png', 'Wearables', 30, true, false),
('BLADE M1', 'Ultra-thin laptop with powerful performance', 1299.00, '/laptop.png', 'Computing', 15, false, true),
('CORE BUDS', 'Compact wireless earbuds with premium sound', 99.00, '/hero-product.png', 'Audio', 100, false, false),
('VISION PRO', 'Next-gen AR/VR headset for immersive experiences', 3499.00, '/watch.png', 'Vision', 5, false, true),
('SILK PHONE', 'Flagship smartphone with cutting-edge features', 999.00, '/mobile.png', 'Mobile', 25, false, false);
