"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <span className="text-sm font-medium uppercase tracking-[0.15em] text-text-placeholder">
          AI Form Builder
        </span>
        <h1 className="text-5xl font-heading text-text-primary leading-tight">
          Describe your form.
          <br />
          AI builds it. You refine it.
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          Keep the parts you like, change the rest, all through the same
          conversation.
        </p>
      </div>

      {session ? (
        <Link
          href="/dashboard"
          className="rounded-lg bg-btn-primary px-6 py-3 text-base font-medium text-btn-primary-text hover:bg-btn-primary-hover"
        >
          Go to dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-btn-primary px-6 py-3 text-base font-medium text-btn-primary-text hover:bg-btn-primary-hover"
        >
          Log in
        </Link>
      )}
    </div>
  );
}
