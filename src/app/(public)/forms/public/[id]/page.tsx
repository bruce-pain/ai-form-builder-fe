"use client";

import { useState, useEffect, use } from "react";
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

  useEffect(() => {
    getPublicForm(id)
      .then((res) => {
        const data = res.data;
        setFormTitle(data.title);
        setFormDescription(data.description ?? "");
        setQuestions(data.questions ?? []);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load form");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleTextChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }

  function handleRadioChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }

  function handleCheckboxChange(questionId: string, option: string, checked: boolean) {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked
        ? [...current, option]
        : current.filter((o) => o !== option);
      return { ...prev, [questionId]: next };
    });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (!q.required) continue;
      const answer = answers[q.id];
      if (answer === undefined || answer === null) {
        newErrors[q.id] = "This field is required";
        continue;
      }
      if (typeof answer === "string" && !answer.trim()) {
        newErrors[q.id] = "This field is required";
      }
      if (Array.isArray(answer) && answer.length === 0) {
        newErrors[q.id] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const responseAnswers = questions.map((q) => {
        const raw = answers[q.id];
        return {
          question_id: q.id,
          answer_type: q.answer_type,
          text_answer: q.answer_type === "text" ? (raw as string) ?? "" : null,
          select_answer: q.answer_type === "select"
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
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-6">
        <div className="w-full rounded-xl border border-border bg-surface p-10 text-center">
          <h2 className="text-xl font-semibold text-text-primary">
            Response submitted
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Your response has been submitted. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-text-primary">
            {formTitle || "Untitled Form"}
          </h1>
          {formDescription && (
            <p className="text-sm text-text-secondary">{formDescription}</p>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="mb-3 text-sm font-medium text-text-primary">
                {question.text}
                {question.required && (
                  <span className="ml-0.5 text-red-500">*</span>
                )}
              </p>

              {question.answer_type === "text" ? (
                <input
                  type="text"
                  value={(answers[question.id] as string) ?? ""}
                  onChange={(e) =>
                    handleTextChange(question.id, e.target.value)
                  }
                  placeholder="Your answer"
                  className="w-full rounded-lg border border-border-input bg-input px-3 py-2 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none"
                />
              ) : (
                <div className="space-y-2">
                  {(question.answer_select_options ?? []).map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type={question.answer_select_multiple ? "checkbox" : "radio"}
                        name={`public-q-${question.id}`}
                        value={option}
                        checked={
                          question.answer_select_multiple
                            ? ((answers[question.id] as string[]) ?? []).includes(option)
                            : (answers[question.id] as string) === option
                        }
                        onChange={(e) => {
                          if (question.answer_select_multiple) {
                            handleCheckboxChange(
                              question.id,
                              option,
                              e.target.checked,
                            );
                          } else {
                            handleRadioChange(question.id, option);
                          }
                        }}
                        className="text-text-secondary focus:ring-0"
                      />
                      <span className="text-sm text-text-secondary">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {errors[question.id] && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors[question.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {submitError && (
          <p className="text-sm text-red-500">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-btn-secondary-border px-6 py-2.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
