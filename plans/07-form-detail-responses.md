# Phase 07 — Form Detail & Responses

## Goal
Pages to view a published form's details and responses at `/forms/[id]`, list responses at `/forms/[id]/responses`, and view individual responses at `/forms/[id]/responses/[responseId]`.

## Steps

### 1. Create route files

```
v2/src/app/(app)/forms/
└── [id]/
    ├── page.tsx                      ← form detail + summary/individual tabs
    ├── responses/
    │   ├── page.tsx                  ← response list
    │   └── [responseId]/
    │       └── page.tsx              ← single response detail
```

### 2. Form detail page (`/forms/[id]`)

Client component. Loads form + responses on mount.

**Sections**:
- **Header**: Back link to dashboard, form title, description, "Published" badge
- **Actions**: Share button (copies public link), Unpublish button, Delete button
- **Response count** badge
- **Tabbed view**:
  - **Summary tab**: Answers grouped by question. Text answers shown as list. Select answers shown as distribution (how many picked each option). "Show all" toggle if >10 answers per question.
  - **Individual tab**: Paginated responses. Each response shows answers one at a time. Prev/Next navigation. Go-to response by number.

**Components to create**:
```tsx
// src/components/ShareButton.tsx
// - Copies window.location.origin + /forms/public/[id] to clipboard
// - Shows "Copied!" feedback
```

### 3. Empty state

If no responses yet, show an empty state with the share button prominently displayed.

### 4. Response list page (`/forms/[id]/responses`)

Client component.

**Sections**:
- **Header**: Back link to form detail, form title, response count
- **List**: Each response card shows first answer snippet + submission date
- Clicking a response navigates to `/forms/[id]/responses/[responseId]`

### 5. Single response page (`/forms/[id]/responses/[responseId]`)

Client component.

**Sections**:
- **Header**: Back link to response list, form title, submission date
- **Answers**: Each question shown with its answer
  - Text: paragraph display
  - Select (single): label
  - Select (multiple): pill/badge chips
  - No answer: "(no answer)" in muted text

### 6. Data flow

All three pages need:
- `getForm(token, id)` — to get form questions (for question text labels in responses)
- `getFormResponses(token, id)` — list of responses
- `getFormResponse(token, id, responseId)` — single response detail

All fetched via `useEffect` + `useState` (KISS — no TanStack Query).

### 7. Verification

```bash
pnpm dev
```

- `/forms/[id]` shows form details with tabs
- Summary tab shows answer groupings
- Individual tab paginates through responses
- Share button copies link
- Unpublish redirects to edit page
- Delete removes form and redirects to dashboard
- `/forms/[id]/responses` lists responses
- `/forms/[id]/responses/[responseId]` shows single response

### 8. Files created

```
v2/src/app/(app)/forms/[id]/
├── page.tsx
├── responses/
│   ├── page.tsx
│   └── [responseId]/page.tsx

v2/src/components/
├── ShareButton.tsx
└── ResponseCard.tsx       ← optional, for individual response display
```
