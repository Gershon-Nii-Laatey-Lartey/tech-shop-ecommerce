-- Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read site content
CREATE POLICY "Anyone can read site content"
    ON public.site_content
    FOR SELECT
    USING (true);

-- Only admins can update site content
CREATE POLICY "Only admins can manage site content"
    ON public.site_content
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert initial empty content for Terms and Privacy
INSERT INTO public.site_content (slug, title, content)
VALUES 
    ('terms-and-conditions', 'Terms and Conditions', 'Edit terms and conditions here.'),
    ('privacy-policy', 'Privacy Policy', 'Edit privacy policy here.'),
    ('shipping-policy', 'Shipping Policy', 'Edit shipping policy here.')
ON CONFLICT (slug) DO NOTHING;
