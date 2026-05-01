import { useState } from "react";
import { User, Calendar, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./CommentForm";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

interface CommentListProps {
  comments: Comment[];
  reviewId: string;
  onCommentSubmitted?: () => void;
}

export function CommentList({ comments, reviewId, onCommentSubmitted }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground font-body text-center py-8">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <article
      key={comment.id}
      className={`bg-card rounded-lg p-4 md:p-6 shadow-card ${isReply ? "ml-8 md:ml-12 border-l-2 border-primary/20" : ""}`}
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
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-muted-foreground hover:text-primary gap-1 px-2 h-8"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="w-4 h-4" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="mt-4 ml-14">
          <CommentForm
            reviewId={reviewId}
            parentId={comment.id}
            replyingTo={comment.author_name}
            onCommentSubmitted={() => {
              setReplyingTo(null);
              onCommentSubmitted?.();
            }}
            onCancelReply={() => setReplyingTo(null)}
          />
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-6">
      {topLevelComments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          {renderComment(comment)}
          {getReplies(comment.id).map((reply) => renderComment(reply, true))}
        </div>
      ))}
    </div>
  );
}
