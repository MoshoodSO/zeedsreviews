
-- Add parent_id column for nested replies
ALTER TABLE public.comments 
ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;

-- Create index for faster reply lookups
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Drop and recreate the view to include parent_id
DROP VIEW IF EXISTS public.comments_public;
CREATE VIEW public.comments_public AS
SELECT id, review_id, author_name, content, created_at, parent_id
FROM public.comments
WHERE is_approved = true;
