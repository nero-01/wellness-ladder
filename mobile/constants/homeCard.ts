import { Platform, type ViewStyle } from "react-native"

/**
 * Single wellness surface elevation — neutral, soft, consistent on iOS + Android.
 * Use for section cards, catalog tiles, CTAs, and auth panels.
 * Avoid stacking this on nested chips (use border-only for glyph wells inside cards).
 */
export const wellnessCardShadow: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: {},
  }),
}
