import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminReviews } from "@/components/admin/AdminReviews";
import { AdminComments } from "@/components/admin/AdminComments";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminAbout } from "@/components/admin/AdminAbout";
import { AdminZeedits } from "@/components/admin/AdminZeedits";
import { LogOut, BookOpen, MessageSquare, Settings, Folder, User, PenTool } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAdmin();
  const [stats, setStats] = useState({
    reviews: 0,
    comments: 0,
    categories: 0,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    const [reviewsRes, commentsRes, categoriesRes] = await Promise.all([
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      reviews: reviewsRes.count || 0,
      comments: commentsRes.count || 0,
      categories: categoriesRes.count || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Access Denied</CardTitle>
            <CardDescription className="font-body">
              You don't have admin privileges. Please contact the site administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold">
                  Z
                </div>
                <span className="font-display font-semibold hidden sm:inline">
                  Admin Dashboard
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-body hidden sm:inline">
                {user?.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.reviews}</p>
                  <p className="text-sm text-muted-foreground font-body">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.comments}</p>
                  <p className="text-sm text-muted-foreground font-body">Comments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Folder className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.categories}</p>
                  <p className="text-sm text-muted-foreground font-body">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-2">
            <TabsTrigger value="reviews" className="gap-2 font-body">
              <BookOpen className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2 font-body">
              <MessageSquare className="w-4 h-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 font-body">
              <Folder className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2 font-body">
              <User className="w-4 h-4" />
              About Page
            </TabsTrigger>
            <TabsTrigger value="zeedits" className="gap-2 font-body">
              <PenTool className="w-4 h-4" />
              Zeedits
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 font-body">
              <Settings className="w-4 h-4" />
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <AdminReviews />
          </TabsContent>
          <TabsContent value="comments">
            <AdminComments />
          </TabsContent>
          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="about">
            <AdminAbout />
          </TabsContent>
          <TabsContent value="zeedits">
            <AdminZeedits />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
