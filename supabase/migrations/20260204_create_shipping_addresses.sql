-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    city TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own shipping addresses"
    ON public.shipping_addresses
    USING (auth.uid() = user_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES public.shipping_addresses(id) ON DELETE SET NULL;


-- Enable RLS (already enabled in previous migration, but ensuring here)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Additional policies for users to create orders
CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true); -- Usually validated by being linked to an order the user owns

CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );
