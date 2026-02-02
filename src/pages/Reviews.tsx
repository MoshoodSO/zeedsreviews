import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ReviewGrid } from "@/components/reviews/ReviewGrid";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (categoriesData) {
      setCategories(categoriesData);
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

  const filteredReviews = selectedCategory
    ? reviews.filter((r) => r.category_id === selectedCategory)
    : reviews;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Book Reviews
          </h1>
          <p className="font-body text-muted-foreground">
            Browse all our book reviews and literary insights
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "font-body",
                selectedCategory === null && "bg-primary text-primary-foreground"
              )}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "font-body",
                  selectedCategory === category.id && "bg-primary text-primary-foreground"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        <ReviewGrid reviews={filteredReviews} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default Reviews;
