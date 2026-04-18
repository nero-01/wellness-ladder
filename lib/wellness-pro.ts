/** Pro / bonus UI — set via env (web + Expo). */

export function isWellnessPro(): boolean {
  if (typeof process === "undefined") return false
  if (process.env.NEXT_PUBLIC_WELLNESS_PRO === "true") return true
  if (process.env.EXPO_PUBLIC_WELLNESS_PRO === "true") return true
  return false
}
