import { User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground font-body text-center py-8">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="bg-card rounded-lg p-4 md:p-6 shadow-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-display font-semibold text-foreground">
                  {comment.author_name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="font-body text-foreground/90 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
