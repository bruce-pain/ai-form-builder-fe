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
    <div className="flex min-h-screen items-center justify-center bg-white p-8 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Log in
        </h1>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-black dark:text-white"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-black/20 bg-transparent px-4 py-2 text-black outline-none transition-colors focus:border-black dark:border-white/30 dark:text-white dark:focus:border-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-black dark:text-white"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-black/20 bg-transparent px-4 py-2 text-black outline-none transition-colors focus:border-black dark:border-white/30 dark:text-white dark:focus:border-white"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          className="rounded-full bg-black py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          Log in
        </button>

        <p className="text-center text-sm text-black dark:text-white">
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
