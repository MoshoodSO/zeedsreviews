import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ReviewGrid } from "@/components/reviews/ReviewGrid";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-book.jpg";

interface Review {
  id: string;
  slug: string;
  title: string;
  book_title: string;
  book_author: string;
  cover_image: string | null;
  rating: number | null;
  content: string;
  published_at: string | null;
}

interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
}

const Index = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch site settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value");

    if (settingsData) {
      const settingsObj: SiteSettings = {};
      settingsData.forEach((item) => {
        settingsObj[item.key as keyof SiteSettings] = item.value || undefined;
      });
      setSettings(settingsObj);
    }

    // Fetch published reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData);
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Books"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in">
              {settings.site_name || "Zeeds Book Review"}
            </h1>
            <p className="font-display text-xl md:text-2xl text-primary italic mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {settings.site_tagline || "Exploring the world through books"}
            </p>
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
              {settings.site_description ||
                "A curated collection of book reviews, literary musings, and reading recommendations."}
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            Latest Reviews
          </h2>
        </div>
        
        <ReviewGrid reviews={reviews} isLoading={isLoading} />
      </section>
    </Layout>
  );
};

export default Index;
