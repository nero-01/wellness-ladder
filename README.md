# Bite-Size Wellness Ladder

Daily micro-tasks, mood tracking, streaks, optional voice (Whisper), and hooks for AI personalization. This repo is a **Next.js (App Router)** web app at the root plus an **Expo** mobile app under `mobile/`, with **Supabase Auth**, **PostgreSQL** (hosted on Supabase), and **Prisma** for app data.

**Repository:** [github.com/nero-01/wellness-ladder](https://github.com/nero-01/wellness-ladder)

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Web UI | Next.js 15 (App Router), React 19, Tailwind CSS, Radix UI |
| Mobile | Expo Router, React Native (`mobile/`) |
| Auth | Supabase Auth (email/password); web uses `@supabase/ssr` cookies; mobile uses `@supabase/supabase-js` + AsyncStorage |
| Database | PostgreSQL on Supabase; Prisma (`prisma/schema.prisma`) — `users.id` matches `auth.users.id` |
| API | Next.js Route Handlers under `app/api/*` |
| Cron | `GET /api/cron/daily-tasks` (protect with `CRON_SECRET`; see `vercel.json`) |
| Edge | Supabase Function `personalize` (stub); Next proxies via `POST /api/ai/personalize` |

---

## Repository layout

```
app/                    # Next.js routes (pages + app/api/*)
components/             # Shared UI
hooks/                  # React hooks
lib/                    # Auth, Supabase clients, wellness data, utilities
  auth.tsx              # Web auth + mock mode when Supabase env is unset
  supabase/             # browser.ts, server.ts, middleware helpers
mobile/                 # Expo app (separate package.json)
prisma/                 # Schema + migrations
supabase/               # CLI config + Edge Functions (e.g. functions/personalize/)
docs/context/           # Agent / architecture notes (AGENT-CONTEXT.md)
```

Detailed path map: see `docs/context/AGENT-CONTEXT.md`.

---

## Prerequisites

- **Node.js** (LTS recommended)
- **npm** (lockfile: `package-lock.json`)
- **Supabase project** (for production-like auth and DB) — optional for quick web UI-only exploration (see [Local login without Supabase](#local-login-without-supabase-web-only))

---

## Environment variables

1. Copy the root template:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in at minimum:

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
   | `DATABASE_URL` | Postgres connection string (Supabase → Settings → Database) |
   | `CRON_SECRET` | Random string; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` |
   | `OPENAI_API_KEY` | Optional; for real Whisper in `POST /api/voice/transcribe` |

3. **Mobile** (`mobile/`):

   ```bash
   cp mobile/.env.example mobile/.env
   ```

   Set `EXPO_PUBLIC_SUPABASE_*` to match the web app, and `EXPO_PUBLIC_API_URL` to your deployed Next.js origin (no trailing slash) for Prisma-backed APIs.

`.env.local` and `mobile/.env` are gitignored — never commit secrets.

---

## Local development

### Web (Next.js)

```bash
npm install
npm run db:generate
npm run db:migrate    # requires DATABASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Mobile (Expo)

The Expo app lives in **`mobile/`** — it is separate from the Next.js web app. Changes under `app/` and `components/` at the repo root **do not** apply to Expo; edit files under `mobile/` (e.g. `mobile/app/(auth)/`).

```bash
cd mobile && npm install && npx expo start
```

From the repo root you can run:

```bash
npm run mobile:start
# or clear Metro cache:
npm run mobile:start:clear
```

Native modules used include **expo-haptics** and **expo-av**.

---

## Local login without Supabase (web only)

When **`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set** (or left empty), the **web** app runs in **mock auth** mode: sign-in does not call Supabase; it stores a fake user in the browser.

### Where to customize the seed profile

| What | Where |
|------|--------|
| Default mock user fields (`id`, `email`, `name`, `isPremium`, etc.) | **`lib/auth.tsx`** — constant **`MOCK_USER`** |
| Sign-in behavior (how email/password map to the stored user) | **`lib/auth.tsx`** — `signIn` / `signUp` when `!isSupabaseConfigured()` |
| Persisted session key in `localStorage` | **`lib/auth.tsx`** — **`AUTH_STORAGE_KEY`** (default `"wellness-auth-user"`) |

To “pre-seed” a session without signing in, you can set **`localStorage`** in DevTools to a JSON string matching the `User` shape from `lib/auth.tsx` under key **`wellness-auth-user`**, then reload.

**Supabase detection** is implemented in **`lib/supabase/browser.ts`** (`isSupabaseConfigured()`). To use mock mode, omit or clear the `NEXT_PUBLIC_SUPABASE_*` variables in `.env.local` and restart `npm run dev`.

### Mobile

The Expo app **`mobile/contexts/AuthContext.tsx`** expects Supabase to be configured (`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`). There is no mock sign-in path on native; configure Supabase (or extend the mobile auth context) for device login.

---

## Database

- **Schema:** `prisma/schema.prisma` (`User`, `MoodLog`, `UserTask`, …)
- **Migrations:** `prisma/migrations/`
- **Bootstrap:** authenticated users get a `public.users` row via `POST /api/users/bootstrap`

There is no checked-in Prisma **seed** script today; for repeatable DB seed data, add a `prisma/seed.ts` and wire `"prisma": { "seed": "..." }` in `package.json` if you want `npx prisma db seed` (coordinated with production merge policy).

---

## API overview (selected)

| Route | Role |
|-------|------|
| `POST /api/users/bootstrap` | Ensures a `users` row for the current Supabase user |
| `GET/POST` … `/api/mood`, `/api/tasks` | Mood and task data (authenticated) |
| `GET /api/cron/daily-tasks` | Cron; requires secret header |
| `POST /api/voice/transcribe` | Voice → text (optional OpenAI) |
| `POST /api/ai/personalize` | Proxies to Supabase Edge Function |

Server-side auth resolution: **`lib/api-auth.ts`** (`requireUser`) — cookies (web) or `Authorization: Bearer <JWT>` (mobile).

---

## Production notes

- Deploy Next.js (e.g. Vercel); set env vars in the host dashboard.
- Configure Supabase **Authentication → URL configuration** for your production (and dev) origins.
- Treat this repo as a **development build** that merges with production: prefer additive DB changes and backward-compatible APIs (`docs/context/AGENT-CONTEXT.md`).

---

## License

Private / as specified by the repository owner.
