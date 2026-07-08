"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QuestionCard } from "@/components/QuestionCard";
import { AiPromptBar } from "@/components/AiPromptBar";
import { Toast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import { createFormClient, generateQuestionsClient, updateFormClient } from "@/lib/form";
import type { FormQuestion } from "@/types/form";
import { ArrowLeft, Loader, Save, Plus } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const prevFormSnapshotRef = useRef<FormSnapshot>({ title: "", description: "", questions: [] });
  const lastSavedRef = useRef<string>("");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");
  const autoSavedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function hasChanges(): boolean {
    return JSON.stringify({ title, description, questions }) !== lastSavedRef.current;
  }

  function hasMinimumContent(): boolean {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      questions.some(q => q.text.trim().length > 0)
    );
  }

  function scheduleAutoSave() {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!hasMinimumContent()) {
      setAutoSaveStatus("idle");
      return;
    }
    autoSaveTimerRef.current = setTimeout(performAutoSave, 3000);
  }

  async function performAutoSave() {
    if (saving || aiGenerating || !session?.accessToken || !hasChanges() || !hasMinimumContent()) {
      if (hasChanges()) scheduleAutoSave();
      return;
    }

    setAutoSaveStatus("saving");
    setSaving(true);
    try {
      if (formId) {
        await updateFormClient(session.accessToken, formId, {
          title,
          description: description || "No description",
          questions,
        });
      } else {
        const res = await createFormClient(session.accessToken, {
          title,
          description: description || "No description",
          questions,
          conversation_id: conversationId,
        });
        setFormId(res.data.id);
      }
      lastSavedRef.current = JSON.stringify({ title, description, questions });
      setAutoSaveStatus("saved");
      if (autoSavedStatusTimerRef.current) clearTimeout(autoSavedStatusTimerRef.current);
      autoSavedStatusTimerRef.current = setTimeout(() => {
        setAutoSaveStatus((s) => (s === "saved" ? "idle" : s));
      }, 3000);
    } catch {
      setAutoSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    lastSavedRef.current = JSON.stringify({ title, description, questions });
  }, []);

  useEffect(() => {
    if (hasChanges()) {
      if (hasMinimumContent()) {
        setAutoSaveStatus("unsaved");
        scheduleAutoSave();
      } else {
        setAutoSaveStatus("idle");
      }
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, description, questions]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [title, description, questions]);

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
      const currentSnapshot: FormSnapshot = {
        title,
        description,
        questions,
      };
      const editsSummary = buildEditsSummary(prevFormSnapshotRef.current, currentSnapshot);
      const fullPrompt = editsSummary ? editsSummary + "\n" + prompt : prompt;

      const res = await generateQuestionsClient(
        session.accessToken,
        fullPrompt,
        conversationId,
        {
          title: title || null,
          description: description || null,
          questions: questions.filter(q => q.text.trim()),
        },
      );
      setQuestions(res.data.questions);
      if (res.data.title !== undefined) setTitle(res.data.title ?? "");
      if (res.data.description !== undefined) setDescription(res.data.description ?? "");
      const newConversationId = res.conversation_id ?? null;
      setConversationId(newConversationId);
      if (newConversationId) {
        if (!conversationId) {
          try {
            const created = await createFormClient(session.accessToken, {
              title: res.data.title ?? title,
              description: (res.data.description ?? description) || "No description",
              questions: res.data.questions.filter(q => q.text.trim()),
              conversation_id: newConversationId,
            });
            setFormId(created.data.id);
          } catch {
            // Auto-save failed; formId stays null so it retries next generation
          }
        }
      }
      lastSavedRef.current = JSON.stringify({
        title: res.data.title ?? title,
        description: res.data.description ?? description,
        questions: res.data.questions,
      });
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
    if (saving) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaving(true);
    setSaveError(null);

    const hasQuestions = questions.some((q) => q.text.trim());

    try {
      if (!session?.accessToken) {
        throw new Error("Not authenticated");
      }
      if (formId) {
        await updateFormClient(session.accessToken, formId, {
          title,
          description: description || "No description",
          questions: hasQuestions ? questions : null,
        });
      } else {
        await createFormClient(session.accessToken, {
          title,
          description: description || "No description",
          questions: hasQuestions ? questions : null,
          conversation_id: conversationId,
        });
      }
      lastSavedRef.current = JSON.stringify({ title, description, questions });
      router.push("/dashboard");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
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
            <div className="ml-auto flex items-center gap-2">
              {autoSaveStatus === "unsaved" && (
                <span className="text-xs text-text-placeholder">Unsaved</span>
              )}
              {autoSaveStatus === "saving" && (
                <span className="inline-flex items-center gap-1 text-xs text-text-placeholder">
                  <Loader size={12} className="animate-spin" />
                  Saving…
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
              )}
              {autoSaveStatus === "error" && (
                <span className="text-xs text-amber-600 dark:text-amber-400">Save failed</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                title="Save"
                className="rounded-md p-1.5 text-btn-secondary-text hover:bg-btn-secondary-hover disabled:opacity-50"
              >
                <Save size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <EditableField
              value={title}
              onChange={setTitle}
              isTextarea
              className="text-2xl font-bold font-heading text-text-primary"
              inputClassName="w-full text-2xl font-bold font-heading text-text-primary bg-transparent border-b border-border focus:outline-none resize-none py-0.5"
              placeholder="Form title"
            />
            <EditableField
              value={description}
              onChange={setDescription}
              isTextarea
              className="w-full text-sm text-text-secondary"
              inputClassName="w-full text-sm text-text-secondary bg-transparent border-b border-border focus:outline-none resize-none py-0.5"
              placeholder="Form description (optional)"
            />
          </div>

          <>
            <div>
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  questionIndex={index}
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
              <Plus size={14} />
              Add question
            </button>
          </>
        </div>
      </div>

      <AiPromptBar value={prompt} onChange={setPrompt} onSubmit={handleAiSubmit} loading={aiGenerating} disabled={cooldown > 0} />
    </div>
  );
}
