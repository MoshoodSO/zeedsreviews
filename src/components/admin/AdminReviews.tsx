import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getAdminErrorMessage } from "@/lib/error-utils";

interface Review {
  id: string;
  title: string;
  slug: string;
  book_title: string;
  book_author: string;
  author_name: string;
  cover_image: string | null;
  content: string;
  rating: number | null;
  category_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    book_title: "",
    book_author: "",
    author_name: "Zeeds",
    cover_image: "",
    content: "",
    rating: 5,
    category_id: "",
    is_published: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [reviewsRes, categoriesRes] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);

    if (reviewsRes.data) setReviews(reviewsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      book_title: "",
      book_author: "",
      author_name: "Zeeds",
      cover_image: "",
      content: "",
      rating: 5,
      category_id: "",
      is_published: false,
    });
    setEditingReview(null);
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      title: review.title,
      slug: review.slug,
      book_title: review.book_title,
      book_author: review.book_author,
      author_name: review.author_name,
      cover_image: review.cover_image || "",
      content: review.content,
      rating: review.rating || 5,
      category_id: review.category_id || "",
      is_published: review.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || generateSlug(formData.title);
    const data = {
      ...formData,
      slug,
      cover_image: formData.cover_image || null,
      category_id: formData.category_id || null,
      published_at: formData.is_published ? new Date().toISOString() : null,
    };

    let error;
    if (editingReview) {
      ({ error } = await supabase
        .from("reviews")
        .update(data)
        .eq("id", editingReview.id));
    } else {
      ({ error } = await supabase.from("reviews").insert(data));
    }

    if (error) {
      toast.error(getAdminErrorMessage(error, "Failed to save review."));
    } else {
      toast.success(editingReview ? "Review updated!" : "Review created!");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    }
  };

  const togglePublish = async (review: Review) => {
    const { error } = await supabase
      .from("reviews")
      .update({
        is_published: !review.is_published,
        published_at: !review.is_published ? new Date().toISOString() : null,
      })
      .eq("id", review.id);

    if (error) {
      toast.error(getAdminErrorMessage(error, "Failed to update review status."));
    } else {
      toast.success(review.is_published ? "Review unpublished" : "Review published!");
      fetchData();
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast.error(getAdminErrorMessage(error, "Failed to delete review."));
    } else {
      toast.success("Review deleted");
      fetchData();
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">Book Reviews</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingReview ? "Edit Review" : "New Review"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Review Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Review of..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-from-title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book_title">Book Title</Label>
                  <Input
                    id="book_title"
                    value={formData.book_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, book_title: e.target.value }))}
                    placeholder="The Great Gatsby"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book_author">Book Author</Label>
                  <Input
                    id="book_author"
                    value={formData.book_author}
                    onChange={(e) => setFormData(prev => ({ ...prev, book_author: e.target.value }))}
                    placeholder="F. Scott Fitzgerald"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author_name">Reviewer Name</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                    placeholder="Zeeds"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
                folder="book-covers"
                label="Book Cover Image"
              />
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5 stars)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Review Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your review..."
                  rows={8}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReview ? "Update" : "Create"} Review
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No reviews yet. Create your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {review.book_title}
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {Array.from({ length: review.rating || 0 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        review.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {review.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {review.is_published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(review)}
                          title={review.is_published ? "Unpublish" : "Publish"}
                        >
                          {review.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(review)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReview(review.id)}
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
