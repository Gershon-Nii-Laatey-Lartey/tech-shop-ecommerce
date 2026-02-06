-- Create payments table to track all transaction attempts and results
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'abandoned'
    provider TEXT DEFAULT 'paystack',
    provider_response JSONB, -- Store full response for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own transactions
CREATE POLICY "Users can view their own transactions"
    ON public.payment_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions (usually client-side recording)
-- Note: In a stricter environment, this insert would happen via Edge Function to prevent spoofing
CREATE POLICY "Users can insert their own transactions"
    ON public.payment_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.payment_transactions TO authenticated;
