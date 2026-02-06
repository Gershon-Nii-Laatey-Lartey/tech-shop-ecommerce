ALTER TABLE public.orders 
ADD COLUMN payment_transaction_id UUID REFERENCES public.payment_transactions(id);

COMMENT ON COLUMN public.orders.payment_transaction_id IS 'Link to the payment transaction securely verified on the server.';
