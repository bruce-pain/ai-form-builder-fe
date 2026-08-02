# Phase 03 — Auth Pages

## Goal
Login and register pages that work with the backend auth endpoints, using shadcn form components.

## Steps

### 1. Create auth route group

```
v2/src/app/(auth)/
├── layout.tsx
├── login/
│   └── page.tsx
└── register/
    └── page.tsx
```

### 2. Auth layout

Minimal layout — just centers the form card. No header.

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
```

### 3. Login page

Client component. Email + password inputs, submit button, link to register.

```tsx
"use client";
// src/app/(auth)/login/page.tsx
// - Card with CardHeader (title), CardContent (form), CardFooter (link to register)
// - Email Input, Password Input (type="password")
// - Submit Button with loading state
// - On submit: signIn("credentials", { email, password, redirect: false })
// - On success: router.push("/dashboard")
// - On error: show toast or inline error message
// - Link to /register at bottom: "Don't have an account? Sign up"
```

### 4. Register page

Client component. Email + password, submit button, link to login.

```tsx
"use client";
// src/app/(auth)/register/page.tsx
// - Card with CardHeader (title), CardContent (form), CardFooter (link to login)
// - Email Input, Password Input
// - Submit Button with loading state
// - On submit: fetch POST /api/v1/auth/register directly (no next-auth for this)
// - On success: signIn("credentials", { email, password, redirect: false }) then router.push("/dashboard")
// - On error: show inline error
// - Link to /login: "Already have an account? Log in"
```

### 5. Verification

```bash
pnpm dev
```

- `/login` renders centered form card
- `/register` renders centered form card
- Submit with valid credentials → redirected to `/dashboard` (which will redirect back since dashboard doesn't exist yet — that's expected)
- Submit with wrong password → error shown
- When logged in, `/login` and `/register` redirect to `/dashboard`

### 6. Files created

```
v2/src/app/(auth)/
├── layout.tsx
├── login/page.tsx
└── register/page.tsx
```
