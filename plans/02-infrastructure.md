# Phase 02 — Infrastructure

## Goal
Set up everything pages need to function: auth (next-auth), route protection (middleware), theme provider, session provider, root layout, and the typed API client.

## Steps

### 1. Generate typed API client from OpenAPI spec

The backend spec is in `v1/openapi.json`. We'll use `openapi-typescript` to generate a single typed client.

```bash
cd v2
pnpm add -D openapi-typescript
pnpm openapi-typescript ../v1/openapi.json --output src/lib/api.types.ts
```

This generates a single file with all TypeScript types matching the backend — request bodies, response bodies, parameters. No more manual `types/form.ts`.

**For the fetch layer**, keep it simple — no generated SDKs. Write a thin utility:

```ts
// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail || `Request failed`);
  }
  return res.json();
}

export function apiFetch(path: string, token?: string, init?: RequestInit) {
  return request(path, {
    ...init,
    headers: token ? { Authorization: `Bearer ${token}`, ...init?.headers } : init?.headers,
  });
}

export function publicFetch(path: string, init?: RequestInit) {
  return request(path, init);
}
```

### 2. Set up next-auth

Copy and adapt from `v1/src/auth.ts`. The auth flow (credentials provider, JWT refresh) works and doesn't need changes.

Create `v2/src/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return {
          id: json.data.id,
          email: json.data.email,
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
          expiresAt: json.expires_at,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = user.expiresAt;
        token.id = user.id;
        token.email = user.email;
      }
      // Refresh if expiring within 60s
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt - 60) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: token.refreshToken }),
          });
          if (res.ok) {
            const json = await res.json();
            token.accessToken = json.access_token;
            token.refreshToken = json.refresh_token;
            token.expiresAt = json.expires_at;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
```

Type augmentation in `v2/src/types/next-auth.d.ts` (create if needed):

```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  interface User {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
```

### 3. Create API route handler

`v2/src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 4. Create middleware

`v2/src/middleware.ts`:

```ts
export { auth as middleware } from "@/auth";
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Then add the redirect logic. For `(public)` routes, allow all. For `(auth)` routes, redirect to dashboard if logged in. For `(app)` routes, redirect to login if not.

The simplest approach: use `auth()` as the middleware export and handle redirects inside.

```ts
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public paths — always allowed
  if (pathname === "/" || pathname.startsWith("/forms/public")) return;

  // Auth pages — redirect to dashboard if logged in
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // Everything else — require login
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 5. Set up root layout with providers

`v2/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AI Form Builder",
  description: "Create forms with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 6. Create SessionProvider client component

`v2/src/components/SessionProvider.tsx`:

```tsx
"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

### 7. Verify

```bash
pnpm dev
```

Confirm:
- Root page renders with the design system styling
- Navigating to `/dashboard` redirects to `/login`
- Auth flow works (register/login/refresh)
- Dark mode toggleable (we'll add the toggle button later)

### 8. Files created

```
v2/src/
├── auth.ts
├── middleware.ts
├── lib/
│   ├── api.ts
│   └── api.types.ts (generated)
├── components/
│   ├── SessionProvider.tsx
│   └── ui/  (already exists from shadcn)
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   └── layout.tsx
└── types/
    └── next-auth.d.ts
```
