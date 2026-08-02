# Phase 09 — Cleanup

## Goal
Final cleanup: remove the `plans/` directory, remove the `v1/` reference from the workspace, run a final production build to make sure everything compiles cleanly, and confirm the frontend works end-to-end.

## Steps

### 1. Run final production build

```bash
pnpm build
```

Fix any TypeScript errors, lint warnings, or build failures.

### 2. Test the full flow end-to-end

Manual smoke test:

1. `pnpm dev` starts without errors
2. Landing page at `/` renders
3. Register a new account at `/register`
4. Log in at `/login`
5. Dashboard at `/dashboard` shows empty state
6. Create a new form at `/forms/new`
7. Add a question manually
8. Use the AI chat to generate questions
9. Save the form
10. Edit the form at `/forms/[id]/edit`
11. Publish the form
12. View form detail at `/forms/[id]` — see responses (should be empty)
13. Copy share link
14. Open the public form link in incognito — fill and submit
15. Go back to form detail — see the response in summary and individual tabs
16. View response list and individual response detail
17. Unpublish the form
18. Delete the form

### 3. Remove the `plans/` directory

```bash
rm -rf plans/
```

### 4. Remove `v1/` from pnpm workspace (optional)

If you no longer need the `v1/` reference, update `pnpm-workspace.yaml`:

```yaml
packages:
  - "v2"
```

### 5. Final commit

```bash
git add -A
git commit -m "redesign: rebuild frontend from scratch"
```

## Done

The new frontend is now the only app in the repo. The `v1/` directory still exists on the `redesign` branch for reference, and once the branch is merged, it can be deleted.
