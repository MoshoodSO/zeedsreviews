import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "",
    site_tagline: "",
    site_description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value");

    if (data) {
      const settingsObj: SiteSettings = {
        site_name: "",
        site_tagline: "",
        site_description: "",
      };
      data.forEach((item) => {
        if (item.key in settingsObj) {
          settingsObj[item.key as keyof SiteSettings] = item.value || "";
        }
      });
      setSettings(settingsObj);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.error("Failed to save some settings");
    } else {
      toast.success("Settings saved!");
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

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display">Site Settings</CardTitle>
        <CardDescription className="font-body">
          Configure your book review site's general information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site_name" className="font-body">Site Name</Label>
          <Input
            id="site_name"
            value={settings.site_name}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, site_name: e.target.value }))
            }
            placeholder="Zeeds Book Review"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_tagline" className="font-body">Tagline</Label>
          <Input
            id="site_tagline"
            value={settings.site_tagline}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, site_tagline: e.target.value }))
            }
            placeholder="Exploring the world through books"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description" className="font-body">Description</Label>
          <Input
            id="site_description"
            value={settings.site_description}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, site_description: e.target.value }))
            }
            placeholder="A curated collection of book reviews..."
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
