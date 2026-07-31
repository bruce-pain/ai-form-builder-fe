"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  formId: string;
  label?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ShareButton({
  formId,
  label = "Share",
  variant = "outline",
  size = "default",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  async function handleCopy() {
    const publicLink = `${window.location.origin}/forms/public/${formId}`;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied!" : label}
    </Button>
  );
}
