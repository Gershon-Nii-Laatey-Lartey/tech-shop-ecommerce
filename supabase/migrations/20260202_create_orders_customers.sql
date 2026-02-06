-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    items_count INTEGER DEFAULT 1,
    payment_method TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Admins can view all customers"
    ON public.customers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own customer data"
    ON public.customers FOR SELECT
    USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Admins can view all order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert sample customers
INSERT INTO public.customers (full_name, email, phone, address, city, country) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0101', '123 Main St', 'New York', 'USA'),
('Emma Johnson', 'emma.j@example.com', '+1-555-0102', '456 Oak Ave', 'Los Angeles', 'USA'),
('Michael Brown', 'michael.b@example.com', '+1-555-0103', '789 Pine Rd', 'Chicago', 'USA'),
('Sarah Davis', 'sarah.d@example.com', '+1-555-0104', '321 Elm St', 'Houston', 'USA'),
('James Wilson', 'james.w@example.com', '+1-555-0105', '654 Maple Dr', 'Phoenix', 'USA'),
('Lisa Anderson', 'lisa.a@example.com', '+1-555-0106', '987 Cedar Ln', 'Philadelphia', 'USA'),
('David Martinez', 'david.m@example.com', '+1-555-0107', '147 Birch Ct', 'San Antonio', 'USA'),
('Jennifer Taylor', 'jennifer.t@example.com', '+1-555-0108', '258 Spruce Way', 'San Diego', 'USA'),
('Robert Thomas', 'robert.t@example.com', '+1-555-0109', '369 Willow Pl', 'Dallas', 'USA'),
('Mary Garcia', 'mary.g@example.com', '+1-555-0110', '741 Ash Blvd', 'San Jose', 'USA');

-- Insert sample orders (using customer IDs from above)
DO $$
DECLARE
    customer_ids UUID[];
    product_ids UUID[];
    i INTEGER;
    order_id UUID;
    customer_id UUID;
    product_id UUID;
BEGIN
    -- Get customer IDs
    SELECT ARRAY_AGG(id) INTO customer_ids FROM public.customers LIMIT 10;
    -- Get product IDs
    SELECT ARRAY_AGG(id) INTO product_ids FROM public.products LIMIT 6;
    
    -- Create orders for the past 30 days
    FOR i IN 1..50 LOOP
        customer_id := customer_ids[1 + (i % 10)];
        
        INSERT INTO public.orders (
            order_number,
            customer_id,
            status,
            total_amount,
            items_count,
            payment_method,
            shipping_address,
            created_at
        ) VALUES (
            'ORD-' || LPAD(i::TEXT, 5, '0'),
            customer_id,
            CASE (i % 5)
                WHEN 0 THEN 'delivered'
                WHEN 1 THEN 'shipped'
                WHEN 2 THEN 'processing'
                WHEN 3 THEN 'pending'
                ELSE 'delivered'
            END,
            (RANDOM() * 2000 + 100)::DECIMAL(10,2),
            (RANDOM() * 3 + 1)::INTEGER,
            CASE (i % 3)
                WHEN 0 THEN 'Credit Card'
                WHEN 1 THEN 'PayPal'
                ELSE 'Debit Card'
            END,
            '123 Sample Address',
            NOW() - (RANDOM() * INTERVAL '30 days')
        ) RETURNING id INTO order_id;
        
        -- Add order items
        FOR j IN 1..(RANDOM() * 2 + 1)::INTEGER LOOP
            product_id := product_ids[1 + (j % 6)];
            
            INSERT INTO public.order_items (
                order_id,
                product_id,
                product_name,
                quantity,
                price
            )
            SELECT 
                order_id,
                product_id,
                p.name,
                (RANDOM() * 2 + 1)::INTEGER,
                p.price
            FROM public.products p
            WHERE p.id = product_id;
        END LOOP;
    END LOOP;
END $$;
