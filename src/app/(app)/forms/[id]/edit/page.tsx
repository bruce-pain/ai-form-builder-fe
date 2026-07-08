"use client";

import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QuestionCard } from "@/components/QuestionCard";
import { FormPreview } from "@/components/FormPreview";
import { AiPromptBar } from "@/components/AiPromptBar";
import { Toast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import {
  getFormClient,
  updateFormClient,
  deleteFormClient,
  generateQuestionsClient,
} from "@/lib/form";
import type { FormQuestion } from "@/types/form";
import { ArrowLeft, Eye, Pencil, Save, MoreVertical, Upload, Trash2, Plus } from "lucide-react";
import { buildEditsSummary, type FormSnapshot } from "@/lib/editTracker";

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
      {value || <span className="text-text-placeholder">{placeholder}</span>}
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
  const prevFormSnapshotRef = useRef<FormSnapshot>({
    title: "",
    description: "",
    questions: [],
  });

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
  const [cooldown, setCooldown] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setSaveError(null);
          return 0;
        }
        setSaveError(`Too many requests. Try again in ${prev - 1} seconds.`);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.accessToken) return;

    getFormClient(session.accessToken, id)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions ?? []);
        setIsPublished(data.is_published);

        setConversationId(data.conversation_id);

        if (data.conversation_id) {
          prevFormSnapshotRef.current = {
            title: data.title,
            description: data.description ?? "",
            questions: JSON.parse(JSON.stringify(data.questions ?? [])),
          };
        }

        if (data.questions && data.questions.length > 0) {
          idCounter.current = Math.max(
            ...data.questions.map((q) => parseInt(q.id, 10)),
          );
        }
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load form",
        );
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

  function deleteQuestion(index: number) {
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
      const currentSnapshot: FormSnapshot = {
        title,
        description,
        questions,
      };
      const editsSummary = buildEditsSummary(
        prevFormSnapshotRef.current,
        currentSnapshot,
      );
      const fullPrompt = editsSummary ? editsSummary + "\n" + prompt : prompt;

      const res = await generateQuestionsClient(
        session.accessToken,
        fullPrompt,
        conversationId,
        {
          title: title || null,
          description: description || null,
          questions: questions.filter((q) => q.text.trim()),
        },
      );
      setQuestions(res.data.questions);
      if (res.data.title !== undefined) setTitle(res.data.title ?? "");
      if (res.data.description !== undefined)
        setDescription(res.data.description ?? "");
      setConversationId(res.conversation_id ?? null);
      prevFormSnapshotRef.current = {
        title: res.data.title ?? "",
        description: res.data.description ?? "",
        questions: JSON.parse(JSON.stringify(res.data.questions)),
      };
      setPrompt("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(60);
        setSaveError("Too many requests. Try again in 60 seconds.");
      } else {
        setSaveError("Failed to generate questions. Please try again.");
      }
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSave() {
    if (saving || !session?.accessToken) return;
    setSaving(true);
    setSaveError(null);

    try {
      await updateFormClient(session.accessToken, id, {
        title,
        description: description || null,
        questions: questions.length > 0 ? questions : null,
        is_published: false,
      });
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to save form",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (saving || !session?.accessToken) return;
    if (!window.confirm("Publish this form? It will be publicly accessible."))
      return;
    setSaving(true);
    setSaveError(null);

    try {
      await updateFormClient(session.accessToken, id, {
        title,
        description: description || null,
        questions: questions.length > 0 ? questions : null,
        is_published: true,
      });
      router.push("/dashboard");
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to publish form",
      );
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!session?.accessToken) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this form? This action cannot be undone.",
      )
    )
      return;

    try {
      await deleteFormClient(session.accessToken, id);
      router.push("/dashboard");
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to delete form",
      );
    }
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
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="mx-auto max-w-2xl space-y-6">
          {saveError && (
            <Toast message={saveError} onDismiss={() => setSaveError(null)} />
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              title="Back to dashboard"
              className="rounded-md p-1.5 text-text-secondary hover:bg-btn-secondary-hover"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                title={isPreview ? "Edit" : "Preview"}
                className="rounded-md p-1.5 text-btn-secondary-text hover:bg-btn-secondary-hover"
              >
                {isPreview ? (
                  <Pencil size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                title="Save"
                className="rounded-md p-1.5 text-btn-secondary-text hover:bg-btn-secondary-hover disabled:opacity-50"
              >
                <Save size={16} />
              </button>
              <div ref={menuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  title="More"
                  className="rounded-md p-1.5 text-text-secondary hover:bg-btn-secondary-hover"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-border bg-page py-1 text-sm shadow-sm">
                    <button
                      onClick={() => {
                        handlePublish();
                        setMenuOpen(false);
                      }}
                      disabled={saving}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-text-primary hover:bg-btn-secondary-hover disabled:opacity-50"
                    >
                      <Upload size={14} />
                      Publish
                    </button>
                    <hr className="mx-3 border-t border-border" />
                    <button
                      onClick={() => {
                        handleDelete();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isPreview && (
            <div className="space-y-3">
              <EditableField
                value={title}
                onChange={setTitle}
                isTextarea
                className="text-2xl font-bold font-heading text-text-primary"
                inputClassName="w-full text-2xl font-bold font-heading text-text-primary bg-transparent border-b-2 border-border-input focus:outline-none resize-none py-0.5"
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
              <div>
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    questionIndex={index}
                    question={question}
                    onChange={(updated) => handleQuestionChange(index, updated)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
              </div>

              <button
                onClick={handleAdd}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
              >
                <Plus size={14} />
                Add question
              </button>
            </>
          )}
        </div>
      </div>

      {!isPreview && (
        <AiPromptBar
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleAiSubmit}
          loading={aiGenerating}
          disabled={cooldown > 0}
        />
      )}
    </div>
  );
}
