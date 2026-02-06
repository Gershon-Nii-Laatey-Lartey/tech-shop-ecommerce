-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Allow admins to update orders (for status changes)
CREATE POLICY "Admins can update all orders"
    ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Allow admins to view all order items
CREATE POLICY "Admins can view all order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );
