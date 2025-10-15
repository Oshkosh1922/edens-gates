# Edens Gates

> Community trust layer for Magic Eden—collect founder submissions, run weekly voting, publish transparent winners, and manage rounds from a lightweight admin flow.

## Stack

- React 19 + Vite + TypeScript
- TailwindCSS for dark-mode UI (`egDark`, `egPurple`, `egPink` theme)
- Supabase (PostgreSQL, RLS, RPC) as the backend
- React Router for routing, component state for local data

## One-time setup (macOS)

```bash
# 1. Bootstrap the Vite + React + TS project
npm create vite@latest . -- --template react-ts

# 2. Install runtime dependencies
npm install react-router-dom @supabase/supabase-js

# 3. Install TailwindCSS toolchain
npm install -D tailwindcss postcss autoprefixer

# 4. (If the Tailwind CLI init step fails) create configs manually — already done in repo
```

After cloning the repository you only need:

```bash
npm install
```

## Environment variables

Create `.env.local` (Vercel will surface these as project env vars):

```bash
VITE_SUPABASE_URL="https://YOUR-PROJECT-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
```

## Develop locally

```bash
# Start the dev server
npm run dev

# Type check and build
npm run build

# Lint the project
npm run lint
```

The app exposes routes:

- `/` – landing page and CTAs
- `/submit` – founder submission form (Supabase insert)
- `/vote` – active founder voting (RPC + optimistic UI)
- `/winners` – historical winners grid
- `/admin` – approvals, activation, and winner publishing

## Deploying to Vercel

1. Push the repository to GitHub (or another Git provider Vercel can import).
2. In Vercel, create a new project and select the repo. Framework preset: **Vite**.
3. Build settings
  - Install command: `npm install`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Under *Routing*, enable **Single Page Application Fallback** so React Router routes resolve to `index.html`.
4. Environment variables (Project Settings → Environment Variables)
  - `VITE_SUPABASE_URL` → copy from Supabase *Project Settings → API*.
  - `VITE_SUPABASE_ANON_KEY` → same page.
5. Deploy.

After the first deploy, run these smoke tests:

- `/submit` — submit a test founder; verify a new pending row appears in Supabase.
- `/vote` — ensure the RPC-backed list renders and that voting increments counts.
- `/winners` — confirm the historical winners grid loads without errors.

### Common gotchas

- If deep links 404, re-check that the SPA fallback is enabled (Vercel Settings → General → Build & Output).
- Vercel pulls env vars per environment; populate Production **and** Preview if you deploy PRs.
- Supabase RLS must allow the actions you test; ensure the SQL policies above are applied before deploying.
- Clear the browser cache or use an incognito window after redeploys to avoid stale assets while iterating quickly.

## Supabase schema

Run the SQL block provided at the end of this document inside the Supabase SQL editor (or via `psql`) to provision tables, policies, RPCs, and sample data.

## Testing checklist

- Submit page inserts a new pending founder and surfaces inline success/error.
- Vote page uses the `get_active_founders_with_votes` RPC and writes a vote row while optimistically incrementing counts.
- Admin page approves/rejects pending founders, toggles round activity, and publishes winners (resets active founders).
- Winners page renders published history ordered newest first.
- `npm run build` succeeds locally (Vercel-compatible).

## Project structure

```
src/
  components/      # navigation + layout shell
  lib/             # Supabase client
  pages/           # route components
  types/           # Supabase row typings
```

## Next steps

- Add RLS-hardening policies (rate limiting, wallet validation once available).
- Replace the vote IP hash stub with an Edge Function hashing the real client IP.
- Wire Supabase Storage for richer founder media.
