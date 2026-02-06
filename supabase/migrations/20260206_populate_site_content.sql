-- Add About and Contact to site_content
INSERT INTO public.site_content (slug, title, content)
VALUES 
    ('about-us', 'About Us', 'Welcome to Tech Shop. We are dedicated to bringing you the finest technology products with a focus on quality, innovation, and customer service. Founded in 2024, we have come a long way from our beginnings. When we first started out, our passion for "tech that inspires" drove us to do tons of research so that Tech Shop can offer you the world''s most advanced devices. We now serve customers all over the country, and are thrilled that we''re able to turn our passion into our own website. We hope you enjoy our products as much as we enjoy offering them to you.'),
    ('contact-us', 'Contact Us', 'Have questions? We''d love to hear from you. \n\nEmail: support@techshop.com \nPhone: +233 24 000 0000 \nAddress: 123 Digital Drive, Silicon Valley, Accra \n\nOur support team is available Monday through Friday, 9:00 AM to 5:00 PM.')
ON CONFLICT (slug) DO NOTHING;

-- Update existing pages with more professional content
UPDATE public.site_content 
SET content = E'This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from Tech Shop. \n\n### PERSONAL INFORMATION WE COLLECT\nWhen you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. \n\n### HOW DO WE USE YOUR PERSONAL INFORMATION?\nWe use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).'
WHERE slug = 'privacy-policy';

UPDATE public.site_content 
SET content = E'By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws, and regulations, and agree that you are responsible for compliance with any applicable local laws. \n\n### USE LICENSE\nPermission is granted to temporarily download one copy of the materials (information or software) on Tech Shop''s website for personal, non-commercial transitory viewing only. \n\n### DISCLAIMER\nThe materials on Tech Shop''s website are provided on an ''as is'' basis. Tech Shop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.'
WHERE slug = 'terms-and-conditions';

UPDATE public.site_content 
SET content = E'We aim to process and ship all orders within 1-3 business days. \n\n### SHIPPING RATES\nShipping rates are calculated based on your delivery address and the shipping method selected during checkout. \n\n### DELIVERY TIMES\n- **Standard Shipping**: 3-5 business days \n- **Express Shipping**: 1-2 business days \n\nPlease note that delivery times may vary based on your location and external factors such as weather and carrier delays.'
WHERE slug = 'shipping-policy';
