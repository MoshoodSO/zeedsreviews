-- Change default so comments appear immediately without moderation
ALTER TABLE public.comments ALTER COLUMN is_approved SET DEFAULT true;

-- Approve existing pending comments
UPDATE public.comments SET is_approved = true WHERE is_approved = false;