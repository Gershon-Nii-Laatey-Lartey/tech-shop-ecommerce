-- Add discount_code to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Update verify_payment to handle discounts and usage
-- (This is just a comment to remind us that the edge function needs update)
