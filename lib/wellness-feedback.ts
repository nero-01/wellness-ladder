"use client"

/**
 * Lightweight “feel” layer for web: short synthesized tones + optional vibration.
 * Keeps volume low so the app has a recognizable, calm sonic fingerprint.
 */

let ctx: AudioContext | null = null

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

async function getContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === "suspended") {
    try {
      await ctx.resume()
    } catch {
      return ctx
    }
  }
  return ctx
}

function shortBeep(
  frequencyHz: number,
  durationMs: number,
  volume = 0.06,
  when = 0,
): void {
  if (prefersReducedMotion()) volume *= 0.35
  void getContext().then((c) => {
    if (!c) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = "sine"
    osc.frequency.value = frequencyHz
    const t = c.currentTime + when
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + durationMs / 1000 + 0.02)
  })
}

function vibrate(pattern: number | number[]): void {
  if (prefersReducedMotion()) return
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  navigator.vibrate(pattern)
}

/** Tiny tick — mood picker, outline buttons, theme */
export function wellnessWebTap(): void {
  shortBeep(660, 45, 0.045)
  vibrate(8)
}

/** Start task / primary CTA */
export function wellnessWebPrimary(): void {
  shortBeep(523, 55, 0.055)
  shortBeep(784, 45, 0.04, 0.06)
  vibrate([12, 24, 12])
}

/** Timer hit zero */
export function wellnessWebTimerDone(): void {
  shortBeep(440, 70, 0.06)
  shortBeep(554, 90, 0.05, 0.08)
  vibrate([15, 30, 20])
}

/** Walk timer: requirement met (Done enabled) */
export function wellnessWebWalkReady(): void {
  shortBeep(698, 60, 0.048)
  vibrate(10)
}

/** Streak saved / completion */
export function wellnessWebCelebrate(): void {
  shortBeep(392, 80, 0.055)
  shortBeep(523, 90, 0.06, 0.1)
  shortBeep(659, 120, 0.05, 0.22)
  vibrate([20, 40, 25, 50, 30])
}
