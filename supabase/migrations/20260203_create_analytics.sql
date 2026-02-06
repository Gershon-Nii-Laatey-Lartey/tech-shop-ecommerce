-- Create analytics table
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click')),
    page_path TEXT,
    element_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Admins can view all analytics"
    ON public.site_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Anyone can insert analytics"
    ON public.site_analytics FOR INSERT
    WITH CHECK (true);

-- Seed some realistic analytics data for the last 30 days
DO $$
DECLARE
    i INTEGER;
    event_type TEXT;
BEGIN
    FOR i IN 1..2000 LOOP
        event_type := CASE WHEN RANDOM() < 0.8 THEN 'page_view' ELSE 'click' END;
        
        INSERT INTO public.site_analytics (
            event_type,
            page_path,
            element_id,
            created_at
        ) VALUES (
            event_type,
            CASE (i % 4)
                WHEN 0 THEN '/'
                WHEN 1 THEN '/products'
                WHEN 2 THEN '/cart'
                ELSE '/admin'
            END,
            CASE WHEN event_type = 'click' THEN 'btn-' || (i % 10)::TEXT ELSE NULL END,
            NOW() - (RANDOM() * INTERVAL '30 days')
        );
    END LOOP;
END $$;
