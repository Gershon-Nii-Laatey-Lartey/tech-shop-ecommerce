-- Add weight column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2) DEFAULT 0.50; -- Default weight in kg

-- Update existing products with some reasonable weights
UPDATE public.products SET weight = 0.3 WHERE category = 'Audio';
UPDATE public.products SET weight = 0.2 WHERE category = 'Wearables';
UPDATE public.products SET weight = 1.5 WHERE category = 'Computing';
UPDATE public.products SET weight = 0.6 WHERE category = 'Vision';
UPDATE public.products SET weight = 0.2 WHERE category = 'Mobile';
