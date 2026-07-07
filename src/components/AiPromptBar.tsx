"use client";

import { useRef, useEffect } from "react";

interface AiPromptBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AiPromptBar({ value, onChange, onSubmit, loading, disabled }: AiPromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <form
      className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-3rem)] max-w-2xl -translate-x-1/2 items-end gap-3"
      onSubmit={onSubmit}
    >
      <div className={`flex-1 rounded-2xl border ${loading ? "invisible" : "border-border bg-surface"}`}>
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your form..."
            disabled={loading || disabled}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            className="w-full resize-none overflow-hidden border-none bg-transparent text-sm text-text-primary placeholder-text-placeholder focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!value.trim() || loading || disabled}
        className="flex shrink-0 items-center justify-center rounded-full bg-btn-primary p-4 text-btn-primary-text hover:bg-btn-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        )}
      </button>
    </form>
  );
}
