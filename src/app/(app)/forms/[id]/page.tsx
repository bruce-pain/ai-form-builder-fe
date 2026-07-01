"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ApiError } from "@/lib/api";
import { getFormClient, deleteFormClient, getFormResponsesClient } from "@/lib/form";
import type { FormResponseListItem, FormQuestion } from "@/types/form";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

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
  const [questions, setQuestions] = useState<FormQuestion[] | null>(null);
  const [responses, setResponses] = useState<FormResponseListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "individual">("summary");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;

    Promise.all([
      getFormClient(session.accessToken, id),
      getFormResponsesClient(session.accessToken, id),
    ])
      .then(([formRes, responsesRes]) => {
        const data = formRes.data;
        if (!data.is_published) {
          router.replace(`/forms/${id}/edit`);
          return;
        }
        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions);
        const sorted = [...responsesRes.data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setResponses(sorted);
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

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">Total Responses</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {responses.length}
            </p>
          </div>

          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-input py-20">
              <p className="text-lg text-text-secondary">No responses yet</p>
              <p className="mt-1 text-sm text-text-placeholder">
                Share your form to start collecting responses
              </p>
              <button
                onClick={handleShare}
                className="mt-4 rounded-lg border border-btn-secondary-border px-4 py-2 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-4 border-b border-border">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`border-b-2 px-1 pb-2 text-sm font-medium transition ${
                    activeTab === "summary"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("individual")}
                  className={`border-b-2 px-1 pb-2 text-sm font-medium transition ${
                    activeTab === "individual"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Individual
                </button>
              </div>
              <div className="mt-6">
                {activeTab === "summary" ? (
                  (() => {
                    const answersByQuestion: Record<string, { text: string }[]> = {};
                    for (const r of responses) {
                      for (const a of r.answers) {
                        if (!answersByQuestion[a.question_id]) {
                          answersByQuestion[a.question_id] = [];
                        }
                        const text =
                          a.answer_type === "text"
                            ? a.text_answer || "(no answer)"
                            : a.select_answer && a.select_answer.length > 0
                              ? a.select_answer.join(", ")
                              : "(no answer)";
                        answersByQuestion[a.question_id].push({ text });
                      }
                    }

                    return (
                      <div className="space-y-8">
                        {questions?.map((q) => {
                          const qAnswers = answersByQuestion[q.id];
                          if (!qAnswers || qAnswers.length === 0) return null;

                          const isExpanded = expandedQuestions.has(q.id);
                          const displayed = isExpanded ? qAnswers : qAnswers.slice(0, 10);

                          return (
                            <div key={q.id}>
                              <div className="mb-3">
                                <h3 className="font-medium text-text-primary">{q.text}</h3>
                                <p className="text-xs text-text-secondary">
                                  {q.answer_type === "select" ? "Select" : "Text"} &middot; {qAnswers.length} {qAnswers.length === 1 ? "answer" : "answers"}
                                </p>
                              </div>
                              <div className="divide-y divide-border bg-surface">
                                {displayed.map((a, i) => (
                                  <div
                                    key={i}
                                    className={`px-3 py-2 text-sm ${
                                      a.text === "(no answer)"
                                        ? "text-text-placeholder"
                                        : "text-text-primary"
                                    }`}
                                  >
                                    {a.text}
                                  </div>
                                ))}
                              </div>
                              {qAnswers.length > 10 && !isExpanded && (
                                <button
                                  onClick={() =>
                                    setExpandedQuestions((prev) => new Set(prev).add(q.id))
                                  }
                                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  + Show all {qAnswers.length} answers
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (() => {
                  const response = responses[currentIndex];
                  if (!response) return null;

                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary">
                          Response {currentIndex + 1} of {responses.length}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(currentIndex - 1)}
                            className="rounded-lg border border-btn-secondary-border px-3 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            &larr; Prev
                          </button>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-text-secondary">Go to:</span>
                            <input
                              type="number"
                              min={1}
                              max={responses.length}
                              defaultValue={currentIndex + 1}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = parseInt(e.currentTarget.value, 10);
                                  if (val >= 1 && val <= responses.length) {
                                    setCurrentIndex(val - 1);
                                  }
                                }
                              }}
                              className="w-16 rounded-lg border border-border px-2 py-1 text-sm text-text-primary"
                            />
                          </div>
                          <button
                            disabled={currentIndex === responses.length - 1}
                            onClick={() => setCurrentIndex(currentIndex + 1)}
                            className="rounded-lg border border-btn-secondary-border px-3 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-text-secondary">
                        Submitted {formatDate(response.created_at)}
                      </p>

                      <div className="mt-6 space-y-4">
                        {response.answers.map((answer) => {
                          const question = questions?.find(
                            (q) => q.id === answer.question_id,
                          );
                          return (
                            <div
                              key={answer.question_id}
                              className="rounded-xl border border-border bg-surface p-4"
                            >
                              <p className="text-sm font-medium text-text-primary">
                                {question?.text || "(Unknown question)"}
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
