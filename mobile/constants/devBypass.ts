/**
 * Dev-only affordances (bypass button, profile badge). Production builds set `__DEV__` to false.
 * Do not use fake `supabase.auth.setSession({ access_token: 'dev-token' })` — GoTrue rejects non-JWTs.
 * `auth.admin.createUser` belongs on a server with the service-role key only, never in the Expo app.
 */
export const IS_DEV_BYPASS = __DEV__
