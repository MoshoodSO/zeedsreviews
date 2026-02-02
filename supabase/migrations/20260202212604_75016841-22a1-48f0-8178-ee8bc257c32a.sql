-- Fix the permissive INSERT policy for comments - require non-empty content and author name
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;

-- More restrictive policy - still allows anyone to insert but validates basic requirements
CREATE POLICY "Anyone can insert comments with valid data" ON public.comments 
FOR INSERT WITH CHECK (
    length(trim(author_name)) > 0 AND 
    length(trim(content)) > 0 AND
    review_id IS NOT NULL
);