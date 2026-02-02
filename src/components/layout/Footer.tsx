import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-body text-sm">
              © {currentYear} Zeeds Book Review. All rights reserved.
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/reviews"
              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Reviews
            </Link>
            <Link
              to="/about"
              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-body text-sm">Made with</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span className="font-body text-sm">for book lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
