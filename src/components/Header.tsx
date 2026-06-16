"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-text-primary"
      >
        AI Form Builder
      </Link>
      <div className="flex items-center gap-4">
        {session && (
          <button
            onClick={() => signOut()}
            className="rounded-full border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text transition-colors hover:bg-btn-secondary-hover"
          >
            Sign out
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
