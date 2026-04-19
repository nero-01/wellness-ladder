import type { ReactNode } from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import {
  wellnessCardInner,
  wellnessCardOuter,
} from "@/constants/wellnessSurface"
import { radiusLg } from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"

type Props = {
  W: WellnessPalette
  /** Defaults to {@link radiusLg} */
  radius?: number
  outerStyle?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
  children: ReactNode
}

/** Outer shadow + inner border/fill — use everywhere a “card” is needed. */
export function WellnessCardFrame({
  W,
  radius = radiusLg,
  outerStyle,
  innerStyle,
  children,
}: Props) {
  return (
    <View style={[wellnessCardOuter(radius), outerStyle]}>
      <View style={[wellnessCardInner(W, radius), innerStyle]}>{children}</View>
    </View>
  )
}
