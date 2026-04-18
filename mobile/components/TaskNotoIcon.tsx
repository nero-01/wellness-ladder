import { Image } from "expo-image"
import { Platform, View, type StyleProp, type ViewStyle } from "react-native"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"

type Props = {
  iconCode: string
  size: number
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function TaskNotoIcon({
  iconCode,
  size,
  accessibilityLabel,
  style,
}: Props) {
  const uri = emojiFamilySvgUrl(iconCode)
  const lift =
    Platform.OS === "ios" ?
      {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    : Platform.OS === "android" ? { elevation: 3 }
    : {}

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        lift,
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={80}
      />
    </View>
  )
}
