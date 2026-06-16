"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-text-primary">
          Log in
        </h1>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-text-primary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-border-input bg-input px-4 py-2 text-text-primary outline-none transition-colors focus:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-text-primary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-border-input bg-input px-4 py-2 text-text-primary outline-none transition-colors focus:border-gray-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-text hover:bg-btn-primary-hover"
        >
          Log in
        </button>

        <p className="text-center text-sm text-text-primary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
