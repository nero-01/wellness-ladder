import { Audio } from "expo-av"
import * as Haptics from "expo-haptics"

let chime: Audio.Sound | null = null

async function ensureChimeLoaded(): Promise<Audio.Sound | null> {
  if (chime) return chime
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })
    const mod = require("../assets/sounds/soft-chime.wav")
    const { sound } = await Audio.Sound.createAsync(mod, {
      shouldPlay: false,
      volume: 0.35,
      isLooping: false,
    })
    chime = sound
    return sound
  } catch {
    return null
  }
}

/** Soft UI tick — mood pills, toggles, secondary actions */
export function wellnessTapLight(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/** Primary buttons: Start task, Start walk, theme, hero CTA */
export function wellnessTapMedium(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/** Pickers, sliders, segmented controls */
export function wellnessSelection(): void {
  void Haptics.selectionAsync()
}

/** Countdown reached zero — distinct from “saved” completion */
export function wellnessTimerFinished(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  void playSoftChime(0.26)
}

/** Manual walk: walked long enough after Stop — Done is now allowed */
export function wellnessWalkReady(): void {
  wellnessSelection()
  void playSoftChime(0.22)
}

/** User pressed Done — immediate confirmation (sound plays on celebration screen) */
export function wellnessTaskComplete(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

/** Completion / celebration screen entrance */
export function wellnessCelebration(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  void playSoftChime(0.34)
  setTimeout(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, 120)
}

export async function playSoftChime(volume = 0.32): Promise<void> {
  try {
    const s = await ensureChimeLoaded()
    if (!s) return
    await s.setPositionAsync(0)
    await s.setVolumeAsync(volume)
    await s.replayAsync()
  } catch {
    /* ignore */
  }
}
