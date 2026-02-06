-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view active categories"
    ON public.categories
    FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    ));

CREATE POLICY "Only admins can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update categories"
    ON public.categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete categories"
    ON public.categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for categories
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
('Laptops', 'laptops', 'High-performance laptops and notebooks', 'Laptop', 1),
('Audio', 'audio', 'Premium headphones, earbuds, and speakers', 'Headphones', 2),
('Wearables', 'wearables', 'Smart watches and fitness trackers', 'Watch', 3),
('Vision', 'vision', 'AR/VR headsets and smart glasses', 'Glasses', 4),
('Mobile', 'mobile', 'Smartphones and accessories', 'Smartphone', 5),
('Computing', 'computing', 'Desktops, tablets, and accessories', 'Monitor', 6)
ON CONFLICT (slug) DO NOTHING;

-- Add foreign key constraint to products table (optional, for data integrity)
-- This will ensure products reference valid categories
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
