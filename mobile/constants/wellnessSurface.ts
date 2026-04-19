import { Platform, type ViewStyle } from "react-native"
import type { WellnessPalette } from "./wellnessTheme"

/**
 * Single wellness elevation — soft, neutral, same on every card.
 * Always apply on an outer wrapper; put border + fill on the inner surface
 * so iOS shadows are not clipped and corners stay clean.
 */
export const wellnessCardShadow: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: {},
  }),
}

/** Shadow-only shell — no border, no overflow:hidden (so the shadow paints). */
export function wellnessCardOuter(radius: number): ViewStyle {
  return {
    borderRadius: radius,
    ...wellnessCardShadow,
  }
}

/** Bordered surface clipped to radius — pair with {@link wellnessCardOuter} of the same radius. */
export function wellnessCardInner(
  W: WellnessPalette,
  radius: number,
  opts?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    overflow?: "hidden" | "visible"
  },
): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: opts?.borderWidth ?? 1,
    borderColor: opts?.borderColor ?? W.cardBorder,
    backgroundColor: opts?.backgroundColor ?? W.bgElevated,
    overflow: opts?.overflow ?? "hidden",
  }
}
