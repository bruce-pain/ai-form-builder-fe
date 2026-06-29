"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ApiError } from "@/lib/api";
import { getFormClient, deleteFormClient } from "@/lib/form";

export default function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;

    getFormClient(session.accessToken, id)
      .then((res) => {
        const data = res.data;
        if (!data.is_published) {
          router.replace(`/forms/${id}/edit`);
          return;
        }
        setTitle(data.title);
        setDescription(data.description ?? "");
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load form",
        );
      })
      .finally(() => setLoading(false));
  }, [session, id]);

  async function handleDelete() {
    if (actionLoading || !session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    setActionLoading("delete");
    try {
      await deleteFormClient(session.accessToken, id);
      router.push("/dashboard");
    } catch (err) {
      console.error(
        err instanceof ApiError ? err.message : "Failed to delete form",
      );
      setActionLoading(null);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/forms/public/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-page">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-page">
        <p className="text-sm text-red-500">{loadError}</p>
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back to dashboard
        </Link>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Published
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/forms/${id}/responses`}
              className="rounded-lg border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
            >
              View Responses
            </Link>
            <Link
              href={`/forms/public/${id}`}
              className="rounded-lg border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
            >
              Preview
            </Link>
            <button
              onClick={handleShare}
              className="rounded-lg border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
            >
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading === "delete"}
              className="rounded-lg bg-btn-destructive-bg px-4 py-2 text-sm font-medium text-btn-destructive-text hover:bg-btn-destructive-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === "delete" ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
