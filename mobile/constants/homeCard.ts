import { Platform, type ViewStyle } from "react-native"

/**
 * Shared elevation for cards, catalog tiles, and primary surfaces.
 * Use everywhere a raised-but-minimal frame is needed (avoid mixed shadow strengths).
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
