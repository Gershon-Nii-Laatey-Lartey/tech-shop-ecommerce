-- Add rating and more fields to products if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Update existing products with some random ratings
UPDATE public.products SET rating = 4.5 + (RANDOM() * 0.5) WHERE rating IS NULL;
