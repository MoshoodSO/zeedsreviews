-- Add length constraints to comments table to prevent abuse
-- Using a trigger for validation since CHECK constraints can be restrictive

-- Create validation function for comments
CREATE OR REPLACE FUNCTION public.validate_comment_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate author_name length (1-100 characters)
  IF length(NEW.author_name) > 100 THEN
    RAISE EXCEPTION 'Author name must be 100 characters or less';
  END IF;
  
  -- Validate content length (1-5000 characters)
  IF length(NEW.content) > 5000 THEN
    RAISE EXCEPTION 'Comment must be 5000 characters or less';
  END IF;
  
  -- Validate author_email length and format if provided
  IF NEW.author_email IS NOT NULL AND NEW.author_email != '' THEN
    IF length(NEW.author_email) > 255 THEN
      RAISE EXCEPTION 'Email must be 255 characters or less';
    END IF;
    
    -- Basic email format validation
    IF NEW.author_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Please enter a valid email address';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate comments before insert
DROP TRIGGER IF EXISTS validate_comment_before_insert ON public.comments;
CREATE TRIGGER validate_comment_before_insert
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_comment_input();

-- Create trigger to validate comments before update
DROP TRIGGER IF EXISTS validate_comment_before_update ON public.comments;
CREATE TRIGGER validate_comment_before_update
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_comment_input();