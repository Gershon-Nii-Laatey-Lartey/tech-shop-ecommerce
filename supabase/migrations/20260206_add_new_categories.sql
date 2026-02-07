-- Migration to add refined tech shop categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('Adapters & Hubs', 'adapters-hubs', 'USB-C hubs, multi-port adapters, and connectors', 10),
('Chargers & Cables', 'chargers-cables', 'Fast chargers, power banks, and durable charging cables', 11),
('Gaming controllers', 'gaming-controllers', 'Gamepads, joysticks, and gaming accessories', 12),
('Headphones & Earbuds', 'headphones-earbuds', 'Over-ear headphones, TWS earbuds, and noise-canceling gear', 13),
('Keyboards & Mice', 'keyboards-mice', 'Mechanical keyboards, ergonomic mice, and desktop peripherals', 14),
('Laptop Stands & Mounts', 'laptop-stands-mounts', 'Ergonomic laptop stands, monitor mounts, and desk risers', 15),
('Other', 'other', 'Miscellaneous tech accessories and gadgets', 99),
('Phone Cases & Covers', 'phone-cases-covers', 'Protective cases, silicone covers, and luxury phone sleeves', 16),
('Screen Protectors', 'screen-protectors', 'Tempered glass and film protectors for all devices', 17),
('Smartwatch Bands', 'smartwatch-bands', 'Replacement straps and bands for smartwatches', 18),
('Speakers & Audio', 'speakers-audio', 'Bluetooth speakers, soundbars, and home audio systems', 19),
('Storage & Memory', 'storage-memory', 'External hard drives, SSDs, and high-speed memory cards', 20),
('Webcams & Microphones', 'webcams-microphones', 'HD webcams and professional streaming microphones', 21)
ON CONFLICT (slug) DO NOTHING;
