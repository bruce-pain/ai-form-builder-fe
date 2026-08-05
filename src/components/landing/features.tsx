import {
  BarChart3,
  ListChecks,
  MessagesSquare,
  Rocket,
  ScanEye,
  Sparkles,
} from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Describe, don't drag",
    body: "Type what you need. The AI writes the title, description, and every question. No form builder to learn.",
  },
  {
    icon: MessagesSquare,
    title: "Chat to refine",
    body: "Ask for a shorter version, a different question type, or a whole new section. The conversation keeps context.",
  },
  {
    icon: ListChecks,
    title: "Every question type",
    body: "Short text, single choice, or multiple choice, with options you can edit anytime and required toggles per question.",
  },
  {
    icon: Rocket,
    title: "Publish in one click",
    body: "Hit publish and get a public link. Unpublish to edit again, and manage everything from your dashboard.",
  },
  {
    icon: BarChart3,
    title: "Responses at a glance",
    body: "See aggregate summaries per question: choice distributions with counts and percentages, or browse each response.",
  },
  {
    icon: ScanEye,
    title: "The AI watches your edits",
    body: "Tweak questions manually between prompts, and the AI accounts for your changes on the next round.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Features
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Brewed to do the busywork.
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-muted-foreground">
            Everything you need to build, publish, and understand a form without the form-builder maze.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="transition-colors hover:ring-foreground/20"
            >
              <CardHeader className="gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <feature.icon className="size-4" />
                </span>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
