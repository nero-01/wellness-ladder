# Agent context — Bite-Size Wellness Ladder

## Product

Wellness app: daily micro-tasks, mood tracking, streaks, optional voice (Whisper), and AI personalization hooks.

- **Primary client:** Expo Router app in **`mobile/`** (iOS/Android / Expo Go). Supabase session in **AsyncStorage** when using real auth; **mock auth** stores a dev user in AsyncStorage (`EXPO_PUBLIC_USE_MOCK_AUTH` or missing/invalid anon JWT — see `mobile/lib/supabase.ts`, `mobile/contexts/AuthContext.tsx`).
- **Web + API:** Next.js (App Router) at repo root. Mobile calls the deployed Next API with **`Authorization: Bearer <access_token>`** when `EXPO_PUBLIC_API_URL` is set.

## Backend stack

- **Auth:** Supabase Auth (email/password). Web uses cookies via `@supabase/ssr`. Mobile uses `@supabase/supabase-js` + AsyncStorage.
- **Data:** PostgreSQL on Supabase; **Prisma** for app tables (`users`, `mood_logs`, `user_tasks`). `users.id` matches `auth.users.id`.
- **API:** Next.js Route Handlers under `app/api/*`. `requireUser(request)` accepts **cookies** or **`Authorization: Bearer`** for the same Supabase JWT (needed for React Native).
- **Cron:** `GET /api/cron/daily-tasks` — protect with `Authorization: Bearer CRON_SECRET` (see `vercel.json`).
- **Edge:** Supabase Function `personalize` (stub); Next proxies via `POST /api/ai/personalize`.

## Docker / merge constraints

Treat this as a **development build** that merges with production: avoid breaking schema changes without a coordinated migration; prefer additive migrations and backward-compatible API changes.

## Local setup

### Web (Next.js)

1. Copy `.env.example` → `.env.local` and fill Supabase + `DATABASE_URL`.
2. `npm install` → `npm run db:generate` → `npm run db:migrate` (against Supabase).
3. `npm run dev`

### Mobile (Expo)

1. `cd mobile` → copy `mobile/.env.example` → `mobile/.env`. For local UI without Supabase, set **`EXPO_PUBLIC_USE_MOCK_AUTH=true`** (optional fixed credentials via `EXPO_PUBLIC_MOCK_DEV_*`). For real auth, use a JWT anon key (`eyJ…`) and create a user in Supabase.
2. Set **`EXPO_PUBLIC_API_URL`** to your deployed Next origin (e.g. Vercel), no trailing slash — used for `/api/users/bootstrap` and other Prisma-backed routes (skip if only testing mock auth offline).
3. `npm install` → `npx expo start -c` → Expo Go or simulator.

Native modules in use: **`expo-haptics`**, **`expo-av`** (playback + mic recording).

## Key paths

| Area        | Path |
|------------|------|
| Prisma     | `prisma/schema.prisma`, `prisma/migrations/` |
| Supabase (web) | `lib/supabase/*`, `middleware.ts` |
| Supabase (mobile) | `mobile/lib/supabase.ts`, `mobile/contexts/AuthContext.tsx` |
| Auth UI (web)    | `lib/auth.tsx`, `app/sign-in`, `app/sign-up` |
| Auth UI (native) | `mobile/app/(auth)/` |
| Mobile navigation | `mobile/app/index.tsx` (auth gate), `mobile/app/_layout.tsx` (`useProtectedRoute`) |
| Edge fn    | `supabase/functions/personalize/` |
