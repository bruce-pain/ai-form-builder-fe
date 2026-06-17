"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateFormClient, deleteFormClient } from "@/lib/form";
import { ApiError } from "@/lib/api";

export function FormCardMenu({
  formId,
  isPublished,
}: {
  formId: string;
  isPublished: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleToggle() {
    if (toggling || !session?.accessToken) return;
    if (
      !window.confirm(
        `Are you sure you want to ${isPublished ? "unpublish" : "publish"} this form?`,
      )
    ) return;
    setToggling(true);
    try {
      await updateFormClient(session.accessToken, formId, {
        is_published: !isPublished,
      });
      router.refresh();
    } catch (err) {
      console.error(
        err instanceof ApiError ? err.message : "Failed to toggle publish",
      );
    } finally {
      setToggling(false);
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (deleting || !session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    setDeleting(true);
    try {
      await deleteFormClient(session.accessToken, formId);
      router.refresh();
    } catch (err) {
      console.error(
        err instanceof ApiError ? err.message : "Failed to delete form",
      );
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div ref={menuRef} className="absolute right-3 top-3 z-10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(!open);
        }}
        className="rounded p-1 text-text-placeholder hover:bg-btn-secondary-hover hover:text-text-secondary"
        title="More actions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border border-border bg-surface py-1 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggle();
            }}
            disabled={toggling}
            className="flex w-full items-center px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-btn-secondary-hover disabled:opacity-50"
          >
            {toggling ? "..." : isPublished ? "Unpublish" : "Publish"}
          </button>
          <hr className="my-1 border-border" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="flex w-full items-center px-3 py-1.5 text-left text-sm text-red-600 hover:bg-btn-secondary-hover disabled:opacity-50"
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
