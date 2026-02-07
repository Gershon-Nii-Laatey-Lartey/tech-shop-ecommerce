-- Update shipping addresses foreign keys to set null on delete of a zone
-- This prevents deletion of zones from being blocked by existing addresses

ALTER TABLE public.shipping_addresses 
DROP CONSTRAINT IF EXISTS shipping_addresses_zone_id_fkey,
DROP CONSTRAINT IF EXISTS shipping_addresses_sub_zone_id_fkey,
DROP CONSTRAINT IF EXISTS shipping_addresses_area_id_fkey;

ALTER TABLE public.shipping_addresses
ADD CONSTRAINT shipping_addresses_zone_id_fkey 
    FOREIGN KEY (zone_id) 
    REFERENCES public.logistics_zones(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT shipping_addresses_sub_zone_id_fkey 
    FOREIGN KEY (sub_zone_id) 
    REFERENCES public.logistics_zones(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT shipping_addresses_area_id_fkey 
    FOREIGN KEY (area_id) 
    REFERENCES public.logistics_zones(id) 
    ON DELETE SET NULL;
