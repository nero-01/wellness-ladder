import type { Task } from "@/lib/wellness-data"
import type { WellnessLocale } from "@/lib/wellness-locale"

/**
 * Hardcoded 7-day Afrikaans ladder (South Africa). Maps ladder day 1–7 → copy + durations.
 * Day 4 is a short mindful walk (manual timer).
 */
const AF_LADDER_DAYS: Record<
  number,
  { title: string; instruction: string; duration: number; timerMode?: Task["timerMode"]; manualMinSeconds?: number }
> = {
  1: {
    title: "Neem drie diep asemteue",
    instruction: "In... hou... uit.",
    duration: 30,
  },
  2: {
    title: "Dankbaarheid",
    instruction: "Noem drie dinge waarvoor jy dankbaar is.",
    duration: 60,
  },
  3: {
    title: "Arm strek",
    instruction: "Strek jou arms bo jou kop vir 30 sekondes.",
    duration: 30,
  },
  4: {
    title: "Kort stap",
    instruction:
      "Gaan stap vir 2 minute buite. Gebruik Begin stap / Stop stap om die tyd te meet.",
    duration: 120,
    timerMode: "manual",
    manualMinSeconds: 15,
  },
  5: {
    title: "Joernaal oor die wen",
    instruction: "Skryf een goeie ding van vandag neer.",
    duration: 30,
  },
  6: {
    title: "Bly gehidreer",
    instruction: "Drink 'n glas water stadig.",
    duration: 15,
  },
  7: {
    title: "Ontspan",
    instruction: "Sluit jou oë en ontspan vir 1 minuut.",
    duration: 60,
  },
}

/** Expo Speech + on-screen breathing cues */
export const SPEECH_LOCALE: Record<WellnessLocale, string> = {
  en: "en-US",
  af: "af-ZA",
}

export function getSpeechLocaleCode(locale: WellnessLocale): string {
  return SPEECH_LOCALE[locale]
}

/**
 * Apply Afrikaans copy for ladder days 1–7 when locale is `af`.
 * Day 8+ stays English until more copy is added (Pro unlocks extra SADAG tips, not extra task strings).
 */
export function localizeTaskForLocale(
  base: Task,
  ladderDay: number,
  locale: WellnessLocale,
): Task {
  if (locale !== "af") return base
  if (ladderDay < 1 || ladderDay > 7) return base

  const af = AF_LADDER_DAYS[ladderDay]
  if (!af) return base

  return {
    ...base,
    title: af.title,
    instruction: af.instruction,
    duration: af.duration,
    timerMode: af.timerMode ?? base.timerMode,
    manualMinSeconds: af.manualMinSeconds ?? base.manualMinSeconds,
  }
}

/** Map English breathing phase labels to Afrikaans for display + TTS */
export function localizeBreathingPhase(
  englishPhase: string | null,
  locale: WellnessLocale,
): string | null {
  if (!englishPhase || locale !== "af") return englishPhase
  if (englishPhase.startsWith("Breathe in")) return "Asem in..."
  if (englishPhase.startsWith("Hold")) return "Hou..."
  if (englishPhase.startsWith("Breathe out")) return "Asem uit..."
  return englishPhase
}
