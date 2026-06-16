"use client";

import { useState } from "react";
import type { FormQuestion } from "@/types/form";

interface QuestionCardProps {
  question: FormQuestion;
  onChange: (updated: FormQuestion) => void;
  onDelete: () => void;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`relative h-4 w-8 rounded-full transition-colors ${
          checked ? "bg-toggle-active" : "bg-toggle-bg"
        }`}
      >
        <div
          className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-toggle-dot transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  );
}

export function QuestionCard({
  question,
  onChange,
  onDelete,
}: QuestionCardProps) {
  const [newOption, setNewOption] = useState("");

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    const options = question.answer_select_options ?? [];
    if (options.includes(trimmed)) return;
    onChange({
      ...question,
      answer_select_options: [...options, trimmed],
    });
    setNewOption("");
  }

  function removeOption(option: string) {
    const options = question.answer_select_options ?? [];
    onChange({
      ...question,
      answer_select_options: options.filter((o) => o !== option),
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-4">
          <input
            type="text"
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Enter your question..."
            className="w-full rounded-lg border border-border-input bg-input px-3 py-2 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={question.answer_type}
              onChange={(e) =>
                onChange({
                  ...question,
                  answer_type: e.target.value as "text" | "select",
                  answer_select_options:
                    e.target.value === "text" ? null : [],
                  answer_select_multiple:
                    e.target.value === "text" ? null : false,
                })
              }
              className="rounded-lg border border-border-input bg-input px-3 py-2 text-sm text-text-secondary focus:border-gray-400 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
            </select>

            {question.answer_type === "select" && (
              <>
                <Toggle
                  label="Allow multiple"
                  checked={question.answer_select_multiple ?? false}
                  onChange={(v) =>
                    onChange({ ...question, answer_select_multiple: v })
                  }
                />
                <span className="hidden sm:inline text-border">|</span>
              </>
            )}

            <Toggle
              label="Required"
              checked={question.required}
              onChange={(v) => onChange({ ...question, required: v })}
            />
          </div>

          {question.answer_type === "select" && (
            <div className="space-y-2">
              {question.answer_select_options &&
                question.answer_select_options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {question.answer_select_options.map((option) => (
                      <span
                        key={option}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-text-secondary"
                      >
                        {option}
                        <button
                          onClick={() => removeOption(option)}
                          className="text-text-placeholder hover:text-text-secondary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Add option..."
                  className="flex-1 rounded-lg border border-border-input bg-input px-3 py-1.5 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none"
                />
                <button
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  className="rounded-lg border border-border-input px-3 py-1.5 text-sm text-text-secondary hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 rounded-lg p-2 text-text-placeholder hover:bg-btn-secondary-hover hover:text-text-secondary"
          title="Delete question"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

    </div>
  );
}
