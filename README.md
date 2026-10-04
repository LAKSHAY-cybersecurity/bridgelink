# Bridge Link

BridgeLink is a unified platform that bridges the gap between opportunities and people. It provides a streamlined interface for discovery, engagement, and completion tracking — all in one place.

Bridge Link is a React + Vite + TypeScript web application scaffolded with shadcn/ui and TailwindCSS. It integrates with Supabase for backend services (auth, database, and serverless functions) and uses Radix UI primitives, TanStack Query, and several utility libraries to provide a fast, accessible dashboard and landing experience.

## Key Features

- **Authentication**: Supabase-backed auth flow and protected routes for users and admins.
- **Dashboard**: User dashboard with analytics, messaging, profile and marketplace pages.
- **Admin Panel**: Management routes and protected admin area.
- **Realtime & Background**: Supabase functions and migrations included under `supabase/`.
- **UI primitives**: Built with Radix UI components and shadcn-style patterns for consistent UI.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn components
- **UI primitives**: Radix UI, Lucide icons, Framer Motion
- **Data fetching**: @tanstack/react-query
- **Backend / BaaS**: Supabase (see `supabase/`)
- **Testing**: Vitest

## Repo Structure (high level)

- `src/` — Application source code (pages, components, context, hooks, integrations)
	- See [src/App.tsx](src/App.tsx) and [src/main.tsx](src/main.tsx) for app entry and routing.
- `supabase/` — Supabase project files: `config.toml`, serverless `functions/`, and SQL `migrations/`.
- `public/` — Static assets served by Vite.
- `package.json` — Scripts and dependencies.

## Getting Started

Prerequisites:

- Node.js (recommended v18+)
- npm (or bun/pnpm if you prefer, but scripts use `npm` in examples)

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run tests:

```bash
npm run test
```

## Environment & Supabase

This project expects Supabase keys and config to be provided via environment variables when running locally or in a deployed environment. Typical env vars you'll need:

- `VITE_SUPABASE_URL` 
- `VITE_SUPABASE_ANON_KEY` 

The repository contains a `supabase/` directory with `functions/` and migration SQL files — use the Supabase CLI to run or deploy these if needed.

## Important Files

- [src/App.tsx](src/App.tsx) — Application root and route definitions
- [src/main.tsx](src/main.tsx) — React entrypoint
- [supabase/config.toml](supabase/config.toml) — Local Supabase config
- [package.json](package.json) — Scripts and dependency list

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production assets
- `npm run preview` — Preview build locally
- `npm run lint` — Run ESLint
- `npm run test` — Run tests (Vitest)
