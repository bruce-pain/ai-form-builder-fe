import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCta({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:pb-28">
        <Card className="relative overflow-hidden px-6 py-16 text-center sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Describe it.{" "}
              <span className="text-brew font-bold">Brew it.</span> Ship it.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
              Your next form is one sentence away. Brew it now and share it in
              a minute.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
