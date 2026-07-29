"use client";

import { useState, useEffect, use } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPublicForm, submitFormResponse } from "@/lib/form";
import { ApiError } from "@/lib/api";
import type { FormQuestion } from "@/types/form";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stage, setStage] = useState<"start" | "question" | "end">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shakeErrors, setShakeErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getPublicForm(id)
      .then((res) => {
        const data = res.data;
        setFormTitle(data.title);
        setFormDescription(data.description ?? "");
        setQuestions(data.questions ?? []);
      })
      .catch((err) => {
        setLoadError(
          err instanceof ApiError ? err.message : "Failed to load form",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleTextChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    clearQuestionError(questionId);
  }

  function handleRadioChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    clearQuestionError(questionId);
  }

  function handleCheckboxChange(
    questionId: string,
    option: string,
    checked: boolean,
  ) {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked
        ? [...current, option]
        : current.filter((o) => o !== option);
      return { ...prev, [questionId]: next };
    });
    clearQuestionError(questionId);
  }

  function clearQuestionError(questionId: string) {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setShakeErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }

  function validateCurrent(): boolean {
    const q = questions[currentIndex];
    if (!q.required) return true;
    const answer = answers[q.id];
    if (answer === undefined || answer === null) {
      setErrors((prev) => ({ ...prev, [q.id]: "This field is required" }));
      setShakeErrors((prev) => ({ ...prev, [q.id]: true }));
      return false;
    }
    if (typeof answer === "string" && !answer.trim()) {
      setErrors((prev) => ({ ...prev, [q.id]: "This field is required" }));
      setShakeErrors((prev) => ({ ...prev, [q.id]: true }));
      return false;
    }
    if (Array.isArray(answer) && answer.length === 0) {
      setErrors((prev) => ({ ...prev, [q.id]: "This field is required" }));
      setShakeErrors((prev) => ({ ...prev, [q.id]: true }));
      return false;
    }
    return true;
  }

  function handleNext() {
    if (submitting) return;
    if (!validateCurrent()) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      submitForm();
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  async function submitForm() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const responseAnswers = questions.map((q) => {
        const raw = answers[q.id];
        return {
          question_id: q.id,
          answer_type: q.answer_type,
          text_answer:
            q.answer_type === "text" ? ((raw as string) ?? "") : null,
          select_answer:
            q.answer_type === "select"
              ? raw
                ? q.answer_select_multiple
                  ? (raw as string[])
                  : [raw as string]
                : []
              : null,
        };
      });
      await submitFormResponse(id, responseAnswers);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Failed to submit form",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-text-primary">
            {formTitle || "Untitled Form"}
          </p>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold font-heading text-text-primary">
              Response submitted
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Your response has been submitted. Thank you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "start") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-text-primary">
            {formTitle || "Untitled Form"}
          </p>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold font-heading text-text-primary">
              {formTitle || "Untitled Form"}
            </h1>
            {formDescription && (
              <p className="mt-2 text-sm text-text-secondary">
                {formDescription}
              </p>
            )}
            <p className="mb-2 mt-4 text-sm text-text-placeholder">
              {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"}
            </p>
            <button
              onClick={() => {
                setStage("question");
                setCurrentIndex(0);
              }}
              className="rounded-lg bg-btn-primary px-6 py-2.5 text-sm font-medium text-btn-primary-text hover:bg-btn-primary-hover"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-secondary">No questions available</p>
      </div>
    );
  }

  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-text-primary">
            {formTitle || "Untitled Form"}
          </p>
          <ThemeToggle />
        </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-1 bg-border">
            <div
              className="h-full bg-text-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-text-primary">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div
        className="flex flex-1 items-center justify-center"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleNext();
          }
        }}
      >
        <div className="w-full max-w-lg space-y-10">
          <div>
            <p className="text-xl font-medium text-text-primary md:text-2xl">
              {question.text}
              {question.required && (
                <span
                  className={`ml-0.5 transition-all duration-300 ${
                    shakeErrors[question.id]
                      ? "font-bold text-text-primary"
                      : "text-text-placeholder"
                  }`}
                >
                  *
                </span>
              )}
            </p>

            {question.answer_type === "text" ? (
              <textarea
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => handleTextChange(question.id, e.target.value)}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                placeholder="Your answer"
                rows={1}
                className={`mt-6 w-full resize-none overflow-hidden border-0 border-b border-border bg-transparent pb-1 text-base text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none md:text-lg ${
                  shakeErrors[question.id] ? "animate-shake" : ""
                }`}
                onAnimationEnd={() =>
                  setShakeErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[question.id];
                    return copy;
                  })
                }
              />
            ) : (
              <div
                className={`mt-6 space-y-1 text-left ${
                  shakeErrors[question.id] ? "animate-shake" : ""
                }`}
                onAnimationEnd={() =>
                  setShakeErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[question.id];
                    return copy;
                  })
                }
              >
                {(question.answer_select_options ?? []).map((option) => {
                  const multi = question.answer_select_multiple;
                  const selected = multi
                    ? ((answers[question.id] as string[]) ?? []).includes(
                        option,
                      )
                    : (answers[question.id] as string) === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (multi) {
                          handleCheckboxChange(question.id, option, !selected);
                        } else {
                          handleRadioChange(question.id, option);
                        }
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-base text-text-secondary hover:bg-btn-secondary-hover md:text-lg"
                    >
                      {multi ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-text-placeholder md:h-6 md:w-6">
                          {selected && (
                            <Check
                              size={14}
                              className="text-text-primary md:size-4"
                            />
                          )}
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-text-placeholder md:h-6 md:w-6">
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-text-primary md:h-3 md:w-3" />
                          )}
                        </span>
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {errors[question.id] && (
              <p className="mt-3 animate-fade-in text-sm font-medium text-text-placeholder">
                {errors[question.id]}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-text-placeholder">{submitError}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-text-secondary hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : currentIndex === questions.length - 1
                  ? "Submit"
                  : "Next"}
              {!submitting && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          50%,
          90% {
            transform: translateX(-4px);
          }
          30%,
          70% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
