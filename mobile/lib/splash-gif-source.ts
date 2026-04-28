import { Asset } from "expo-asset"
import type { ImageSource } from "expo-image"

/**
 * Bundled splash art (latest purple reference).
 * Keep this pointed at the design source of truth to avoid palette drift.
 */
export const SPLASH_GIF_MODULE = require("@/assets/backgrounds/splash-bg-hd.png") as number

/**
 * Resolve the GIF to a concrete asset URI.
 * Expo-image can render directly from module id, but URI logging is useful for device debugging.
 */
export async function resolveSplashGifSource(): Promise<ImageSource | number> {
  // Prefer module id directly: lets Expo pick the best bundled variant and avoid URI fallback quality surprises.
  try {
    const asset = Asset.fromModule(SPLASH_GIF_MODULE)
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[splash-gif-source] bundled asset", {
        width: asset.width,
        height: asset.height,
      })
    }
  } catch {}
  return SPLASH_GIF_MODULE
}
