"use client";

import { UnderlineTextarea } from "@/components/ui/underline-input";

interface TitleCardProps {
  active: boolean;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onActivate: () => void;
}

export function TitleCard({
  active,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onActivate,
}: TitleCardProps) {
  if (active) {
    return (
      <div className="rounded-md border bg-card p-5 ring-2 ring-primary shadow-md">
        <div className="space-y-3">
          <UnderlineTextarea
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            placeholder="Form title"
            rows={1}
            className="min-h-11 py-1 text-2xl font-semibold tracking-tight md:text-2xl"
          />
          <UnderlineTextarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Form description (optional)"
            className="py-1 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onActivate}
      className="cursor-pointer rounded-md border bg-card p-5 transition-colors hover:bg-muted/50"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title || (
            <span className="text-muted-foreground">Untitled Form</span>
          )}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            No description
          </p>
        )}
      </div>
    </div>
  );
}
