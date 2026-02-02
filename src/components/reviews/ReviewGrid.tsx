import { ReviewCard } from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ReviewGridProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewGrid({ reviews, isLoading }: ReviewGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-muted-foreground">
          No reviews yet
        </p>
        <p className="font-body text-muted-foreground mt-2">
          Check back soon for new book reviews!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {reviews.map((review, index) => (
        <div
          key={review.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ReviewCard
            id={review.id}
            slug={review.slug}
            title={review.title}
            bookTitle={review.book_title}
            bookAuthor={review.book_author}
            coverImage={review.cover_image}
            rating={review.rating}
            excerpt={review.content.substring(0, 150)}
            publishedAt={review.published_at}
          />
        </div>
      ))}
    </div>
  );
}
