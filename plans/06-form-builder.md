# Phase 06 — Form Builder

## Goal

The core feature: pages at `/forms/new` (create) and `/forms/[id]/edit` (edit existing). These include AI-powered form generation via chat, editable questions, manual save, publish, and delete.

## Scope

| Feature | Included |
|---|---|
| Core editing UI (title, description, text/select questions, add/delete) | Yes |
| AI-powered chat prompt bar with conversation + edit context | Yes |
| Manual save (no auto-save) | Yes |
| Publish | Yes |
| Delete with confirmation | Yes |
| Auto-save / save status indicator | No |
| `beforeunload` unsaved warning | No |
| Change summary pill after AI generation | No |
| Rate-limit cooldown UI | No |
| Loading skeletons | No |
| Keyboard shortcuts / focus management | No |
| Responsive / accessibility polish sections | No |

## Phases

| Phase | What |
|---|---|
| **06.01** | Shared lib (`form.ts`, `editTracker.ts`) + route stubs |
| **06.02** | Core editing UI — functional requirements for all interactive elements |
| **06.03** | Create + Edit pages — wire everything together with manual save, publish, delete, AI |

## Depends on

- Phase 00 (scaffold)
- Phase 02 (infrastructure — `api.ts`, `api.types.ts`, auth, layouts)
- Phase 05 (dashboard — form list, `FormCard`)
