"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QuestionCard } from "@/components/QuestionCard";
import { FormPreview } from "@/components/FormPreview";
import { AiPromptBar } from "@/components/AiPromptBar";
import { ApiError } from "@/lib/api";
import { createFormClient, generateQuestionsClient } from "@/lib/form";
import type { FormQuestion } from "@/types/form";
import { buildEditsSummary } from "@/lib/editTracker";

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
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const prevQuestionsRef = useRef<FormQuestion[]>([]);

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

  async function handleAiSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prompt.trim() || aiGenerating) return;

    if (!session?.accessToken) return;

    setAiGenerating(true);
    try {
      const editsSummary = buildEditsSummary(prevQuestionsRef.current, questions);
      const fullPrompt = editsSummary ? editsSummary + "\n" + prompt : prompt;

      const res = await generateQuestionsClient(
        session.accessToken,
        fullPrompt,
        conversationId,
        { questions: questions.filter(q => q.text.trim()) },
      );
      setQuestions(res.data.questions);
      setConversationId(res.conversation_id ?? null);
      prevQuestionsRef.current = JSON.parse(JSON.stringify(res.data.questions));
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

    const hasQuestions = questions.some((q) => q.text.trim());

    try {
      if (!session?.accessToken) {
        throw new Error("Not authenticated");
      }
      await createFormClient(session.accessToken, {
        title,
        description: description || "No description",
        questions: hasQuestions ? questions : null,
        conversation_id: conversationId,
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
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
        </div>
      </div>

      {!isPreview && (
        <AiPromptBar value={prompt} onChange={setPrompt} onSubmit={handleAiSubmit} loading={aiGenerating} />
      )}
    </div>
  );
}
