"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UnderlineInput } from "@/components/ui/underline-input";

interface SelectOptionListProps {
  options: string[];
  onChange: (options: string[]) => void;
}

interface SortableOptionRowProps {
  option: string;
  onRemove: (option: string) => void;
}

function SortableOptionRow({ option, onRemove }: SortableOptionRowProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        isDragging ? "z-10 shadow-md ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          ref={setActivatorNodeRef}
          title="Reorder option"
          className="-ml-1.5 cursor-grab touch-none rounded p-1 text-muted-foreground/40 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="truncate text-sm">{option}</span>
      </div>
      <button
        onClick={() => onRemove(option)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function SelectOptionList({ options, onChange }: SelectOptionListProps) {
  const [newOption, setNewOption] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = options.findIndex((o) => o === active.id);
    const toIndex = options.findIndex((o) => o === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    onChange(arrayMove(options, fromIndex, toIndex));
  }

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) return;
    onChange([...options, trimmed]);
    setNewOption("");
  }

  function removeOption(option: string) {
    onChange(options.filter((o) => o !== option));
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={options}
          strategy={verticalListSortingStrategy}
        >
          {options.map((option) => (
            <SortableOptionRow
              key={option}
              option={option}
              onRemove={removeOption}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2">
        <UnderlineInput
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
  );
}
