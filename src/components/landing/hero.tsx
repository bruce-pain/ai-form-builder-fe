import Link from "next/link";

import { BrewDemo } from "@/components/landing/brew-demo";
import { Button } from "@/components/ui/button";

export function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-80 w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-24 top-48 hidden h-64 w-64 rounded-full bg-secondary/50 blur-3xl sm:block" />
        <div className="absolute -left-24 top-96 hidden h-64 w-64 rounded-full bg-accent/10 blur-3xl lg:block" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          AI form builder · no drag-and-drop
        </p>

        <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Describe it.{" "}
          <span className="text-brew font-bold">The form brews itself.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Type what you need in plain English. The AI writes the questions, you
          refine with chat, then share one link and collect the responses.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-7 text-base">
            <Link href={isAuthed ? "/dashboard" : "/register"}>
              {isAuthed ? "Go to dashboard" : "Brew your first form"}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 px-7 text-base"
          >
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <p className="mt-5 font-mono text-xs text-muted-foreground">
          free to start · no credit card
        </p>

        <BrewDemo />
      </div>
    </section>
  );
}
