-- Add update policy for product_reviews to allow upserts
CREATE POLICY "Users can update their own reviews"
ON public.product_reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
