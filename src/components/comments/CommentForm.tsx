import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/error-utils";
import { X } from "lucide-react";

interface CommentFormProps {
  reviewId: string;
  parentId?: string | null;
  replyingTo?: string | null;
  onCommentSubmitted?: () => void;
  onCancelReply?: () => void;
}

export function CommentForm({ reviewId, parentId = null, replyingTo, onCommentSubmitted, onCancelReply }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const authorName = formData.author_name.trim();
    const content = formData.content.trim();
    const authorEmail = formData.author_email.trim();
    
    if (!authorName || !content) {
      toast.error("Please fill in your name and comment");
      return;
    }
    
    if (authorName.length > 100) {
      toast.error("Name must be 100 characters or less");
      return;
    }
    
    if (content.length > 5000) {
      toast.error("Comment must be 5000 characters or less");
      return;
    }
    
    if (authorEmail && authorEmail.length > 255) {
      toast.error("Email must be 255 characters or less");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      review_id: reviewId,
      author_name: authorName,
      author_email: authorEmail || null,
      content: content,
      parent_id: parentId,
    });

    if (error) {
      toast.error(getSafeErrorMessage(error, "Failed to submit comment. Please try again."));
    } else {
      toast.success(parentId ? "Reply posted successfully!" : "Comment posted successfully!");
      setFormData({ author_name: "", author_email: "", content: "" });
      onCommentSubmitted?.();
    }

    setIsSubmitting(false);
  };

  const isReply = !!parentId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isReply && replyingTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
          <span>Replying to <span className="font-semibold text-foreground">{replyingTo}</span></span>
          {onCancelReply && (
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={onCancelReply}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`author_name_${parentId || 'root'}`} className="font-body">
            Name <span className="text-accent">*</span>
          </Label>
          <Input
            id={`author_name_${parentId || 'root'}`}
            value={formData.author_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, author_name: e.target.value }))
            }
            placeholder="Your name"
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`author_email_${parentId || 'root'}`} className="font-body">
            Email (optional)
          </Label>
          <Input
            id={`author_email_${parentId || 'root'}`}
            type="email"
            value={formData.author_email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, author_email: e.target.value }))
            }
            placeholder="your@email.com"
            maxLength={255}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`content_${parentId || 'root'}`} className="font-body">
          {isReply ? "Reply" : "Comment"} <span className="text-accent">*</span>
        </Label>
        <Textarea
          id={`content_${parentId || 'root'}`}
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder={isReply ? "Write your reply..." : "Share your thoughts..."}
          rows={isReply ? 3 : 4}
          maxLength={5000}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length}/5000 characters
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? "Submitting..." : isReply ? "Post Reply" : "Post Comment"}
        </Button>
        {isReply && onCancelReply && (
          <Button type="button" variant="outline" onClick={onCancelReply} className="w-full md:w-auto">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
