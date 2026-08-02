import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Describe your form. AI builds it.
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Type what you need in plain English. The AI generates questions, you
        refine with chat. No drag-and-drop required.
      </p>
      <div className="mt-8 flex gap-4">
        {session ? (
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
