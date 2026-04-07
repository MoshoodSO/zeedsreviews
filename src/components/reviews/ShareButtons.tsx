import { Facebook, Twitter, Linkedin, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string | null;
  slug?: string;
}

export function ShareButtons({ url, title, description = "", image, slug }: ShareButtonsProps) {
  // Use the OG proxy for social platforms so crawlers see the book cover image,
  // but the proxy auto-redirects humans to the real page URL
  const shareUrl = slug
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-review?slug=${encodeURIComponent(slug)}`
    : url;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const whatsappText = encodeURIComponent(`${title}\n\n${description.substring(0, 200)}\n\n${shareUrl}`);

  const links = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedTitle}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${whatsappText}`,
    },
    {
      name: "Instagram",
      icon: Share2,
      copyOnly: true,
    },
  ];

  const handleShare = (link: typeof links[0]) => {
    if (link.copyOnly) {
      navigator.clipboard.writeText(`${title}\n\n${description}\n\n${url}`);
      toast.success("Review link & details copied! Paste it on Instagram.");
      return;
    }
    window.open(link.href, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-sm text-muted-foreground">Share:</span>
      {links.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleShare(link)}
          title={`Share on ${link.name}`}
        >
          <link.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
