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
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (next: string) => boolean;
  onCancelEdit: () => void;
  onRemove: (option: string) => void;
}

function SortableOptionRow({
  option,
  editing,
  onStartEdit,
  onCommit,
  onCancelEdit,
  onRemove,
}: SortableOptionRowProps) {
  const [value, setValue] = useState(option);
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

  function handleCommit() {
    const next = value.trim();
    if (!next || next === option || !onCommit(next)) {
      setValue(option);
    }
  }

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
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              handleCommit();
              onCancelEdit();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCommit();
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                setValue(option);
                e.currentTarget.blur();
              }
            }}
            className="w-full min-w-0 border-0 border-b border-primary bg-transparent px-0 text-sm outline-none"
          />
        ) : (
          <button
            onClick={onStartEdit}
            className="w-full min-w-0 cursor-text truncate text-left text-sm hover:underline hover:underline-offset-4 hover:decoration-muted-foreground/50"
          >
            {option}
          </button>
        )}
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (editingId === option) setEditingId(null);
  }

  function commitOption(original: string, next: string) {
    if (next === original || options.includes(next)) return false;
    onChange(options.map((o) => (o === original ? next : o)));
    setEditingId(null);
    return true;
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
              editing={editingId === option}
              onStartEdit={() => setEditingId(option)}
              onCommit={(next) => commitOption(option, next)}
              onCancelEdit={() => setEditingId(null)}
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
