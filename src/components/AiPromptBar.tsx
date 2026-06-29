"use client";

import { useRef, useEffect } from "react";

interface AiPromptBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

export function AiPromptBar({ value, onChange, onSubmit, loading }: AiPromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your form..."
          disabled={loading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="flex-1 rounded-lg border border-border-input bg-input px-4 py-2.5 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden"
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="rounded-lg border border-btn-secondary-border px-4 py-2.5 text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Send \u2192"}
        </button>
      </form>
    </div>
  );
}
