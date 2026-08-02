# Phase 00 — Scaffold

## Goal
Create the `v2/` directory with a fresh Next.js 16 project and all dependencies installed, move current code into `v1/`, and set up the workspace so `v2/` is the only app that runs.

## Steps

### 1. Move existing code into `v1/`

```bash
mkdir -p v1
# Move everything except .git, .next, node_modules, plans, and v2 (if it exists)
git mv src public next.config.ts tsconfig.json package.json pnpm-lock.yaml pnpm-workspace.yaml postcss.config.mjs eslint.config.mjs next-env.d.ts tsconfig.tsbuildinfo AGENTS.md CLAUDE.md README.md .env.local v1/
# Move non-tracked files too
mv openapi.json skills-lock.json v1/
# .gitignore stays at root
# AGENTS.md and CLAUDE.md were already moved — keep copies at root if desired
```

### 2. Create `v2/` directory and scaffold Next.js

```bash
mkdir -p v2
cd v2
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-pnpm
```

This gives you a clean `v2/` with: `src/app/`, `src/app/layout.tsx`, `src/app/page.tsx`, `tsconfig.json`, `postcss.config.mjs`, `next.config.ts`, `package.json`, `eslint.config.mjs`.

### 3. Update root `pnpm-workspace.yaml`

```yaml
packages:
  - "v1"
  - "v2"
```

### 4. Update root `package.json`

The root package.json should only have a `dev` script pointing to v2:
```json
{
  "name": "ai-form-builder",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter v2 dev",
    "build": "pnpm --filter v2 build",
    "lint": "pnpm --filter v2 lint"
  }
}
```

### 5. Install v2 dependencies

```bash
pnpm --filter v2 add next-auth@5.0.0-beta.31 next-themes lucide-react @vercel/analytics
```

### 6. Initialize shadcn/ui in v2

```bash
cd v2
pnpm dlx shadcn@latest init
```

When prompted:
- **Style**: Default
- **Base color**: Neutral (we'll customize later)
- **CSS variables**: Yes
- **Tailwind prefix**: (empty)
- **React query**: No
- **Components directory**: `src/components/ui`
- **Utils path**: `src/lib/utils`
- **Alias imports**: `@/` for all

### 7. Install shadcn primitive components we'll need

```bash
cd v2
pnpm dlx shadcn@latest add button input card dialog tabs select switch textarea badge dropdown-menu label separator sheet
```

### 8. Copy `.env.local` from v1

```bash
cp v1/.env.local v2/.env.local
```

### 9. Set up root `.gitignore`

```
node_modules/
.next/
*.tsbuildinfo
.env.local
```

### 10. Verify

```bash
pnpm install
pnpm dev    # should start on localhost:3000 with the default Next.js page
```

## Notes
- The old `src/`, `public/`, etc. now live in `v1/` as a reference.
- Any code you want to borrow from the prototype can be copied from `v1/` into `v2/`.
- `openapi.json` is in `v1/` — we'll reference it in phase 02.
