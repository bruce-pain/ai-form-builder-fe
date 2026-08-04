"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/dashboard"
          className="text-base font-medium tracking-tight"
        >
          Formbrew
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
