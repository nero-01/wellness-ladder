import AsyncStorage from "@react-native-async-storage/async-storage"

export const ONBOARDING_COMPLETE_KEY = "wellness-onboarding-v1-complete"
export const BRANDED_BG_URI_KEY = "wellness-branded-bg-uri-v1"
export const FIRST_USE_TIPS_DISMISSED_KEY = "wellness-first-use-tips-v1-dismissed"

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
    return v === "1"
  } catch {
    return false
  }
}

export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "1")
  } catch {
    /* ignore */
  }
}

export async function getBrandedBackdropUri(): Promise<string | null> {
  try {
    const u = await AsyncStorage.getItem(BRANDED_BG_URI_KEY)
    return u && u.length > 0 ? u : null
  } catch {
    return null
  }
}

export async function setBrandedBackdropUri(uri: string | null): Promise<void> {
  try {
    if (uri) await AsyncStorage.setItem(BRANDED_BG_URI_KEY, uri)
    else await AsyncStorage.removeItem(BRANDED_BG_URI_KEY)
  } catch {
    /* ignore */
  }
}

export async function getFirstUseTipsDismissed(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(FIRST_USE_TIPS_DISMISSED_KEY)) === "1"
  } catch {
    return false
  }
}

export async function markFirstUseTipsDismissed(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_USE_TIPS_DISMISSED_KEY, "1")
  } catch {
    /* ignore */
  }
}
