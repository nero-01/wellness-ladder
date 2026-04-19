import { Platform, type ViewStyle } from "react-native"

/**
 * Shared elevation for home / ladder preview tiles — one subtle system, not variant-heavy.
 */
export const previewCardShadow: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
    },
    android: { elevation: 2 },
    default: {},
  }),
}
