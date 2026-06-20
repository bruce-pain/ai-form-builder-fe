"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QuestionCard } from "@/components/QuestionCard";
import { FormPreview } from "@/components/FormPreview";
import { AiPromptBar } from "@/components/AiPromptBar";
import { ApiError } from "@/lib/api";
import { getFormClient, updateFormClient, generateQuestionsClient } from "@/lib/form";
import type { FormQuestion } from "@/types/form";

function EditableField({
  value,
  onChange,
  isTextarea,
  className,
  inputClassName,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  isTextarea?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (editing) {
    return isTextarea ? (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
        className={inputClassName}
      />
    ) : (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        className={inputClassName}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`cursor-pointer ${className}`}
    >
      {value || (
        <span className="text-text-placeholder">
          {placeholder}
        </span>
      )}
    </div>
  );
}

export default function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const idCounter = useRef(0);

  function createBlankQuestion(): FormQuestion {
    idCounter.current += 1;
    return {
      id: String(idCounter.current),
      text: "",
      answer_type: "text",
      answer_select_options: null,
      answer_select_multiple: null,
      required: false,
    };
  }

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;

    getFormClient(session.accessToken, id)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions ?? []);
        setIsPublished(data.is_published);
        if (data.is_published) {
          setIsPreview(true);
        }

        if (data.questions && data.questions.length > 0) {
          idCounter.current = Math.max(
            ...data.questions.map((q) => parseInt(q.id, 10)),
          );
        }
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load form");
      })
      .finally(() => setLoading(false));
  }, [session, id]);

  function handleQuestionChange(index: number, updated: FormQuestion) {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  }

  function handleDelete(index: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    setQuestions((prev) => [...prev, createBlankQuestion()]);
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || aiGenerating) return;

    if (!session?.accessToken) return;

    setAiGenerating(true);
    try {
      const res = await generateQuestionsClient(session.accessToken, prompt);
      setQuestions(res.data.questions);
      setPrompt("");
    } catch {
      setSaveError("Failed to generate questions");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      if (!session?.accessToken) {
        throw new Error("Not authenticated");
      }
      await updateFormClient(session.accessToken, id, {
        title,
        description: description || null,
        questions: questions.length > 0 ? questions : null,
        is_published: isPublished,
      });
      router.push("/dashboard");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  const isReadOnly = isPublished;

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
        <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary">
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
        {isReadOnly ? (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Published
          </span>
        ) : (
          <div className="flex items-center gap-3">
            {saveError && (
              <span className="text-sm text-red-500">{saveError}</span>
            )}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="rounded-lg border border-btn-secondary-border px-4 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover"
            >
              {isPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg border border-btn-secondary-border px-4 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {isReadOnly ? (
            <FormPreview
              questions={questions}
              title={title}
              description={description}
            />
          ) : (
            <>
              {!isPreview && (
                <div className="space-y-3">
                  <EditableField
                    value={title}
                    onChange={setTitle}
                    className="text-2xl font-bold text-text-primary"
                    inputClassName="w-full text-2xl font-bold text-text-primary bg-transparent border-b-2 border-border-input focus:outline-none py-0.5"
                    placeholder="Form title"
                  />
                  <EditableField
                    value={description}
                    onChange={setDescription}
                    isTextarea
                    className="w-full text-sm text-text-secondary"
                    inputClassName="w-full text-sm text-text-secondary bg-transparent border-b-2 border-border-input focus:outline-none resize-none py-0.5"
                    placeholder="Form description (optional)"
                  />
                </div>
              )}
              {isPreview ? (
                <FormPreview
                  questions={questions}
                  title={title}
                  description={description}
                />
              ) : (
                <>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onChange={(updated) => handleQuestionChange(index, updated)}
                        onDelete={() => handleDelete(index)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add question
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {!isPreview && !isReadOnly && (
        <AiPromptBar value={prompt} onChange={setPrompt} onSubmit={handleAiSubmit} loading={aiGenerating} />
      )}
    </div>
  );
}
