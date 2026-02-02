import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-book.jpg";

interface AboutContent {
  title: string;
  content: string;
  profile_image: string | null;
}

const About = () => {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
          <Skeleton className="w-48 h-48 rounded-full mx-auto mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
            {about?.title || "About Zeeds Book Review"}
          </h1>

          {/* Profile Image */}
          <div className="mb-8 flex justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-soft border-4 border-primary/20">
              <img
                src={about?.profile_image || heroImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-left space-y-4">
            {(about?.content || "").split("\n").map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-lg text-foreground/90 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
