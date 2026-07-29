"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ApiError } from "@/lib/api";
import { getFormClient, getFormResponsesClient } from "@/lib/form";
import type { FormResponseListItem } from "@/types/form";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function answerSnippet(answer: FormResponseListItem["answers"][number]): string {
  if (answer.answer_type === "text" && answer.text_answer) {
    return answer.text_answer;
  }
  if (
    answer.answer_type === "select" &&
    answer.select_answer &&
    answer.select_answer.length > 0
  ) {
    return answer.select_answer.join(", ");
  }
  return "(no answer)";
}

export default function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [responses, setResponses] = useState<FormResponseListItem[]>([]);

  useEffect(() => {
    if (!session?.accessToken) return;

    Promise.all([
      getFormClient(session.accessToken, id),
      getFormResponsesClient(session.accessToken, id),
    ])
      .then(([formRes, responsesRes]) => {
        setFormTitle(formRes.data.title);
        setResponses(responsesRes.data);
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load responses",
        );
      })
      .finally(() => setLoading(false));
  }, [session, id]);

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
      <div className="flex items-center border-b border-border bg-surface px-6 py-3">
        <Link
          href={`/forms/${id}`}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              {formTitle}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {responses.length}{" "}
              {responses.length === 1 ? "response" : "responses"}
            </p>
          </div>

          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-input py-20">
              <p className="text-lg text-text-secondary">No responses yet</p>
              <p className="mt-1 text-sm text-text-placeholder">
                Responses will appear here once users submit them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <Link
                  key={response.id}
                  href={`/forms/${id}/responses/${response.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition hover:bg-btn-secondary-hover"
                >
                  <p className="min-w-0 flex-1 truncate text-sm text-text-primary">
                    {response.answers.length > 0
                      ? answerSnippet(response.answers[0])
                      : "(empty response)"}
                  </p>
                  <span className="ml-4 shrink-0 text-xs text-text-placeholder">
                    {formatDate(response.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
