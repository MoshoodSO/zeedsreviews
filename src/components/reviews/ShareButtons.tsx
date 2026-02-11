import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: Share2,
      href: `https://www.instagram.com/`,
      copyOnly: true,
    },
  ];

  const handleShare = (link: typeof links[0]) => {
    if (link.copyOnly) {
      navigator.clipboard.writeText(url);
      window.open(link.href, "_blank", "noopener,noreferrer");
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
