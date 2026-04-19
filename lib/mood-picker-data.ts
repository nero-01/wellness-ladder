/**
 * Shared helpers: **task** icons use Emoji Family SVGs; **mood** check-in uses
 * `MILO_MOOD_ITEMS` + `emojiFamily` from `lib/milo-mood.ts` (Noto SVGs).
 * @see https://www.emoji.family/developers
 */

import { MILO_MOOD_ITEMS } from "./milo-mood"

export {
  getMiloMoodItem,
  resolveMiloMoodId,
  miloMoodLabel,
  miloMoodValence,
  MILO_MOOD_ITEMS,
  type MiloMascotDrive,
  type MiloMoodId,
  type MiloMoodItem,
} from "./milo-mood"

export type EmojiFamilyPack =
  | "noto"
  | "twemoji"
  | "openmoji"
  | "blobmoji"
  | "fluent"
  | "fluentflat"

/** Used everywhere we show emoji art for **tasks** (not mood). */
export const EMOJI_FAMILY_DEFAULT_PACK = "fluent" as const

export function emojiFamilySvgUrl(
  emojiCode: string,
  pack: EmojiFamilyPack = EMOJI_FAMILY_DEFAULT_PACK,
): string {
  const code = emojiCode.toLowerCase().replace(/^u\+/i, "")
  return `https://www.emoji.family/api/emojis/${code}/${pack}/svg`
}

export function parseMoodFamilyEntry(family: string): { code: string } {
  const parts = family.split(":")
  const raw = (parts[1] ?? parts[0] ?? "").trim()
  return { code: raw.toLowerCase() }
}

/** @deprecated Name refers to old Noto default — use emojiFamilySvgUrl */
export function moodFamilyNotoSvgUrl(emojiCode: string): string {
  return emojiFamilySvgUrl(emojiCode)
}

/** @deprecated Use emojiFamilySvgUrl */
export const emojiFamilyNotoSvgUrl = moodFamilyNotoSvgUrl

export function moodSvgUrlFromFamily(family: string): string {
  return emojiFamilySvgUrl(parseMoodFamilyEntry(family).code)
}

/** Noto SVGs — retained for any legacy `family` strings in data. */
export function moodNotoSvgUrlFromFamily(family: string): string {
  return emojiFamilySvgUrl(parseMoodFamilyEntry(family).code, "noto")
}

/** Web / legacy: `{ value, label }` for Milo ids 1–8 */
export const moods = MILO_MOOD_ITEMS.map((m) => ({
  value: m.id,
  label: m.label,
}))
