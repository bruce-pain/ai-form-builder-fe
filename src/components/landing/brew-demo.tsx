"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionKind = "text" | "single" | "multiple";

interface DemoQuestionData {
  kind: QuestionKind;
  label: string;
  required?: boolean;
  options?: string[];
}

interface DemoForm {
  label: string;
  prompt: string;
  title: string;
  description: string;
  questions: DemoQuestionData[];
}

const EXAMPLES: DemoForm[] = [
  {
    label: "Event RSVP",
    prompt: "An RSVP form for Friday's launch party",
    title: "Launch Party RSVP",
    description: "Friday at 6pm · The Warehouse. Let us know you're coming.",
    questions: [
      { kind: "text", label: "Your name", required: true },
      {
        kind: "single",
        label: "Will you make it?",
        required: true,
        options: ["Yes, count me in", "Maybe", "Can't make it"],
      },
      { kind: "text", label: "Any dietary requirements?" },
    ],
  },
  {
    label: "Café feedback",
    prompt: "A short feedback survey for a neighborhood coffee shop",
    title: "Café Feedback",
    description: "Three quick questions about your last visit.",
    questions: [
      {
        kind: "single",
        label: "How did you hear about us?",
        required: true,
        options: ["Social media", "A friend", "Walked past", "Online search"],
      },
      {
        kind: "multiple",
        label: "What did you order?",
        options: ["Espresso", "Latte", "Filter", "Pastry"],
      },
      { kind: "text", label: "Anything we could do better?" },
    ],
  },
  {
    label: "Job application",
    prompt: "A job application for a junior frontend developer role",
    title: "Junior Frontend Developer",
    description: "We're hiring. Tell us a little about yourself.",
    questions: [
      { kind: "text", label: "Full name", required: true },
      { kind: "text", label: "Email", required: true },
      {
        kind: "single",
        label: "How many years of experience?",
        required: true,
        options: ["0–1", "1–3", "3+"],
      },
    ],
  },
];

type Phase = "idle" | "typing" | "brewing" | "done";

const TYPING_MS = 24;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DemoTitleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="brew-in rounded-md border bg-card p-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DemoQuestion({
  question,
  index,
}: {
  question: DemoQuestionData;
  index: number;
}) {
  const isMultiple = question.kind === "multiple";

  return (
    <div className="brew-in rounded-md border bg-card p-5">
      <div className="mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Question {index + 1}
        </span>
      </div>

      <p className="mb-3 text-sm font-medium">
        {question.label}
        {question.required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </p>

      {question.kind === "text" ? (
        <div className="border-b border-input pb-1.5 text-sm text-muted-foreground/60">
          Your answer
        </div>
      ) : (
        <div className="space-y-1.5">
          {question.options?.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <div
                className={cn(
                  "shrink-0 border border-muted-foreground/30",
                  isMultiple ? "size-4 rounded-sm" : "size-4 rounded-full",
                )}
              />
              <span className="text-sm text-muted-foreground">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BrewDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const runToken = useRef(0);

  const example = EXAMPLES[activeIndex];
  const totalCards = example.questions.length + 1;
  const showTitle = revealed >= 1;

  const run = useCallback(
    async (index: number) => {
      const token = ++runToken.current;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const target = EXAMPLES[index];

      setActiveIndex(index);
      setPhase("typing");
      setTyped(0);
      setRevealed(0);

      if (reduceMotion) {
        setTyped(target.prompt.length);
      } else {
        for (let i = 1; i <= target.prompt.length; i++) {
          if (runToken.current !== token) return;
          setTyped(i);
          await sleep(TYPING_MS);
        }
        await sleep(350);
      }

      if (runToken.current !== token) return;
      setPhase("brewing");

      if (!reduceMotion) await sleep(650);

      for (let i = 1; i <= totalCards; i++) {
        if (runToken.current !== token) return;
        setRevealed(i);
        if (!reduceMotion) await sleep(170);
      }

      if (runToken.current !== token) return;
      setPhase("done");
    },
    [totalCards],
  );

  useEffect(() => {
    const token = runToken.current;
    const timer = setTimeout(() => run(0), 600);
    return () => {
      clearTimeout(timer);
      runToken.current = token + 1;
    };
  }, [run]);

  const busy = phase === "typing" || phase === "brewing";

  return (
    <section
      aria-label="Formbrew live demo"
      className="relative mx-auto mt-14 max-w-2xl text-left"
    >
      <div className="rounded-2xl border bg-card p-3 shadow-xl shadow-primary/5 sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-primary/20 bg-background/80 p-3 shadow-lg backdrop-blur-sm focus-within:ring-1 focus-within:ring-primary">
          <Sparkles className="mb-0.5 size-4 shrink-0 text-primary" />
          <div
            role="textbox"
            aria-readonly="true"
            aria-label="Example prompt"
            className="min-h-6 flex-1 text-sm leading-6 text-foreground"
          >
            <span>{example.prompt.slice(0, typed)}</span>
            {phase === "typing" && (
              <span className="caret-blink ml-0.5 inline-block h-4 w-[2px] translate-y-[4px] bg-primary" />
            )}
            {typed === 0 && (
              <span className="text-muted-foreground">
                Ask AI to generate or modify your form…
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-full transition-transform active:scale-90"
            disabled={busy}
            onClick={() => run(activeIndex)}
            aria-label="Brew form from example prompt"
          >
            {phase === "brewing" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 px-1 pt-3">
          {EXAMPLES.map((item, index) => (
            <Button
              key={item.label}
              type="button"
              variant={index === activeIndex ? "default" : "outline"}
              size="sm"
              onClick={() => run(index)}
              className="font-mono text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3 p-3 sm:p-4">
          {!showTitle ? (
            <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border">
              <p className="font-mono text-xs text-muted-foreground">
                {phase === "brewing" ? "Brewing…" : "Your form will brew here"}
              </p>
            </div>
          ) : (
            <>
              <DemoTitleCard
                title={example.title}
                description={example.description}
              />
              {example.questions.map((question, index) =>
                revealed >= index + 2 ? (
                  <DemoQuestion
                    key={`${activeIndex}-${index}`}
                    question={question}
                    index={index}
                  />
                ) : null,
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
        Pick a style above, or{" "}
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          brew your own
        </Link>{" "}
        in seconds.
      </p>
    </section>
  );
}
