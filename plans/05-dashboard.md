# Phase 05 — Dashboard

## Goal
The main authenticated page at `/dashboard` that lists the user's forms, shows their status (published/draft), and allows creating new forms or deleting existing ones.

## Steps

### 1. Create the app route group

```
v2/src/app/(app)/
├── layout.tsx
└── dashboard/
    └── page.tsx
```

### 2. App layout

Contains the header with navigation.

Components needed:
- **Header** — logo "AI Form Builder" linking to `/dashboard`, ThemeToggle, sign-out button

```tsx
// src/app/(app)/layout.tsx
import { Header } from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
```

### 3. Header component

```tsx
"use client";
// src/components/Header.tsx
// - Flex row, border-b, px-4 py-3
// - Left: Logo text "AI Form Builder" → Link to /dashboard
// - Right: ThemeToggle + Sign out button
// - Sign out uses signOut() from next-auth/react
```

### 4. ThemeToggle component

```tsx
"use client";
// src/components/ThemeToggle.tsx
// - Uses useTheme() from next-themes
// - Button that toggles between sun/moon icons
// - Prevent hydration mismatch with a mounted check
```

### 5. Dashboard page

Server component. When this page loads, the user is already authenticated (middleware handles that).

```tsx
// src/app/(app)/dashboard/page.tsx
import { auth } from "@/auth";
// We'll need server-side data fetching — can use the apiFetch from infrastructure

export default async function DashboardPage() {
  const session = await auth();
  // fetch forms using server-side fetch with token
  // render form list
}
```

**Data fetching**: Since the dashboard is a server component, use `auth()` to get the token and `fetch` directly (using the api.ts utility).

**Form card**: Each form shows:
- Title, description snippet
- "Updated X ago" timestamp
- Published (green badge) / Draft (amber badge) status
- Delete button (this needs client interactivity — use a client component wrapper)

**Empty state**: If no forms, show "No forms yet" message with a "Create your first form" button.

**Create button**: Links to `/forms/new`.

### 6. Form card client component

For the delete action, create a client component:

```tsx
"use client";
// src/components/FormCard.tsx
// Props: form data, onDelete callback
// - Card with title, description, status badge
// - Dropdown menu (shadcn DropdownMenu) with Delete option
// - Delete triggers confirmation dialog (shadcn Dialog or AlertDialog)
// - Uses accessToken from useSession()
```

### 7. Verification

```bash
pnpm dev
```

- `/dashboard` shows header with logo, theme toggle, sign out
- Form list renders (empty state if no forms)
- Delete works with confirmation
- Create button navigates to `/forms/new`

### 8. Files created

```
v2/src/app/(app)/
├── layout.tsx
└── dashboard/
    └── page.tsx

v2/src/components/
├── Header.tsx
├── ThemeToggle.tsx
└── FormCard.tsx
```
