<div align="center">

# Formbrew

**Create, publish, and manage forms using natural language prompts powered by AI.**

**Live:** [formbrew.vercel.app](https://formbrew.vercel.app) · [API Docs](https://ai-form-builder-be.onrender.com/v1/docs)

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

[Backend API →](https://github.com/bruce-pain/AI-form-builder-be)

</div>

---

## Overview

Formbrew is a full-stack application that lets users create forms by simply describing them in plain English. An LLM generates the questions, title, and description automatically, and users can refine the result through natural conversation. No manual drag-and-drop builders needed.

The frontend is a **Next.js 16** (App Router) application written in **TypeScript**, styled with **Tailwind CSS v4** and **shadcn/ui**, and authenticated via **next-auth** with JWT. It consumes a FastAPI backend that handles form storage, AI generation, and response collection.

---

## Key Features

- **AI-Powered Form Generation**: Describe your form in natural language; the LLM generates questions, title, and description. Supports multi-turn conversational refinement: follow-up prompts modify the existing form contextually.
- **Smart Edit Tracking**: Manual edits made between AI prompts (title changes, question modifications, additions, deletions) are detected and included in subsequent LLM requests, keeping the AI aware of user changes.
- **Form CRUD**: Create, save, edit, publish/unpublish, and delete forms from the dashboard or form detail page.
- **Multiple Question Types**: Text inputs, single-select (radio), and multi-select (checkbox) with dynamic option management and per-question required toggles.
- **Public Form Submission**: Published forms get a shareable public link for anonymous responses with client-side validation and inline required errors.
- **Response Analytics**: View aggregate answer summaries per question — including select distributions with counts and percentages — or browse individual responses with prev/next and go-to navigation.
- **JWT Authentication**: Email/password registration and login with automatic token refresh via next-auth credentials provider; stale sessions are cleaned up and redirected to login.
- **Dark/Light Theme**: Full theme support via `next-themes` with CSS custom properties and system preference detection.

---

## Tech Stack

| Technology                  | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **Next.js 16** (App Router) | React framework with server components and route groups       |
| **React 19**                | UI component library                                          |
| **TypeScript**              | Type safety across the entire codebase                        |
| **Tailwind CSS v4**         | Utility-first CSS with `@theme` custom properties             |
| **shadcn/ui**               | Accessible, composable UI primitives (Radix UI under the hood)|
| **next-auth** (v5 beta)     | Authentication with JWT credentials provider and auto-refresh |
| **next-themes**             | Dark/light theme switching                                    |
| **pnpm**                    | Fast, disk-efficient package manager                          |

---

## Architecture Highlights

### Route Groups (`src/app/`)

Three logical route groups separate concerns:

| Group      | Routes                          | Layout                 | Access                              |
| ---------- | ------------------------------- | ---------------------- | ----------------------------------- |
| `(app)`    | `/dashboard`, `/forms/*`        | Header + main content  | Authenticated only                  |
| `(auth)`   | `/login`, `/register`           | Minimal (theme toggle) | Redirects to dashboard if logged in |
| `(public)` | `/` (landing), `/forms/public/[id]` | Simple container    | No auth required                    |

### API Client (`src/lib/api.ts`)

- **`apiFetch(path, token?)`**: Authenticated requests with an explicit `accessToken`; the server-side dashboard also uses it via the session token.
- **`publicFetch(path)`**: Unauthenticated requests for public form viewing and submission.
- A shared `ApiError` class normalizes errors; on a `401` the client signs out and redirects to login (or `/api/auth/expired` server-side).

TypeScript types are generated from the backend's OpenAPI spec into `src/lib/api.types.ts`.

### AI Edit Tracking (`src/lib/editTracker.ts`)

Before each AI request, the current form state is compared to the previous snapshot. Detected changes (title/description edits, question modifications, add/remove operations, option changes) are formatted as structured text and prepended to the user's LLM prompt, providing context-aware conversational refinement. Questions that the AI just added are badged as **New** in the editor.

### JWT Token Refresh (`src/auth.ts`)

When a session token is about to expire, the next-auth JWT callback automatically refreshes it via the backend's `/api/v1/auth/token/refresh` endpoint before returning the session. This keeps users signed in transparently.

### CSS Variable Theming (`src/app/globals.css`)

All colors are defined as CSS custom properties on `:root` and `.dark`, ensuring every component is theme-aware without hardcoded color values. Tailwind v4's `@theme` directive maps these into utility classes.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated pages
│   │   ├── dashboard/            # Form list with create/delete flow
│   │   └── forms/
│   │       ├── new/              # AI-powered form builder
│   │       └── [id]/             # Form detail (summary + individual response tabs)
│   │           └── edit/         # Form editor
│   ├── (auth)/login, register/   # Authentication pages
│   ├── (public)/                 # Landing page + public form submission
│   │   └── forms/public/[id]/
│   └── api/auth/                 # NextAuth API route + expired-session handler
├── components/
│   ├── AiPromptBar.tsx           # Chat input for AI form generation
│   ├── FormCard.tsx              # Dashboard form card
│   ├── FormEditor.tsx            # Shared create/edit form editor
│   ├── FormQuestionCard.tsx      # Read-only question card for public forms
│   ├── QuestionCard.tsx          # Editable question component
│   ├── QuestionList.tsx          # Question list with add flow
│   ├── ResponseAnswers.tsx       # Renders a single response's answers
│   ├── SaveIndicator.tsx         # Save status indicator
│   ├── ShareButton.tsx           # Copy public link to clipboard
│   ├── TitleCard.tsx             # Editable title/description card
│   ├── ThemeToggle.tsx           # Dark/light toggle
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── api.ts                    # API fetch utilities + ApiError
│   ├── api.types.ts              # Generated OpenAPI types
│   ├── form.ts                   # Form API client functions
│   ├── public-form.ts            # Public form + submit API clients
│   ├── response.ts               # Responses API client
│   └── editTracker.ts            # AI edit diff detection
├── auth.ts                       # NextAuth configuration
└── proxy.ts                      # Middleware route protection
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm**: install via `npm install -g pnpm` or [corepack](https://nodejs.org/api/corepack.html)
- (Optional) A local instance of the [Formbrew backend](https://github.com/bruce-pain/AI-form-builder-be) — the app works with the deployed API out of the box

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
| [Formbrew (frontend)](https://github.com/bruce-pain/ai-form-builder-fe) | Next.js frontend deployed at [formbrew.vercel.app](https://formbrew.vercel.app) |
| [AI-form-builder-be](https://github.com/bruce-pain/AI-form-builder-be) | FastAPI backend with LLM integration, form CRUD, authentication, and response storage — deployed at [ai-form-builder-be.onrender.com](https://ai-form-builder-be.onrender.com) |
