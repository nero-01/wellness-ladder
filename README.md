# Bite-Size Wellness Ladder

Daily micro-tasks, mood tracking, streaks, optional voice (Whisper), and hooks for AI personalization.

**Primary product:** **Expo (React Native)** in **`mobile/`** — run in **Expo Go** or a dev build.  
**Backend / data:** **Next.js** API routes at the repo root (`app/api/*`), **Supabase Auth**, **PostgreSQL** on Supabase, **Prisma** for app tables.

**Repository:** [github.com/nero-01/wellness-ladder](https://github.com/nero-01/wellness-ladder)

---

## Quick start — mobile (Expo)

```bash
cd mobile
npm install
cp .env.example .env          # optional: mock auth without Supabase (see below)
npx expo start -c
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for simulator.

From the **repo root** (shortcut):

```bash
npm install
npm run mobile:start          # expo start in mobile/
npm run mobile:start:clear    # metro cache clear + start
```

**Important:** UI and auth for the app you open in Expo live under **`mobile/`** (`mobile/app/`, `mobile/contexts/`, …). The Next.js `app/` folder is the **web + API** layer, not the Expo UI.

---

## Mobile environment variables (`mobile/.env`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon **JWT** from Supabase → Settings → API (starts with **`eyJ`**). Publishable keys (`sb_publishable_…`) do **not** work for password login. |
| `EXPO_PUBLIC_API_URL` | Deployed Next.js origin (no `/`), e.g. `https://your-app.vercel.app` — used for `/api/users/bootstrap`, mood/tasks, etc. |
| `EXPO_PUBLIC_USE_MOCK_AUTH` | Set to `true` to force **mock auth** (no Supabase calls) for local development. |
| `EXPO_PUBLIC_MOCK_DEV_EMAIL` / `EXPO_PUBLIC_MOCK_DEV_PASSWORD` | Optional; if **both** set, mock sign-in only accepts this pair. |

You can also keep a single **root** `.env` / `.env.local` with `NEXT_PUBLIC_*`; `mobile/app.config.js` maps them to `EXPO_PUBLIC_*` when the Expo-specific vars are unset.

After any env change: **`cd mobile && npx expo start -c`**.

---

## Mock auth (Expo) — seed user & password

Use mock mode while you have no Supabase user or only a publishable key:

1. In **`mobile/.env`** add: `EXPO_PUBLIC_USE_MOCK_AUTH=true`
2. Restart Metro with cache clear: `npx expo start -c`
3. Sign in with **any email/password** (unless you set both `EXPO_PUBLIC_MOCK_DEV_*` — then only that pair works).

**Where to change default mock profile** (name, id, `isPremium`, etc.):

- **`mobile/contexts/AuthContext.tsx`** — constant **`MOCK_USER`**

Persisted mock session is stored in **AsyncStorage** under key **`wellness-auth-user`** (same idea as the web app’s `localStorage` key).

---

## Next.js (web + API)

Optional browser UI and required for hosted APIs Prisma talks to:

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:migrate    # needs DATABASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Web auth mock lives in **`lib/auth.tsx`**; behavior mirrors mobile when `NEXT_PUBLIC_USE_MOCK_AUTH` / missing JWT key — see **`.env.example`** at the root.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Mobile | Expo Router, React Native (`mobile/`) |
| Web UI | Next.js 15 (App Router), React 19, Tailwind, Radix UI |
| Auth | Supabase email/password; mobile: `@supabase/supabase-js` + AsyncStorage; web: `@supabase/ssr` cookies |
| Database | PostgreSQL (Supabase); Prisma — `users.id` matches `auth.users.id` |
| API | `app/api/*` — mobile calls with `Authorization: Bearer` + `EXPO_PUBLIC_API_URL` |

---

## Mobile navigation & auth flow

1. **`app/index.tsx`** — Waits for `AuthProvider` (`isLoaded`), then **redirects** to `/(auth)/sign-in` or **`/(tabs)`**. Shows a spinner while the session is restored (Supabase AsyncStorage or mock AsyncStorage).
2. **`app/_layout.tsx`** — `useProtectedRoute()` uses **`usePathname()`** so unauthenticated users cannot stay on tab screens (e.g. deep links), and signed-in users are moved out of auth screens after login.
3. **`(auth)/`** — Sign-in / sign-up stacks.
4. **`(tabs)/`** — Home, Task, Profile after authentication.

Mock and real sessions share the same navigation rules; sign-in/sign-up rely on the layout effect to navigate to tabs (no duplicate `router.replace` in forms).

---

## Repository layout

```
mobile/                 # ★ Expo app (screens, AuthContext, Metro)
  app/                  # Expo Router routes
  contexts/AuthContext.tsx   # Mobile auth + mock mode
  lib/supabase.ts       # Client + isSupabaseConfigured()
app/                    # Next.js pages + API routes
lib/auth.tsx            # Web auth + mock mode
prisma/                 # Schema + migrations
supabase/               # Edge functions / CLI
docs/context/AGENT-CONTEXT.md
```

---

## API overview (selected)

| Route | Role |
|-------|------|
| `POST /api/users/bootstrap` | `public.users` row for current Supabase user |
| `/api/mood`, `/api/tasks` | Mood and tasks (authenticated) |

Server auth: **`lib/api-auth.ts`** — cookies (web) or `Authorization: Bearer` (mobile).

---

## Production notes

- Deploy Next.js (e.g. Vercel); set env in the host dashboard. Point **`EXPO_PUBLIC_API_URL`** at that URL for production mobile builds.
- Supabase **Authentication → URL configuration** for your deployed origins.
- Prefer additive DB migrations when merging with production (`docs/context/AGENT-CONTEXT.md`).

---

## License

Private / as specified by the repository owner.
