-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own cart items
CREATE POLICY "Users can view their own cart items"
    ON public.cart_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
    ON public.cart_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
    ON public.cart_items
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
    ON public.cart_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
