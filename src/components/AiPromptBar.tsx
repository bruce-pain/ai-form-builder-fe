"use client";

interface AiPromptBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

export function AiPromptBar({ value, onChange, onSubmit, loading }: AiPromptBarProps) {
  return (
    <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your form..."
          disabled={loading}
          className="flex-1 rounded-lg border border-border-input bg-input px-4 py-2.5 text-sm text-text-primary placeholder-text-placeholder focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
