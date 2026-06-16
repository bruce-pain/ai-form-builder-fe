"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-700">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-black dark:text-white"
      >
        AI Form Builder
      </Link>
      <div className="flex items-center gap-4">
        {session && (
          <button
            onClick={() => signOut()}
            className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
          >
            Sign out
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
