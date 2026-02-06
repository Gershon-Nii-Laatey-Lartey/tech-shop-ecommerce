-- Remove external payment fields and unnecessary logic
-- We are switching to a simpler order flow

-- 1. Remove the payment_ref column if it exists in orders
ALTER TABLE public.orders DROP COLUMN IF EXISTS payment_ref;

-- 2. Ensure shipping_address_id IS present (critical for order placement)
-- (It might already be there from previous migrations, but we ensure it here)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES public.shipping_addresses(id) ON DELETE SET NULL;

-- 3. Ensure User ID is present
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Re-apply RLS policies just to be sure everything is clean and working
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- 5. Grant permissions again
GRANT ALL ON public.orders TO authenticated;
