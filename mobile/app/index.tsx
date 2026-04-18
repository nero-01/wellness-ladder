import { Redirect } from "expo-router"

/**
 * Root `/` must render something. We send users to tabs; `useProtectedRoute` in
 * `app/_layout.tsx` redirects unauthenticated sessions to sign-in.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />
}
