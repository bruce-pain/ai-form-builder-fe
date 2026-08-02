# Phase 01 — Design System

## Goal
Define a minimal, clean visual identity for the app — color palette, typography, spacing — and configure it in Tailwind + shadcn. Every page after this will use these tokens.

## Color Palette

Minimal neutral base with one restrained accent.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#ffffff` | `#0a0a0a` | Page background |
| `foreground` | `#09090b` | `#fafafa` | Primary text |
| `card` | `#ffffff` | `#18181b` | Card/surface backgrounds |
| `card-foreground` | `#09090b` | `#fafafa` | Text on cards |
| `popover` | `#ffffff` | `#18181b` | Dropdowns, dialogs |
| `popover-foreground` | `#09090b` | `#fafafa` | Text on popovers |
| `primary` | `#18181b` | `#fafafa` | Primary buttons, links |
| `primary-foreground` | `#fafafa` | `#18181b` | Text on primary |
| `secondary` | `#f4f4f5` | `#27272a` | Secondary buttons |
| `secondary-foreground` | `#18181b` | `#fafafa` | Text on secondary |
| `muted` | `#f4f4f5` | `#27272a` | Muted backgrounds |
| `muted-foreground` | `#71717a` | `#a1a1aa` | Secondary text |
| `accent` | `#f4f4f5` | `#27272a` | Hover states, highlights |
| `accent-foreground` | `#18181b` | `#fafafa` | Text on accent |
| `destructive` | `#ef4444` | `#ef4444` | Delete/danger actions |
| `destructive-foreground` | `#fafafa` | `#fafafa` | Text on destructive |
| `border` | `#e4e4e7` | `#27272a` | Borders, dividers |
| `input` | `#e4e4e7` | `#27272a` | Input borders |
| `ring` | `#18181b` | `#fafafa` | Focus ring |

This is the default shadcn Neutral palette — it's clean, tested, and unopinionated. We'll keep it as-is and let the typography and layout carry the personality.

## Typography

**One typeface** (keeping it simple).

| Role | Font | Fallback | Weight |
|---|---|---|---|
| Display/Headings | **Inter** | sans-serif | 600 (semibold) |
| Body | **Inter** | sans-serif | 400 (regular) |
| Mono/code | **JetBrains Mono** | monospace | 400 |

Inter is neutral, readable, and widely available via next/font/google. Using one face for both headings and body eliminates font-switching complexity.

## Type scale

| Token | Size | Line height | Weight |
|---|---|---|---|
| `h1` | 2.5rem (40px) | 1.2 | 600 |
| `h2` | 1.5rem (24px) | 1.3 | 600 |
| `h3` | 1.125rem (18px) | 1.4 | 600 |
| `body` | 0.875rem (14px) | 1.5 | 400 |
| `small` | 0.75rem (12px) | 1.5 | 400 |
| `muted` | 0.75rem (12px) | 1.5 | 400 |

## Radius

shadcn default (`--radius: 0.5rem`) — consistent 8px rounding on cards, buttons, inputs.

## Steps

### 1. Configure fonts in root layout

In `v2/src/app/layout.tsx`, load Inter from `next/font/google`:

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

Apply variables to `<html>` class and set `font-family: var(--font-inter)` on body.

### 2. Update `globals.css`

The `shadcn init` already generated a `globals.css` with `@tailwind base/components/utilities` and CSS variables. The default Neutral palette from shadcn should be left as-is — it matches our design tokens above. Only change: remove or replace the default Tailwind base styles with our font setup.

Add font family declarations to the `@layer base` section:

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### 3. Verify shadcn components are usable

Open `v2/src/app/page.tsx` and replace with a quick test:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>AI Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button>Get started</Button>
          <Button variant="outline">Log in</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

Run `pnpm dev` and confirm the card + buttons render with proper styling.

### 4. Commit the design system baseline

```bash
git add v2/src/app v2/src/components v2/src/lib v2/globals.css
git commit -m "design system: palette, typography, shadcn primitives"
```
