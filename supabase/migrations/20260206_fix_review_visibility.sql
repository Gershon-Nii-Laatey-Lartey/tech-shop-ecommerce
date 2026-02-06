-- Allow everyone to see public profile info (needed for reviews)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Ensure product_reviews has a explicit link to profiles for better joining
ALTER TABLE public.product_reviews
DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey;

ALTER TABLE public.product_reviews
ADD CONSTRAINT product_reviews_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Update product reviews policy to be absolutely sure
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read reviews"
ON public.product_reviews
FOR SELECT
USING (true);
