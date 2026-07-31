"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";

import { AiPromptBar } from "@/components/AiPromptBar";
import { QuestionList } from "@/components/QuestionList";
import { SaveIndicator } from "@/components/SaveIndicator";
import { TitleCard } from "@/components/TitleCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ApiError } from "@/lib/api";
import { buildEditsSummary, type FormSnapshot } from "@/lib/editTracker";
import {
  createForm,
  deleteForm,
  generateQuestions,
  getForm,
  updateForm,
} from "@/lib/form";

import type { components } from "@/lib/api.types";

type FormQuestionInput = components["schemas"]["FormQuestionInput"];

interface FormEditorProps {
  token: string;
  formId?: string;
}

const TITLE_CARD_ID = "__title__";

export function FormEditor({ token, formId: initialFormId }: FormEditorProps) {
  const router = useRouter();
  const idCounter = useRef(1);

  function syncIdCounter(list: FormQuestionInput[]) {
    idCounter.current = list.reduce((max, q) => {
      const match = q.id.match(/\d+$/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 0);
  }

  function createBlankQuestion(): FormQuestionInput {
    idCounter.current += 1;
    return {
      id: `q${idCounter.current}`,
      text: "",
      answer_type: "text",
      answer_select_options: null,
      answer_select_multiple: null,
      required: false,
    };
  }

  function hasMinimumContent(): boolean {
    return (
      title.trim().length > 0 &&
      questions.some((q) => q.text.trim().length > 0)
    );
  }

  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<FormQuestionInput[]>([
    {
      id: "q1",
      text: "",
      answer_type: "text",
      answer_select_options: null,
      answer_select_multiple: null,
      required: false,
    },
  ]);
  const [activeCardId, setActiveCardId] = useState<string>(TITLE_CARD_ID);
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | undefined>(initialFormId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "unsaved" | "saving" | "saved" | null
  >(null);
  const [loading, setLoading] = useState(Boolean(initialFormId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const prevFormSnapshotRef = useRef<FormSnapshot>({
    title: "",
    description: "",
    questions: [],
  });
  const lastSavedRef = useRef("");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialFormId) return;
    lastSavedRef.current = JSON.stringify({ title, description, questions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialFormId) return;
    let cancelled = false;

    getForm(token, initialFormId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        if (data.is_published) {
          router.replace(`/forms/${data.id}`);
          return;
        }

        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions ?? []);
        setConversationId(data.conversation_id);
        setLoading(false);

        lastSavedRef.current = JSON.stringify({
          title: data.title,
          description: data.description ?? "",
          questions: data.questions ?? [],
        });

        if (data.conversation_id) {
          prevFormSnapshotRef.current = {
            title: data.title,
            description: data.description ?? "",
            questions: JSON.parse(JSON.stringify(data.questions ?? [])),
          };
        }

        syncIdCounter(data.questions ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load form",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, initialFormId, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const hasChanges = useCallback(() => {
    return (
      JSON.stringify({ title, description, questions }) !== lastSavedRef.current
    );
  }, [title, description, questions]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges, loading]);

  function handleTitleChange(value: string) {
    setTitle(value);
    setSaveStatus("unsaved");
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    setSaveStatus("unsaved");
  }

  function handleQuestionChange(index: number, updated: FormQuestionInput) {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
    setSaveStatus("unsaved");
  }

  function handleDeleteQuestion(index: number) {
    const wasActive = questions[index]?.id === activeCardId;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (wasActive) {
      setActiveCardId(
        questions[index + 1]?.id ?? questions[index - 1]?.id ?? TITLE_CARD_ID,
      );
    }
    setSaveStatus("unsaved");
  }

  function handleAddQuestion() {
    const question = createBlankQuestion();
    setQuestions((prev) => [...prev, question]);
    setActiveCardId(question.id);
    setSaveStatus("unsaved");
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || aiGenerating) return;

    setAiGenerating(true);
    try {
      const currentSnapshot: FormSnapshot = { title, description, questions };
      const editsSummary = buildEditsSummary(
        prevFormSnapshotRef.current,
        currentSnapshot,
      );
      const fullPrompt = editsSummary ? `${editsSummary}\n${prompt}` : prompt;

      const res = await generateQuestions(token, fullPrompt, conversationId, {
        title: title || null,
        description: description || null,
        questions: questions.filter((q) => q.text.trim()),
      });

      const generatedQuestions = res.data.questions;
      const nextTitle = res.data.title ?? title;
      const nextDescription = res.data.description ?? description;
      const newConversationId = res.conversation_id ?? null;

      setQuestions(generatedQuestions);
      syncIdCounter(generatedQuestions);
      setTitle(nextTitle);
      setDescription(nextDescription);
      setConversationId(newConversationId);
      setPrompt("");
      setSaveStatus("unsaved");

      prevFormSnapshotRef.current = {
        title: nextTitle,
        description: nextDescription,
        questions: JSON.parse(JSON.stringify(generatedQuestions)),
      };

      if (!formId) {
        try {
          const created = await createForm(token, {
            title: nextTitle,
            description: nextDescription || "",
            questions: generatedQuestions.filter((q) => q.text.trim()),
            conversation_id: newConversationId,
          });
          setFormId(created.data.id);
          lastSavedRef.current = JSON.stringify({
            title: nextTitle,
            description: nextDescription,
            questions: generatedQuestions,
          });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("unsaved");
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(60);
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Failed to generate questions. Please try again.",
        );
      }
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSave() {
    if (saving || publishing || aiGenerating) return;
    if (!hasMinimumContent()) {
      toast.error("Add a title and at least one question before saving.");
      return;
    }
    setSaving(true);
    setSaveStatus("saving");
    try {
      const questionsPayload =
        questions.length > 0 ? questions : null;
      if (formId) {
        await updateForm(token, formId, {
          title,
          description: description || null,
          questions: questionsPayload,
        });
      } else {
        const res = await createForm(token, {
          title,
            description: description || "",
          questions: questionsPayload,
          conversation_id: conversationId,
        });
        setFormId(res.data.id);
      }
      lastSavedRef.current = JSON.stringify({ title, description, questions });
      setSaveStatus("saved");
      toast.success("Form saved");
    } catch (err) {
      setSaveStatus("unsaved");
      toast.error(err instanceof ApiError ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (saving || publishing || aiGenerating) return;
    if (!hasMinimumContent()) {
      toast.error("Add a title and at least one question before publishing.");
      return;
    }
    setPublishing(true);
    try {
      const questionsPayload =
        questions.length > 0 ? questions : null;
      let targetId = formId;
      if (!targetId) {
        const res = await createForm(token, {
          title,
            description: description || "",
          questions: questionsPayload,
          conversation_id: conversationId,
        });
        targetId = res.data.id;
        setFormId(targetId);
      }
      await updateForm(token, targetId, {
        title,
        description: description || null,
        questions: questionsPayload,
        is_published: true,
      });
      lastSavedRef.current = JSON.stringify({ title, description, questions });
      setConfirmPublishOpen(false);
      setPublishedOpen(true);
      toast.success("Form published");
    } catch (err) {
      setConfirmPublishOpen(false);
      toast.error(
        err instanceof ApiError ? err.message : "Failed to publish form",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!formId || deleting) return;
    setDeleting(true);
    try {
      await deleteForm(token, formId);
      setDeleteOpen(false);
      toast.success("Form deleted");
      router.push("/dashboard");
    } catch (err) {
      setDeleteOpen(false);
      toast.error(
        err instanceof ApiError ? err.message : "Failed to delete form",
      );
      setDeleting(false);
    }
  }

  const publicLink =
    typeof window !== "undefined" && formId
      ? `${window.location.origin}/forms/public/${formId}`
      : "";

  async function handleCopy() {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-36">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            title="Back to dashboard"
          >
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>

          {saveStatus && <SaveIndicator status={saveStatus} />}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || publishing || aiGenerating}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
            <Button
              onClick={() => {
                if (!hasMinimumContent()) {
                  toast.error(
                    "Add a title and at least one question before publishing.",
                  );
                  return;
                }
                setConfirmPublishOpen(true);
              }}
              disabled={saving || publishing || aiGenerating}
            >
              Publish
            </Button>
            {formId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" title="More options">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <TitleCard
          active={activeCardId === TITLE_CARD_ID}
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onActivate={() => setActiveCardId(TITLE_CARD_ID)}
        />

        <QuestionList
          questions={questions}
          activeCardId={activeCardId === TITLE_CARD_ID ? null : activeCardId}
          onQuestionChange={handleQuestionChange}
          onDelete={handleDeleteQuestion}
          onAdd={handleAddQuestion}
          onActivate={setActiveCardId}
        />
      </div>

      <AiPromptBar
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleAiSubmit}
        loading={aiGenerating}
        disabled={cooldown > 0}
        rateLimitMessage={
          cooldown > 0
            ? `Too many requests. Try again in ${cooldown} seconds.`
            : undefined
        }
      />

      <AlertDialog
        open={confirmPublishOpen}
        onOpenChange={setConfirmPublishOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Publish form?</AlertDialogTitle>
            <AlertDialogDescription>
              This form will be publicly accessible and can no longer be
              edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={publishing}
              onClick={(e) => {
                e.preventDefault();
                handlePublish();
              }}
            >
              {publishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={publishedOpen} onOpenChange={() => {}}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Form published!</AlertDialogTitle>
            <AlertDialogDescription>
              Your form is live. Share the link with anyone you want to fill it
              out.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Button onClick={handleCopy} className="w-full">
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>

          <AlertDialogFooter>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild>
              <Link href={`/forms/${formId}`}>View form</Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form and all its responses. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
