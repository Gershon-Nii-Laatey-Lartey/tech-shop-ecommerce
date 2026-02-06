-- Create discounts table
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10, 2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins have full access
CREATE POLICY "Admins can do everything on discounts"
    ON public.discounts
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Users can read discounts (to validate)
CREATE POLICY "Anyone can read active discounts"
    ON public.discounts
    FOR SELECT
    USING (is_active = true);
