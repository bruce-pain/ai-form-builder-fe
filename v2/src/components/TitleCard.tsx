"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      <div className="rounded-xl border bg-card p-5 ring-2 ring-primary shadow-md">
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form title"
            className="h-9 text-lg font-semibold"
          />
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Form description (optional)"
            className="min-h-[3rem] resize-none text-sm"
            rows={2}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onActivate}
      className="cursor-pointer rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
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
