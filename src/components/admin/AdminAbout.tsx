import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface AboutContent {
  id: string;
  title: string;
  content: string;
  profile_image: string | null;
}

export function AdminAbout() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const { data } = await supabase
      .from("about_page")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setAbout(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!about) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("about_page")
      .update({
        title: about.title,
        content: about.content,
        profile_image: about.profile_image,
      })
      .eq("id", about.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("About page saved!");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!about) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">About page not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display">About Page</CardTitle>
        <CardDescription className="font-body">
          Edit your about page content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="about_title" className="font-body">Title</Label>
          <Input
            id="about_title"
            value={about.title}
            onChange={(e) =>
              setAbout((prev) => prev ? { ...prev, title: e.target.value } : null)
            }
            placeholder="About Zeeds Book Review"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile_image" className="font-body">Profile Image URL</Label>
          <Input
            id="profile_image"
            value={about.profile_image || ""}
            onChange={(e) =>
              setAbout((prev) => prev ? { ...prev, profile_image: e.target.value || null } : null)
            }
            placeholder="https://example.com/profile.jpg"
          />
          {about.profile_image && (
            <div className="mt-2">
              <img
                src={about.profile_image}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_content" className="font-body">Content</Label>
          <Textarea
            id="about_content"
            value={about.content}
            onChange={(e) =>
              setAbout((prev) => prev ? { ...prev, content: e.target.value } : null)
            }
            placeholder="Write about yourself and your love of books..."
            rows={10}
          />
          <p className="text-xs text-muted-foreground">
            Use line breaks to separate paragraphs.
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save About Page"}
        </Button>
      </CardContent>
    </Card>
  );
}
