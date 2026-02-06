-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    UNIQUE(user_id, product_id, order_id) -- One review per product per order
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
    ON public.product_reviews
    FOR SELECT
    USING (true);

-- Users can insert reviews if they have a delivered order for that product
CREATE POLICY "Users can insert reviews"
    ON public.product_reviews
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.order_items oi ON o.id = oi.order_id
            WHERE o.user_id = auth.uid() 
            AND o.status = 'delivered'
            AND oi.product_id = product_reviews.product_id
            AND o.id = product_reviews.order_id
        )
    );

-- Admins can delete reviews
CREATE POLICY "Admins can manage reviews"
    ON public.product_reviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
