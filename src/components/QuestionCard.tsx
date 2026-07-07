"use client";

import { useState, useRef, useEffect } from "react";
import type { FormQuestion } from "@/types/form";

interface QuestionCardProps {
  questionIndex: number;
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
  questionIndex,
  question,
  onChange,
  onDelete,
}: QuestionCardProps) {
  const [newOption, setNewOption] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [question.text]);

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
    <div className="py-8">
      <div className="flex items-start gap-3">
        <span className="shrink-0 pt-0.5 text-right text-sm text-text-placeholder">
          {String(questionIndex + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <textarea
            ref={textareaRef}
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            onInput={(e) => autoResize(e.currentTarget)}
            placeholder="Enter your question..."
            className="w-full resize-none overflow-hidden border-b border-border bg-transparent pb-1 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
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
                className="appearance-none bg-transparent pr-5 text-sm text-text-secondary focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="select">Select</option>
              </select>
              <svg
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-text-placeholder"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {question.answer_type === "select" && (
              <Toggle
                label="Allow multiple"
                checked={question.answer_select_multiple ?? false}
                onChange={(v) =>
                  onChange({ ...question, answer_select_multiple: v })
                }
              />
            )}

            <Toggle
              label="Required"
              checked={question.required}
              onChange={(v) => onChange({ ...question, required: v })}
            />
          </div>

          {question.answer_type === "select" && (
            <div>
              {question.answer_select_options &&
                question.answer_select_options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center justify-between border-b border-border py-2"
                  >
                    <span className="text-sm text-text-primary">{option}</span>
                    <button
                      onClick={() => removeOption(option)}
                      className="text-text-placeholder hover:text-text-secondary"
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
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              <div className="flex items-center gap-2 border-b border-border py-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-text-placeholder"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
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
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-placeholder focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 rounded-md p-1.5 text-text-placeholder hover:bg-btn-secondary-hover hover:text-text-secondary"
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
