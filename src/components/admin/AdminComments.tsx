import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getAdminErrorMessage } from "@/lib/error-utils";

interface Comment {
  id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  reviews?: { title: string } | null;
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, reviews(title)")
      .order("created_at", { ascending: false });

    if (data) setComments(data);
    setIsLoading(false);
  };

  const toggleApproval = async (comment: Comment) => {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: !comment.is_approved })
      .eq("id", comment.id);

    if (error) {
      toast.error(getAdminErrorMessage(error, "Failed to update comment status."));
    } else {
      toast.success(comment.is_approved ? "Comment hidden" : "Comment approved!");
      fetchComments();
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      toast.error(getAdminErrorMessage(error, "Failed to delete comment."));
    } else {
      toast.success("Comment deleted");
      fetchComments();
    }
  };

  const pendingCount = comments.filter((c) => !c.is_approved).length;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display">
          Comments
          {pendingCount > 0 && (
            <span className="ml-2 text-sm font-normal text-accent">
              ({pendingCount} pending)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comment.author_name}</p>
                        {comment.author_email && (
                          <p className="text-xs text-muted-foreground">
                            {comment.author_email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {comment.content}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {comment.reviews?.title || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          comment.is_approved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {comment.is_approved ? (
                          <>
                            <Check className="w-3 h-3" /> Approved
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Pending
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(comment.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApproval(comment)}
                          title={comment.is_approved ? "Hide" : "Approve"}
                        >
                          {comment.is_approved ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteComment(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
