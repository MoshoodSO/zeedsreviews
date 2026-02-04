import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, BookOpen, Edit3, FileCheck, Search, Sparkles } from "lucide-react";

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

const serviceIcons: Record<string, React.ReactNode> = {
  "Developmental Editing": <BookOpen className="w-8 h-8" />,
  "Line Editing": <Edit3 className="w-8 h-8" />,
  "Copyediting": <FileCheck className="w-8 h-8" />,
  "Proofreading": <Search className="w-8 h-8" />,
  "Editorial Review": <Sparkles className="w-8 h-8" />,
};

export default function Zeedits() {
  const [services, setServices] = useState<Service[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [servicesRes, pageRes] = await Promise.all([
      supabase.from("zeedits_services").select("*").order("display_order"),
      supabase.from("zeedits_page").select("*").maybeSingle(),
    ]);

    if (servicesRes.data) setServices(servicesRes.data);
    if (pageRes.data) setPageContent(pageRes.data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            {pageContent?.hero_title || "Zeedits Editorial Services"}
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {pageContent?.hero_subtitle || "Professional editing services to help your manuscript shine"}
          </p>
          <a 
            href={`mailto:${pageContent?.contact_email || "zeeditseditorial@gmail.com"}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-body font-medium hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Get in Touch
          </a>
        </div>
      </section>

      {/* Intro Section */}
      {pageContent?.intro_text && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <p className="font-body text-lg text-center text-muted-foreground max-w-3xl mx-auto">
              {pageContent.intro_text}
            </p>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Our Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <Card key={service.id} className="shadow-card hover:shadow-hover transition-shadow overflow-hidden group">
                {service.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={service.image_url} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className={service.image_url ? "pt-6" : "pt-8"}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {serviceIcons[service.title] || <Edit3 className="w-6 h-6" />}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {service.title}
                    </h3>
                  </div>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Ready to Polish Your Manuscript?
          </h2>
          <p className="font-body text-muted-foreground mb-6 max-w-xl mx-auto">
            Contact us today to discuss your project and get a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={`mailto:${pageContent?.contact_email || "zeeditseditorial@gmail.com"}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-body font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {pageContent?.contact_email || "zeeditseditorial@gmail.com"}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
