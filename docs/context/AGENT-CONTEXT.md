# Agent context — Bite-Size Wellness Ladder

## Product

Next.js wellness app: daily micro-tasks, mood tracking, streaks, optional voice (Whisper stub), and AI personalization hooks.

## Backend stack

- **Auth:** Supabase Auth (email/password). Session cookies via `@supabase/ssr`.
- **Data:** PostgreSQL on Supabase; **Prisma** for app tables (`users`, `mood_logs`, `user_tasks`). `users.id` matches `auth.users.id`.
- **API:** Next.js Route Handlers under `app/api/*`. User identity comes from `requireUser()` (server Supabase client), not from client-supplied IDs.
- **Cron:** `GET /api/cron/daily-tasks` — protect with `Authorization: Bearer CRON_SECRET` (see `vercel.json`).
- **Edge:** Supabase Function `personalize` (stub); Next proxies via `POST /api/ai/personalize`.

## Docker / merge constraints

Treat this as a **development build** that merges with production: avoid breaking schema changes without a coordinated migration; prefer additive migrations and backward-compatible API changes.

## Local setup

1. Copy `.env.example` → `.env.local` and fill Supabase + `DATABASE_URL`.
2. `npm install` → `npm run db:generate` → `npm run db:migrate` (against Supabase).
3. `npm run dev`

If `npm install` fails with `ENOSPC`, free disk space first.

## Key paths

| Area        | Path |
|------------|------|
| Prisma     | `prisma/schema.prisma`, `prisma/migrations/` |
| Supabase UI | `lib/supabase/*`, `middleware.ts` |
| Auth UI    | `lib/auth.tsx`, `app/sign-in`, `app/sign-up` |
| Edge fn    | `supabase/functions/personalize/` |
