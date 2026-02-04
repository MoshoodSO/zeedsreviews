import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Edit, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

interface PageContent {
  id: string;
  hero_title: string;
  hero_subtitle: string | null;
  contact_email: string;
  intro_text: string | null;
}

export function AdminZeedits() {
  const [services, setServices] = useState<Service[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [pageForm, setPageForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    contact_email: "",
    intro_text: "",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    image_url: "",
    display_order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [servicesRes, pageRes] = await Promise.all([
      supabase.from("zeedits_services").select("*").order("display_order"),
      supabase.from("zeedits_page").select("*").maybeSingle(),
    ]);

    if (servicesRes.data) setServices(servicesRes.data);
    if (pageRes.data) {
      setPageContent(pageRes.data);
      setPageForm({
        hero_title: pageRes.data.hero_title,
        hero_subtitle: pageRes.data.hero_subtitle || "",
        contact_email: pageRes.data.contact_email,
        intro_text: pageRes.data.intro_text || "",
      });
    }
    setIsLoading(false);
  };

  const savePageContent = async () => {
    if (!pageContent) return;

    const { error } = await supabase
      .from("zeedits_page")
      .update({
        hero_title: pageForm.hero_title,
        hero_subtitle: pageForm.hero_subtitle || null,
        contact_email: pageForm.contact_email,
        intro_text: pageForm.intro_text || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageContent.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Page content updated!");
      fetchData();
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      title: "",
      description: "",
      image_url: "",
      display_order: services.length + 1,
    });
    setEditingService(null);
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      image_url: service.image_url || "",
      display_order: service.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: serviceForm.title,
      description: serviceForm.description,
      image_url: serviceForm.image_url || null,
      display_order: serviceForm.display_order,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingService) {
      ({ error } = await supabase
        .from("zeedits_services")
        .update(data)
        .eq("id", editingService.id));
    } else {
      ({ error } = await supabase.from("zeedits_services").insert({
        ...data,
        display_order: services.length + 1,
      }));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingService ? "Service updated!" : "Service created!");
      setIsDialogOpen(false);
      resetServiceForm();
      fetchData();
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    const { error } = await supabase.from("zeedits_services").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Service deleted");
      fetchData();
    }
  };

  const moveService = async (service: Service, direction: "up" | "down") => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= services.length) return;

    const otherService = services[swapIndex];

    await Promise.all([
      supabase.from("zeedits_services").update({ display_order: otherService.display_order }).eq("id", service.id),
      supabase.from("zeedits_services").update({ display_order: service.display_order }).eq("id", otherService.id),
    ]);

    fetchData();
  };

  if (isLoading) {
    return <p className="text-center py-8 text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Page Content Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Page Settings</CardTitle>
          <CardDescription>Edit the Zeedits page hero and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={pageForm.hero_title}
                onChange={(e) => setPageForm(prev => ({ ...prev, hero_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={pageForm.contact_email}
                onChange={(e) => setPageForm(prev => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Input
              id="hero_subtitle"
              value={pageForm.hero_subtitle}
              onChange={(e) => setPageForm(prev => ({ ...prev, hero_subtitle: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro_text">Intro Text</Label>
            <Textarea
              id="intro_text"
              value={pageForm.intro_text}
              onChange={(e) => setPageForm(prev => ({ ...prev, intro_text: e.target.value }))}
              rows={3}
            />
          </div>
          <Button onClick={savePageContent}>
            <Save className="w-4 h-4 mr-2" />
            Save Page Settings
          </Button>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">Services</CardTitle>
            <CardDescription>Manage the editorial services offered</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetServiceForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingService ? "Edit Service" : "New Service"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Developmental Editing"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    required
                  />
                </div>
                <ImageUpload
                  value={serviceForm.image_url}
                  onChange={(url) => setServiceForm(prev => ({ ...prev, image_url: url }))}
                  folder="zeedits"
                  label="Service Image (optional)"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? "Update" : "Create"} Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No services yet. Add your first one!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveService(service, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveService(service, "down")}
                          disabled={index === services.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell>
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-muted-foreground text-sm">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteService(service.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
