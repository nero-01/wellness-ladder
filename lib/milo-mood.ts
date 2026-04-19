/**
 * Milo (mascot)–driven mood scale for Bite-Size Wellness Ladder.
 * Values 1–8 are stored in mood history and synced to `/api/mood` (max 8).
 * Legacy entries may still use 1–5 — use `resolveMiloMoodId`.
 */

export type MiloMoodId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Drives `Mascot` animation — keep in sync with `MascotState` in the mobile app */
export type MiloMascotDrive =
  | "idle"
  | "focused"
  | "encouraging"
  | "celebrating"
  | "sleepy"
  | "proud"
  | "supportive"
  | "reflective"
  | "stressed"

export type MiloMoodItem = {
  id: MiloMoodId
  label: string
  labelAf: string
  /** Short hint under the picker */
  hint: string
  hintAf: string
  mascot: MiloMascotDrive
}

export const MILO_MOOD_ITEMS: readonly MiloMoodItem[] = [
  {
    id: 1,
    label: "Happy",
    labelAf: "Gelukkig",
    hint: "Light, uplifted",
    hintAf: "Lig, opgewek",
    mascot: "celebrating",
  },
  {
    id: 2,
    label: "Calm",
    labelAf: "Kalm",
    hint: "Settled and steady",
    hintAf: "Bedarend en bestendig",
    mascot: "idle",
  },
  {
    id: 3,
    label: "Neutral",
    labelAf: "Neutraal",
    hint: "Even and open",
    hintAf: "Ewe en oop",
    mascot: "idle",
  },
  {
    id: 4,
    label: "Tired",
    labelAf: "Moeg",
    hint: "Low energy",
    hintAf: "Lae energie",
    mascot: "sleepy",
  },
  {
    id: 5,
    label: "Stressed",
    labelAf: "Gestres",
    hint: "Tight or overloaded",
    hintAf: "Opgespanne of oorlaai",
    mascot: "stressed",
  },
  {
    id: 6,
    label: "Proud",
    labelAf: "Trots",
    hint: "Accomplished",
    hintAf: "Bereik",
    mascot: "proud",
  },
  {
    id: 7,
    label: "Encouraging",
    labelAf: "Aanmoedigend",
    hint: "Looking forward",
    hintAf: "Sien uit",
    mascot: "encouraging",
  },
  {
    id: 8,
    label: "Reflective",
    labelAf: "Reflekterend",
    hint: "Thoughtful pause",
    hintAf: "Peinsende oomblik",
    mascot: "reflective",
  },
] as const

export function getMiloMoodItem(id: number): MiloMoodItem | undefined {
  return MILO_MOOD_ITEMS.find((m) => m.id === id)
}

/** Older logs used 1–5 emoji scale — map to closest Milo id for display. */
export function resolveMiloMoodId(stored: number): MiloMoodId {
  if (stored >= 1 && stored <= 8) return stored as MiloMoodId
  const legacy: Record<number, MiloMoodId> = {
    1: 4,
    2: 5,
    3: 5,
    4: 3,
    5: 1,
  }
  return legacy[stored] ?? 3
}

export function miloMoodLabel(id: number, locale: "en" | "af" = "en"): string {
  const m = getMiloMoodItem(resolveMiloMoodId(id))
  if (!m) return locale === "af" ? "Onbekend" : "Unknown"
  return locale === "af" ? m.labelAf : m.label
}

/** 1–5 wellbeing proxy for trend copy (not stored) — compares moods across days. */
const MILO_VALENCE: Record<MiloMoodId, number> = {
  1: 5,
  2: 5,
  3: 4,
  4: 2,
  5: 1,
  6: 5,
  7: 5,
  8: 4,
}

export function miloMoodValence(stored: number): number {
  const id = resolveMiloMoodId(stored)
  return MILO_VALENCE[id] ?? 3
}
