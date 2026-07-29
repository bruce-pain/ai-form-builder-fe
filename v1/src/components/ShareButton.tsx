"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareButton({ formId }: { formId: string }) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(textarea);
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/forms/public/${formId}`;
    copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      title="Copy public link"
      className="rounded-md p-1.5 text-text-placeholder hover:bg-btn-secondary-hover hover:text-text-secondary"
    >
      {copied ? (
        <span className="text-xs font-medium">Copied!</span>
      ) : (
        <Share2 size={16} />
      )}
    </button>
  );
}
