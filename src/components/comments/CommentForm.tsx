import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    if (!formData.author_name.trim() || !formData.content.trim()) {
      toast.error("Please fill in your name and comment");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      review_id: reviewId,
      author_name: formData.author_name.trim(),
      author_email: formData.author_email.trim() || null,
      content: formData.content.trim(),
    });

    if (error) {
      toast.error("Failed to submit comment. Please try again.");
      console.error("Comment error:", error);
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
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Submitting..." : "Post Comment"}
      </Button>
    </form>
  );
}
