"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ApiError } from "@/lib/api";
import { getFormClient, getFormResponseClient } from "@/lib/form";
import type { FormResponseListItem, FormQuestion } from "@/types/form";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function questionLabel(
  questions: FormQuestion[] | null | undefined,
  questionId: string,
): string {
  const q = questions?.find((q) => q.id === questionId);
  return q?.text ?? "(Unknown question)";
}

export default function FormResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; response_id: string }>;
}) {
  const { id, response_id } = use(params);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[] | null>(null);
  const [response, setResponse] = useState<FormResponseListItem | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    Promise.all([
      getFormClient(session.accessToken, id),
      getFormResponseClient(session.accessToken, id, response_id),
    ])
      .then(([formRes, responseRes]) => {
        setFormTitle(formRes.data.title);
        setQuestions(formRes.data.questions);
        setResponse(responseRes.data);
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load response",
        );
      })
      .finally(() => setLoading(false));
  }, [session, id, response_id]);

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
          href={`/forms/${id}/responses`}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          &larr; Back
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              {formTitle}
            </h1>
            {response && (
              <p className="mt-1 text-sm text-text-secondary">
                Submitted {formatDate(response.created_at)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {response?.answers.map((answer) => (
              <div
                key={answer.question_id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="text-sm font-medium text-text-primary">
                  {questionLabel(questions, answer.question_id)}
                </p>
                <div className="mt-2">
                  {answer.answer_type === "text" ? (
                    <p className="text-sm text-text-secondary">
                      {answer.text_answer || "(no answer)"}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {answer.select_answer &&
                      answer.select_answer.length > 0 ? (
                        answer.select_answer.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          >
                            {option}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-text-secondary">
                          (no answer)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
