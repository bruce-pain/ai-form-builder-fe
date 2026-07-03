<div align="center">

# AI Form Builder — Frontend

**Create, publish, and manage forms using natural language prompts powered by AI.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

[Backend API →](https://github.com/bruce-pain/AI-form-builder-be)

</div>

---

## Overview

AI Form Builder is a full-stack application that lets users create forms by simply describing them in plain English. An LLM generates the questions, title, and description automatically, and users can refine the result through natural conversation — no manual drag-and-drop builders needed.

The frontend is a **Next.js 16** (App Router) application written in **TypeScript**, styled with **Tailwind CSS v4**, and authenticated via **next-auth** with JWT. It consumes a FastAPI backend that handles form storage, AI generation, and response collection.

---

## Key Features

- **AI-Powered Form Generation** — Describe your form in natural language; the LLM generates questions, title, and description. Supports multi-turn conversational refinement — follow-up prompts modify the existing form contextually.
- **Smart Edit Tracking** — Manual edits made between AI prompts (title changes, question modifications, additions, deletions) are detected and included in subsequent LLM requests, keeping the AI aware of user changes.
- **Form CRUD** — Create, preview, edit, publish/unpublish, and delete forms from the dashboard or form detail page.
- **Multiple Question Types** — Text inputs, single-select (radio), and multi-select (checkbox) with dynamic option management and per-question required toggles.
- **Public Form Submission** — Published forms get a shareable public link for anonymous responses with client-side validation.
- **Response Analytics** — View aggregate answer summaries per question or browse individual responses with pagination.
- **JWT Authentication** — Email/password registration and login with automatic token refresh via next-auth credentials provider.
- **Dark/Light Theme** — Full theme support via `next-themes` with CSS custom properties and system preference detection.

---

## Tech Stack

| Technology                  | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **Next.js 16** (App Router) | React framework with server components and route groups       |
| **React 19**                | UI component library                                          |
| **TypeScript**              | Type safety across the entire codebase                        |
| **Tailwind CSS v4**         | Utility-first CSS with `@theme` custom properties             |
| **next-auth** (v5 beta)     | Authentication with JWT credentials provider and auto-refresh |
| **next-themes**             | Dark/light theme switching                                    |
| **pnpm**                    | Fast, disk-efficient package manager                          |

---

## Architecture Highlights

### Route Groups (`src/app/`)

Three logical route groups separate concerns:

| Group      | Routes                   | Layout                 | Access                              |
| ---------- | ------------------------ | ---------------------- | ----------------------------------- |
| `(app)`    | `/dashboard`, `/forms/*` | Header + main content  | Authenticated only                  |
| `(auth)`   | `/login`, `/register`    | Minimal (theme toggle) | Redirects to dashboard if logged in |
| `(public)` | `/forms/public/[id]`     | Simple container       | No auth required                    |

### Dual Fetch Pattern (`src/lib/api.ts`)

- **`apiFetch()`** — Server-side authenticated requests (reads auth via `auth()` server-side).
- **`clientFetch()`** — Client-side requests with an explicit `accessToken` parameter.
- **`publicFetch()`** — Unauthenticated requests for public form viewing and submission.

This avoids client-side token storage while maintaining type safety through a shared `ApiError` class and consistent response handling.

### AI Edit Tracking (`src/lib/editTracker.ts`)

Before each AI request, the current form state is compared to the previous snapshot. Detected changes (title/description edits, question modifications, add/remove operations, option changes) are formatted as structured text and prepended to the user's LLM prompt, providing context-aware conversational refinement.

### JWT Token Refresh (`src/auth.ts`)

When a session token is about to expire, the server-side `auth()` call automatically refreshes it via the backend's `/api/v1/auth/token/refresh` endpoint before returning the session. This keeps users signed in transparently.

### CSS Variable Theming (`src/app/globals.css`)

All colors are defined as CSS custom properties on `:root` and `.dark`, ensuring every component is theme-aware without hardcoded color values. Tailwind v4's `@theme` directive maps these into utility classes.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated pages
│   │   ├── dashboard/            # Form list with CRUD actions
│   │   └── forms/
│   │       ├── new/              # AI-powered form builder
│   │       ├── [id]/             # Form detail (summary + individual responses)
│   │       │   ├── edit/         # Form editor
│   │       │   └── responses/    # Response list & detail
│   ├── (auth)/login, register/   # Authentication pages
│   ├── (public)/forms/public/    # Public form submission
│   └── api/auth/                 # NextAuth API route
├── components/
│   ├── AiPromptBar.tsx           # Chat input for AI form generation
│   ├── FormCardMenu.tsx          # Dashboard card dropdown (publish, delete)
│   ├── FormPreview.tsx           # Read-only form preview
│   ├── QuestionCard.tsx          # Editable question component
│   ├── ShareButton.tsx           # Copy public link to clipboard
│   ├── ThemeToggle.tsx           # Dark/light toggle
│   └── Toast.tsx                 # Error notifications
├── lib/
│   ├── api.ts                    # API fetch utilities
│   ├── form.ts                   # Form API client functions
│   └── editTracker.ts            # AI edit diff detection
├── types/
│   ├── form.ts                   # TypeScript interfaces
│   └── next-auth.d.ts            # Auth type extensions
├── auth.ts                       # NextAuth configuration
└── proxy.ts                      # Middleware route protection
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** — install via `npm install -g pnpm` or [corepack](https://nodejs.org/api/corepack.html)
- A running instance of the [AI Form Builder backend](https://github.com/bruce-pain/AI-form-builder)

### Environment Variables

Create `.env.local` in the project root:

```env
AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Install & Run

```bash
pnpm install
pnpm dev        # Start dev server (Turbopack) on http://localhost:3000
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

---

## Related Projects

| Project                                                          | Description                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [AI-form-builder-be](https://github.com/bruce-pain/AI-form-builder-be) | FastAPI backend with LLM integration, form CRUD, authentication, and response storage |

---

## License

[MIT](LICENSE)
