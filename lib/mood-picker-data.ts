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

/** Canonical list: emoji + codepoint hex for SVG paths */
export const MOOD_PICKER_FAMILY_ENTRIES = [
  "😢:1f622",
  "😔:1f614",
  "😐:1f610",
  "🙂:1f642",
  "😊:1f60a",
] as const

export const MOOD_PICKER_ITEMS: MoodPickerItem[] = [
  { family: "😢:1f622", label: "Sad", value: 1 },
  { family: "😔:1f614", label: "Down", value: 2 },
  { family: "😐:1f610", label: "Okay", value: 3 },
  { family: "🙂:1f642", label: "Good", value: 4 },
  { family: "😊:1f60a", label: "Great", value: 5 },
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

/** @deprecated Name refers to old Noto default — use emojiFamilySvgUrl */
export function moodFamilyNotoSvgUrl(emojiCode: string): string {
  return emojiFamilySvgUrl(emojiCode)
}

/** @deprecated Use emojiFamilySvgUrl */
export const emojiFamilyNotoSvgUrl = moodFamilyNotoSvgUrl

/** @deprecated Use moodSvgUrlFromFamily */
export function moodNotoSvgUrlFromFamily(family: string): string {
  return moodSvgUrlFromFamily(family)
}

/** Web / legacy: shape kept for `export { moods }` consumers */
export const moods = MOOD_PICKER_ITEMS.map((m) => ({
  value: m.value,
  label: m.label,
  code: parseMoodFamilyEntry(m.family).code,
}))
