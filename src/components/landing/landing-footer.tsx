import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

const FOOTER_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "Showcase" },
  { href: "#faq", label: "FAQ" },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg font-semibold tracking-tight">
            Formbrew
          </span>          <p className="text-sm text-muted-foreground">
            Create, publish, and collect from a sentence.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://ai-form-builder-be.onrender.com/v1/docs"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              API docs
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Formbrew
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            describe · brew · share
          </p>
        </div>
      </div>
    </footer>
  );
}
