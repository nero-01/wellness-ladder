import AsyncStorage from "@react-native-async-storage/async-storage"
import { useCallback, useEffect, useState } from "react"

export type WellnessLocale = "en" | "af"

const STORAGE_KEY = "wellness-ladder-locale-v1"
export const DEFAULT_LOCALE: WellnessLocale = "en"

export async function getStoredWellnessLocale(): Promise<WellnessLocale> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw === "af" || raw === "en") return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

export async function setStoredWellnessLocale(locale: WellnessLocale): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, locale)
}

export function useWellnessLocale() {
  const [locale, setLocaleState] = useState<WellnessLocale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      const l = await getStoredWellnessLocale()
      setLocaleState(l)
      setReady(true)
    })()
  }, [])

  const setLocale = useCallback((next: WellnessLocale) => {
    setLocaleState(next)
    void setStoredWellnessLocale(next)
  }, [])

  return { locale, setLocale, ready }
}
