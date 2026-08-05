import {
  Coffee,
  MessageSquareText,
  MessagesSquare,
  Share2,
} from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Describe it",
    body: "Tell the AI what you need in plain English, like \"an RSVP form for Friday's launch party\".",
  },
  {
    icon: Coffee,
    title: "Brew",
    body: "The AI drafts the title, description, and every question. No templates, no blank canvas.",
  },
  {
    icon: MessagesSquare,
    title: "Refine with chat",
    body: "Ask for a different question type, shorter wording, or a whole new section. The conversation keeps context. The AI even watches your manual edits.",
  },
  {
    icon: Share2,
    title: "Share & collect",
    body: "Publish to get a public link. Share it anywhere, and watch the responses roll in.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            From a sentence to a working form.
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-muted-foreground">
            Four steps, zero drag-and-drop. Most forms take under a minute.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="transition-colors hover:ring-foreground/20"
            >
              <CardHeader className="gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <step.icon className="size-4" />
                  </span>
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {step.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
