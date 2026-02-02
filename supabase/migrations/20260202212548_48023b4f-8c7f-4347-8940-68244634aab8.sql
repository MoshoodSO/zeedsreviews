-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create site_settings table for editable site content
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    author_name TEXT NOT NULL DEFAULT 'Zeeds',
    book_title TEXT NOT NULL,
    book_author TEXT NOT NULL,
    cover_image TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create about_page table for editable about content
CREATE TABLE public.about_page (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'About Zeeds Book Review',
    content TEXT NOT NULL,
    profile_image TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_page_updated_at BEFORE UPDATE ON public.about_page FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- user_roles: Only admins can manage roles
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- profiles: Users can view all, edit own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- site_settings: Public read, admin write
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE USING (public.is_admin(auth.uid()));

-- categories: Public read, admin write
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin(auth.uid()));

-- reviews: Public read published, admin full access
CREATE POLICY "Anyone can view published reviews" ON public.reviews FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert reviews" ON public.reviews FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE USING (public.is_admin(auth.uid()));

-- comments: Public can read approved, anyone can insert, admin can manage
CREATE POLICY "Anyone can view approved comments" ON public.comments FOR SELECT USING (is_approved = true OR public.is_admin(auth.uid()));
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update comments" ON public.comments FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE USING (public.is_admin(auth.uid()));

-- about_page: Public read, admin write
CREATE POLICY "Anyone can view about page" ON public.about_page FOR SELECT USING (true);
CREATE POLICY "Admins can insert about page" ON public.about_page FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update about page" ON public.about_page FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete about page" ON public.about_page FOR DELETE USING (public.is_admin(auth.uid()));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
    ('site_name', 'Zeeds Book Review'),
    ('site_tagline', 'Exploring the world through books'),
    ('site_description', 'A curated collection of book reviews, literary musings, and reading recommendations.');

-- Insert default about page
INSERT INTO public.about_page (title, content) VALUES
    ('About Zeeds Book Review', 'Welcome to Zeeds Book Review! I am passionate about reading and sharing my thoughts on books across various genres. Join me on this literary journey as we explore captivating stories, thought-provoking narratives, and unforgettable characters.');

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
    ('Fiction', 'fiction', 'Novels and fictional works'),
    ('Non-Fiction', 'non-fiction', 'True stories and factual books'),
    ('Mystery', 'mystery', 'Thriller and mystery novels'),
    ('Biography', 'biography', 'Life stories and memoirs'),
    ('Fantasy', 'fantasy', 'Fantasy and magical realism');