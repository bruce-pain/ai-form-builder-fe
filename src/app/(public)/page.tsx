"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-text-primary">
        AI Form Builder
      </h1>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-text-primary">
            Welcome, {session.user?.email ?? "user"}
          </p>
          <Link
            href="/dashboard"
            className="rounded-lg bg-btn-primary px-6 py-3 text-base font-medium text-btn-primary-text hover:bg-btn-primary-hover"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-text hover:bg-btn-primary-hover"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
