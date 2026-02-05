import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSafeErrorMessage } from "@/lib/error-utils";

interface CommentFormProps {
  reviewId: string;
  onCommentSubmitted?: () => void;
}

export function CommentForm({ reviewId, onCommentSubmitted }: CommentFormProps) {
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
    
    // Client-side validation with length limits
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
    });

    if (error) {
      toast.error(getSafeErrorMessage(error, "Failed to submit comment. Please try again."));
    } else {
      toast.success("Comment submitted! It will appear after moderation.");
      setFormData({ author_name: "", author_email: "", content: "" });
      onCommentSubmitted?.();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author_name" className="font-body">
            Name <span className="text-accent">*</span>
          </Label>
          <Input
            id="author_name"
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
          <Label htmlFor="author_email" className="font-body">
            Email (optional)
          </Label>
          <Input
            id="author_email"
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
        <Label htmlFor="content" className="font-body">
          Comment <span className="text-accent">*</span>
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="Share your thoughts..."
          rows={4}
          maxLength={5000}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length}/5000 characters
        </p>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Submitting..." : "Post Comment"}
      </Button>
    </form>
  );
}
