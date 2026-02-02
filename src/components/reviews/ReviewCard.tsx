import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  id: string;
  slug: string;
  title: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage?: string | null;
  rating?: number | null;
  excerpt?: string;
  publishedAt?: string | null;
}

export function ReviewCard({
  slug,
  title,
  bookTitle,
  bookAuthor,
  coverImage,
  rating,
  publishedAt,
}: ReviewCardProps) {
  return (
    <Link
      to={`/review/${slug}`}
      className="group block"
    >
      <article className="space-y-3">
        {/* Cover Image */}
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-card group-hover:shadow-hover transition-shadow duration-300">
          {coverImage ? (
            <img
              src={coverImage}
              alt={`Cover of ${bookTitle}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="font-display text-4xl text-muted-foreground">
                {bookTitle.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {bookAuthor}
          </p>
          
          {rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < rating
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
