import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Star, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  slug: string;
  title: string;
  book_title: string;
  book_author: string;
  author_name: string;
  cover_image: string | null;
  rating: number | null;
  content: string;
  published_at: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const ReviewDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchReview();
    }
  }, [slug]);

  const fetchReview = async () => {
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("*, categories(name)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (reviewData) {
      setReview(reviewData);
      fetchComments(reviewData.id);
    }

    setIsLoading(false);
  };

  const fetchComments = async (reviewId: string) => {
    const { data } = await supabase
      .from("comments_public")
      .select("*")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="aspect-[3/4] max-w-md mx-auto mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!review) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Review Not Found
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            The review you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reviews
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          to="/reviews"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body">Back to Reviews</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {review.title}
            </h1>
            <p className="font-display text-xl text-primary italic mb-4">
              {review.book_title} by {review.book_author}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {review.author_name}
              </span>
              {review.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(review.published_at), "MMMM d, yyyy")}
                </span>
              )}
              {review.categories?.name && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {review.categories.name}
                </span>
              )}
            </div>

            {/* Rating */}
            {review.rating && (
              <div className="flex items-center justify-center gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < review.rating!
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {review.cover_image && (
            <div className="mb-8 flex justify-center">
              <img
                src={review.cover_image}
                alt={`Cover of ${review.book_title}`}
                className="max-w-sm w-full rounded-lg shadow-soft"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none font-body">
            {review.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4 text-foreground/90 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Comments Section */}
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Comments ({comments.length})
            </h2>

            <div className="mb-8 bg-muted/50 rounded-lg p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Leave a Comment
              </h3>
              <CommentForm
                reviewId={review.id}
                onCommentSubmitted={() => fetchComments(review.id)}
              />
            </div>

            <CommentList comments={comments} />
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default ReviewDetail;
