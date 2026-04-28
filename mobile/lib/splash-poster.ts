import { Asset } from "expo-asset"

/** Static still derived from the splash GIF (last-frame style). */
const SPLASH_POSTER_MODULE = require("@/assets/backgrounds/splash-bg-hd.png") as number

export async function captureSplashPoster(): Promise<string | null> {
  try {
    const asset = Asset.fromModule(SPLASH_POSTER_MODULE)
    await asset.downloadAsync()
    return asset.localUri ?? asset.uri ?? null
  } catch {
    return null
  }
}
