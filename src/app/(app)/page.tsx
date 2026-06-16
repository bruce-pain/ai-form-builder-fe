"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white p-8 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-black dark:text-white">
        AI Form Builder
      </h1>

      {session ? (
        <p className="text-black dark:text-white">
          Welcome, {session.user?.email ?? "user"}
        </p>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-medium text-black dark:border-white/30 dark:text-white"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
