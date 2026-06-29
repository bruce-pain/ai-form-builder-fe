"use client";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg">
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm text-red-500">{message}</p>
        <button
          onClick={onDismiss}
          className="mt-0.5 text-text-placeholder hover:text-text-primary"
          aria-label="Dismiss"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
