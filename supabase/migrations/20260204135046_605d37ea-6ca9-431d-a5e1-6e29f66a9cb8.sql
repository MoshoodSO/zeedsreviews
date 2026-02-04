-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND is_admin(auth.uid()));

-- Create Zeedits services table
CREATE TABLE public.zeedits_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Zeedits page content table
CREATE TABLE public.zeedits_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL DEFAULT 'Zeedits Editorial Services',
  hero_subtitle TEXT DEFAULT 'Professional editing services to help your manuscript shine',
  contact_email TEXT NOT NULL DEFAULT 'zeeditseditorial@gmail.com',
  intro_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.zeedits_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zeedits_page ENABLE ROW LEVEL SECURITY;

-- RLS policies for zeedits_services
CREATE POLICY "Anyone can view services"
ON public.zeedits_services FOR SELECT
USING (true);

CREATE POLICY "Admins can insert services"
ON public.zeedits_services FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update services"
ON public.zeedits_services FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete services"
ON public.zeedits_services FOR DELETE
USING (is_admin(auth.uid()));

-- RLS policies for zeedits_page
CREATE POLICY "Anyone can view page"
ON public.zeedits_page FOR SELECT
USING (true);

CREATE POLICY "Admins can insert page"
ON public.zeedits_page FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update page"
ON public.zeedits_page FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete page"
ON public.zeedits_page FOR DELETE
USING (is_admin(auth.uid()));

-- Insert default Zeedits page content
INSERT INTO public.zeedits_page (hero_title, hero_subtitle, contact_email, intro_text)
VALUES (
  'Zeedits Editorial Services',
  'Professional editing services to help your manuscript shine',
  'zeeditseditorial@gmail.com',
  'At Zeedits, we provide comprehensive editorial services to help authors at every stage of their writing journey. Whether you''re just starting out or polishing your final draft, our expert editors are here to help.'
);

-- Insert default services
INSERT INTO public.zeedits_services (title, description, display_order) VALUES
(
  'Developmental Editing',
  'A comprehensive analysis of your manuscript''s structure, plot, character development, pacing, and overall narrative arc. We work with you to strengthen the foundation of your story, ensuring your book has the impact you envision.',
  1
),
(
  'Line Editing',
  'Focused on the creative content and writing style at the sentence and paragraph level. We refine your prose for clarity, flow, and voice consistency while preserving your unique style and making your writing more engaging.',
  2
),
(
  'Copyediting',
  'A thorough review for grammar, punctuation, spelling, and syntax. We ensure consistency in style, formatting, and fact-checking while maintaining your voice and preparing your manuscript for publication.',
  3
),
(
  'Proofreading',
  'The final polish before publication. We catch any remaining typos, formatting issues, and minor errors that may have slipped through earlier edits, ensuring your manuscript is publication-ready.',
  4
),
(
  'Editorial Review',
  'A comprehensive assessment of your manuscript with detailed feedback on strengths and areas for improvement. Perfect for authors seeking professional guidance before diving into a full edit.',
  5
);