"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QuestionCard } from "@/components/QuestionCard";
import { ApiError } from "@/lib/api";
import { createFormClient } from "@/lib/form";
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

const MOCK_QUESTIONS: FormQuestion[] = [
  {
    id: "1",
    text: "What is your full name?",
    answer_type: "text",
    answer_select_options: null,
    answer_select_multiple: null,
    required: true,
  },
  {
    id: "2",
    text: "How did you hear about us?",
    answer_type: "select",
    answer_select_options: ["Social Media", "Friend", "Search Engine", "Other"],
    answer_select_multiple: false,
    required: true,
  },
  {
    id: "3",
    text: "Which features interest you?",
    answer_type: "select",
    answer_select_options: ["Pricing", "Integrations", "Support", "Mobile App"],
    answer_select_multiple: true,
    required: false,
  },
];

export default function NewFormPage() {
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

  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([
    createBlankQuestion(),
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setQuestions(MOCK_QUESTIONS);
    setPrompt("");
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    const hasQuestions = questions.some((q) => q.text.trim());

    try {
      if (!session?.accessToken) {
        throw new Error("Not authenticated");
      }
      await createFormClient(session.accessToken, {
        title,
        description: description || "No description",
        questions: hasQuestions ? questions : null,
      });
      router.push("/dashboard");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-sm text-red-500">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-btn-secondary-border px-4 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
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
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
        <form
          onSubmit={handleAiSubmit}
          className="mx-auto flex max-w-2xl gap-3"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your form..."
            className="flex-1 rounded-lg border border-border-input bg-input px-4 py-2.5 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="rounded-lg border border-btn-secondary-border px-4 py-2.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
