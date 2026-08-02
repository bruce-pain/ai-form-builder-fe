# Phase 04 — Landing Page

## Goal
A clean public home page at `/` with a hero section that explains what the app does and links to login or dashboard.

## Steps

### 1. Create the public route group

```
v2/src/app/(public)/
├── layout.tsx
└── page.tsx
```

### 2. Public layout

Simple layout — no header, just a centered container.

```tsx
// src/app/(public)/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
```

### 3. Hero page

Server component that checks session and shows appropriate CTAs.

```tsx
// src/app/(public)/page.tsx
import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Describe your form. AI builds it.
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Type what you need in plain English. The AI generates questions, you refine with chat. No drag-and-drop required.
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
```

### 4. Verification

```bash
pnpm dev
```

- `/` shows the hero with heading, description, and CTAs
- When not logged in: "Get started" + "Log in" buttons
- When logged in: "Go to dashboard" button

### 5. Files created

```
v2/src/app/(public)/
├── layout.tsx
└── page.tsx
```
