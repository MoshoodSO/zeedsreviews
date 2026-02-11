-- Allow public users to read approved comments (needed for the comments_public view)
CREATE POLICY "Anyone can view approved comments"
ON public.comments
FOR SELECT
USING (is_approved = true);
