"use client";

import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="absolute right-8 top-8 z-10 flex items-center gap-4">
      {session && (
        <button
          onClick={() => signOut()}
          className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
        >
          Sign out
        </button>
      )}
      <ThemeToggle />
    </header>
  );
}
