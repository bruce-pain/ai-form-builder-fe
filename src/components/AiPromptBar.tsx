"use client";

import { useRef, useEffect } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AiPromptBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  rateLimitMessage?: string;
}

export function AiPromptBar({
  value,
  onChange,
  onSubmit,
  loading,
  disabled,
  rateLimitMessage,
}: AiPromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = loading || disabled || !!rateLimitMessage;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <form
      onSubmit={onSubmit}
      className="fixed bottom-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
    >
      <div
        className={`flex flex-col gap-2 rounded-2xl border bg-background/80 p-3 shadow-lg backdrop-blur-sm transition-all focus-within:ring-1 focus-within:ring-primary ${
          rateLimitMessage
            ? "border-amber-200 dark:border-amber-800"
            : "border-primary/20"
        }`}
      >
        <div className="flex items-end gap-2">
          <Sparkles className="mb-0.5 size-4 shrink-0 text-primary" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask AI to generate or modify your form..."
            disabled={isDisabled}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            className="min-h-0 w-full resize-none bg-transparent p-0 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full transition-transform active:scale-90"
            disabled={!value.trim() || isDisabled}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>

        {rateLimitMessage && (
          <p className="px-1 text-xs text-amber-600 dark:text-amber-400">
            {rateLimitMessage}
          </p>
        )}
      </div>
    </form>
  );
}
