-- Create a public view for comments that excludes sensitive author_email column
CREATE VIEW public.comments_public
WITH (security_invoker = on) AS
SELECT 
  id, 
  review_id, 
  author_name, 
  content, 
  created_at, 
  is_approved
FROM public.comments
WHERE is_approved = true;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.comments_public TO anon, authenticated;

-- Drop the old permissive SELECT policy that exposes email
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;

-- Create a new restrictive policy that only allows admins to read from the base table
CREATE POLICY "Only admins can read comments table"
ON public.comments
FOR SELECT
USING (is_admin(auth.uid()));