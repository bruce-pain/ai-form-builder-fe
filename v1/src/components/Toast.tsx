"use client";

import { X } from "lucide-react";

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
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
