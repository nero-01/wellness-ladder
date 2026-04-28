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
  try {
    const asset = Asset.fromModule(SPLASH_GIF_MODULE)
    await asset.downloadAsync()
    const uri = asset.localUri ?? asset.uri
    if (uri) return { uri }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[splash-gif-source] Asset.resolve failed, using module id:", e)
  }
  return SPLASH_GIF_MODULE
}
