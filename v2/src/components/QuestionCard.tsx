"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { components } from "@/lib/api.types";

type FormQuestionInput = components["schemas"]["FormQuestionInput"];

interface QuestionCardProps {
  active: boolean;
  question: FormQuestionInput;
  index: number;
  onChange: (updated: FormQuestionInput) => void;
  onDelete: () => void;
  onActivate: () => void;
  isOnly: boolean;
}

export function QuestionCard({
  active,
  question,
  index,
  onChange,
  onDelete,
  onActivate,
  isOnly,
}: QuestionCardProps) {
  const [newOption, setNewOption] = useState("");

  function handleAnswerTypeChange(value: string) {
    if (value === "text") {
      onChange({
        ...question,
        answer_type: "text",
        answer_select_options: null,
        answer_select_multiple: null,
      });
    } else {
      onChange({
        ...question,
        answer_type: "select",
        answer_select_options: [],
        answer_select_multiple: false,
      });
    }
  }

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    const options = question.answer_select_options ?? [];
    if (options.includes(trimmed)) return;
    onChange({
      ...question,
      answer_select_options: [...options, trimmed],
    });
    setNewOption("");
  }

  function removeOption(option: string) {
    const options = question.answer_select_options ?? [];
    onChange({
      ...question,
      answer_select_options: options.filter((o) => o !== option),
    });
  }

  if (active) {
    return (
      <div className="rounded-xl border bg-card p-5 ring-2 ring-primary shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Question {index + 1}
          </span>
          {!isOnly && (
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Textarea
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            placeholder="Enter your question..."
            className="min-h-[2.5rem] resize-none text-sm"
            rows={1}
          />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">
                Answer type
              </Label>
              <Select
                value={question.answer_type}
                onValueChange={handleAnswerTypeChange}
              >
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch
                checked={question.required}
                onCheckedChange={(v) => onChange({ ...question, required: v })}
                size="sm"
              />
              Required
            </Label>

            {question.answer_type === "select" && (
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={question.answer_select_multiple ?? false}
                  onCheckedChange={(v) =>
                    onChange({ ...question, answer_select_multiple: v })
                  }
                  size="sm"
                />
                Allow multiple
              </Label>
            )}
          </div>

          {question.answer_type === "select" && (
            <div className="space-y-2">
              {(question.answer_select_options ?? []).map((option) => (
                <div
                  key={option}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{option}</span>
                  <button
                    onClick={() => removeOption(option)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Add option..."
                  className="h-8 text-sm"
                />
                <Button variant="outline" size="icon-sm" onClick={addOption}>
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onActivate}
      className="cursor-pointer rounded-xl border bg-card p-5 transition-colors hover:bg-muted/50"
    >
      <div className="mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Question {index + 1}
        </span>
      </div>

      <p className="mb-3 text-sm font-medium">
        {question.text || (
          <span className="italic text-muted-foreground/50">
            Untitled question
          </span>
        )}
        {question.required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </p>

      {question.answer_type === "text" ? (
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground/60">
          Your answer
        </div>
      ) : (
        <div className="space-y-1.5">
          {(question.answer_select_options ?? []).length > 0 ? (
            (question.answer_select_options ?? []).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <div
                  className={`shrink-0 border border-muted-foreground/30 ${
                    question.answer_select_multiple
                      ? "size-4 rounded-sm"
                      : "size-4 rounded-full"
                  }`}
                />
                <span className="text-sm text-muted-foreground">{option}</span>
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground/60">
              No options configured
            </div>
          )}
        </div>
      )}
    </div>
  );
}
