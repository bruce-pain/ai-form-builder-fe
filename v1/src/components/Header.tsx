"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="text-lg font-bold text-text-primary">
          AI Form Builder
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session && (
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="flex size-9 items-center justify-center rounded-full text-btn-secondary-text transition-colors hover:bg-btn-secondary-hover"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
