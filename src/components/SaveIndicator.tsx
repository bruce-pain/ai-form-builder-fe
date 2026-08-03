"use client";

import { useEffect, useState } from "react";

interface SaveIndicatorProps {
  status: "unsaved" | "saving" | "saved";
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(true);
  const [prevStatus, setPrevStatus] = useState(status);

  if (prevStatus !== status) {
    setPrevStatus(status);
    if (status !== "saved") setVisible(true);
  }

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
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
