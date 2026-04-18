/**
 * Mood ladder + task icons — SVGs via Emoji Family (shared by Next + Expo).
 * Default pack is **Microsoft Fluent 3D** so artwork reads intentional and premium,
 * not like the OS emoji font.
 * @see https://www.emoji.family/developers — packs: fluent, fluentflat, noto, twemoji, …
 */

export type MoodPickerItem = {
  value: number
  label: string
  /** Format `grapheme:hex` (e.g. `😊:1f60a`) for emoji.family */
  family: string
}

/** Canonical list: emoji + codepoint hex — Noto SVG via `emojiFamilySvgUrl(..., "noto")` */
export const MOOD_PICKER_FAMILY_ENTRIES = [
  "😊:1f60a",
  "😐:1f610",
  "😟:1f61f",
  "😠:1f620",
  "😢:1f622",
] as const

/** Values 5 = most positive … 1 = lowest — matches API `mood` 1–5 scale (high = better wellbeing). */
export const MOOD_PICKER_ITEMS: MoodPickerItem[] = [
  { family: "😊:1f60a", label: "Great", value: 5 },
  { family: "😐:1f610", label: "Neutral", value: 4 },
  { family: "😟:1f61f", label: "Worried", value: 3 },
  { family: "😠:1f620", label: "Angry", value: 2 },
  { family: "😢:1f622", label: "Sad", value: 1 },
]

export function parseMoodFamilyEntry(family: string): { code: string } {
  const parts = family.split(":")
  const raw = (parts[1] ?? parts[0] ?? "").trim()
  return { code: raw.toLowerCase() }
}

/** Used everywhere we show emoji art in the app (mood + ladder tasks). */
export const EMOJI_FAMILY_DEFAULT_PACK = "fluent" as const

export type EmojiFamilyPack =
  | "noto"
  | "twemoji"
  | "openmoji"
  | "blobmoji"
  | "fluent"
  | "fluentflat"

export function emojiFamilySvgUrl(
  emojiCode: string,
  pack: EmojiFamilyPack = EMOJI_FAMILY_DEFAULT_PACK,
): string {
  const code = emojiCode.toLowerCase().replace(/^u\+/i, "")
  return `https://www.emoji.family/api/emojis/${code}/${pack}/svg`
}

export function moodSvgUrlFromFamily(family: string): string {
  return emojiFamilySvgUrl(parseMoodFamilyEntry(family).code)
}

/** Noto SVGs for mood row (premium, consistent look). */
export function moodNotoSvgUrlFromFamily(family: string): string {
  return emojiFamilySvgUrl(parseMoodFamilyEntry(family).code, "noto")
}

/** @deprecated Name refers to old Noto default — use emojiFamilySvgUrl */
export function moodFamilyNotoSvgUrl(emojiCode: string): string {
  return emojiFamilySvgUrl(emojiCode)
}

/** @deprecated Use emojiFamilySvgUrl */
export const emojiFamilyNotoSvgUrl = moodFamilyNotoSvgUrl

/** Web / legacy: shape kept for `export { moods }` consumers */
export const moods = MOOD_PICKER_ITEMS.map((m) => ({
  value: m.value,
  label: m.label,
  code: parseMoodFamilyEntry(m.family).code,
}))
