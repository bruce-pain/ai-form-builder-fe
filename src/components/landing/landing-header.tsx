"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "Showcase" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label="Formbrew home"
          className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <span className="font-display text-lg font-semibold tracking-tight">
            Formbrew
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthed && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
