import type { Router } from "expo-router"
import type { User } from "@/contexts/AuthContext"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { captureSplashPoster } from "@/lib/splash-poster"

type MinimalRouter = Pick<Router, "replace">

export type SetBrandedImageUri = (uri: string | null) => Promise<void>

export async function prepareBrandedBackdropFromSplash(
  setBrandedImageUri: SetBrandedImageUri,
): Promise<void> {
  const poster = await captureSplashPoster()
  if (poster) await setBrandedImageUri(poster)
}

/** Backward-compatible alias while migrating callers from video naming. */
export const prepareBrandedBackdropFromVideo = prepareBrandedBackdropFromSplash

export async function skipOrFinishOnboarding(
  router: MinimalRouter,
  opts: {
    user: User | null
    continueAsGuest: () => Promise<void>
    setBrandedImageUri: SetBrandedImageUri
    videoDurationMs?: number | null
  },
): Promise<void> {
  void opts.videoDurationMs
  await prepareBrandedBackdropFromSplash(opts.setBrandedImageUri)
  if (opts.user && !opts.user.isGuest) {
    await markOnboardingComplete()
    router.replace("/(tabs)")
    return
  }
  await opts.continueAsGuest()
  router.replace("/(tabs)")
}
