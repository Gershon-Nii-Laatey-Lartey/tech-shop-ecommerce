-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Color', 'Size'
    value TEXT NOT NULL, -- e.g., 'Space Gray', 'L'
    price_modifier DECIMAL(10, 2) DEFAULT 0, -- Add to base price
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some useful columns to products if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Add variant support to cart and orders
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_name TEXT; -- snapshot of variant at time of purchase

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for images
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Policies for variants
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Create storage bucket for products (via SQL)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
DO $$
BEGIN
    -- Select policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view product files') THEN
        CREATE POLICY "Anyone can view product files" ON storage.objects FOR SELECT USING (bucket_id = 'products');
    END IF;

    -- Insert policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload product files') THEN
        CREATE POLICY "Admins can upload product files" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'products' AND 
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
    END IF;

    -- Update policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update product files') THEN
        CREATE POLICY "Admins can update product files" ON storage.objects FOR UPDATE USING (
            bucket_id = 'products' AND 
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
    END IF;

    -- Delete policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete product files') THEN
        CREATE POLICY "Admins can delete product files" ON storage.objects FOR DELETE USING (
            bucket_id = 'products' AND 
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
    END IF;
END
$$;
