-- 1. Create Admin Settings Table (Generic store-wide config)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Logistics Zones Table (Hierarchical locations)
CREATE TABLE IF NOT EXISTS public.logistics_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.logistics_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0, -- 0: Zone, 1: Sub-Zone, 2: Area
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Update Shipping Addresses Table
ALTER TABLE public.shipping_addresses 
ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.logistics_zones(id),
ADD COLUMN IF NOT EXISTS sub_zone_id UUID REFERENCES public.logistics_zones(id),
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.logistics_zones(id);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_zones ENABLE ROW LEVEL SECURITY;

-- Policies for admin_settings
CREATE POLICY "Public read for settings" ON public.admin_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin full access for settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS ( SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- Policies for logistics_zones
CREATE POLICY "Authenticated read for zones" ON public.logistics_zones
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin full access for zones" ON public.logistics_zones
    FOR ALL USING (
        EXISTS ( SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- 5. Seed initial data
INSERT INTO public.admin_settings (key, value) 
VALUES ('logistics_config', '{"api_endpoint": "", "is_enabled": false}')
ON CONFLICT (key) DO NOTHING;
