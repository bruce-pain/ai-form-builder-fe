"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
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
              title="Sign out"
              className="flex size-9 items-center justify-center rounded-full text-btn-secondary-text transition-colors hover:bg-btn-secondary-hover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
