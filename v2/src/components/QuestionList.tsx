"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";

import type { components } from "@/lib/api.types";

type FormQuestionInput = components["schemas"]["FormQuestionInput"];

interface QuestionListProps {
  questions: FormQuestionInput[];
  activeCardId: string | null;
  aiTouchedIds: Set<string>;
  onQuestionChange: (index: number, updated: FormQuestionInput) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  onActivate: (id: string) => void;
}

export function QuestionList({
  questions,
  activeCardId,
  aiTouchedIds,
  onQuestionChange,
  onDelete,
  onAdd,
  onActivate,
}: QuestionListProps) {
  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          active={activeCardId === question.id}
          aiTouched={aiTouchedIds.has(question.id)}
          question={question}
          index={index}
          onChange={(updated) => onQuestionChange(index, updated)}
          onDelete={() => onDelete(index)}
          onActivate={() => onActivate(question.id)}
          isOnly={questions.length <= 1}
        />
      ))}

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={onAdd}
      >
        <Plus className="size-4" />
        Add question
      </Button>
    </div>
  );
}
