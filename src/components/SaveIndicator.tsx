"use client";

import { useEffect, useState } from "react";

interface SaveIndicatorProps {
  status: "unsaved" | "saving" | "saved";
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === "saved") {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(true);
  }, [status]);

  if (!visible && status === "saved") return null;

  const label =
    status === "unsaved"
      ? "Unsaved changes"
      : status === "saving"
        ? "Saving..."
        : "Saved";

  const color =
    status === "unsaved"
      ? "text-amber-600"
      : status === "saving"
        ? "text-muted-foreground"
        : "text-emerald-600";

  return (
    <span className={`text-xs ${color}`}>
      {status === "saving" ? (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" />
          {label}
        </span>
      ) : (
        label
      )}
    </span>
  );
}
