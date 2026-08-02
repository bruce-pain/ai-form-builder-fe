# Phase 08 — Public Form Submission

## Goal
The public-facing form submission page at `/forms/public/[id]` — no auth required, anyone can view and submit a published form. All questions are shown on a single page as a regular form.

## Steps

### 1. Add missing UI primitives

No `radio-group` or `checkbox` components exist yet (radix-ui is already a dependency). Add via shadcn:

```
v2/src/components/ui/radio-group.tsx  # single-select questions
v2/src/components/ui/checkbox.tsx     # multi-select questions
```

### 2. Create route file

```
v2/src/app/(public)/forms/
└── public/
    └── [id]/
        └── page.tsx
```

Client component. The `proxy.ts` already allows `/forms/public/` without auth.

### 3. Public form page (regular form)

Loads the published form on mount, renders all questions on one scrollable page.

**States**:

1. **Loading** — centered spinner while fetching the form
2. **Error** — friendly message if the form is not found / not published
3. **Form view**
   - Header with form title and description
   - All questions stacked and numbered
   - Input based on `answer_type`:
     - `text`: `Textarea` (auto-resizes via `field-sizing-content`)
     - `select` (single): `RadioGroup` with the options
     - `select` (multiple): `Checkbox` group with the options
   - Required questions marked with `*`
   - Required validation on submit with inline error messages; focus/scroll to first invalid field
   - Submit button at the bottom, disabled with spinner while submitting
4. **Confirmation screen**
   - "Response submitted" message
   - "Submit another response" button that resets the form state and shows the form again

### 4. Data flow

New lib file `v2/src/lib/public-form.ts` using `publicFetch`:

- `getPublicForm(id)` → `GET /api/v1/forms/public/{form_id}` (no auth)
- `submitFormResponse(id, answers)` → `POST /api/v1/forms/{form_id}/responses` with `{ answers: ResponseAnswerInput[] }` (no auth)

Answer mapping from local state to `ResponseAnswerInput`:
- `text`: `{ question_id, answer_type: "text", text_answer }`
- `select`: `{ question_id, answer_type: "select", select_answer: [...] }`

### 5. Verification

```bash
pnpm dev
```

- Navigate to `/forms/public/[id]` for a published form
- See title/description and all questions on one page
- Empty submit shows inline required errors
- Fill required fields, submit, see confirmation
- Try submitting with no auth (should work)
- Use "Submit another response" to reset and refill

### 6. Files created

```
v2/src/components/ui/checkbox.tsx
v2/src/components/ui/radio-group.tsx
v2/src/lib/public-form.ts
v2/src/app/(public)/forms/public/[id]/page.tsx
```
