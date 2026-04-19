import { Image } from "expo-image"
import { View, type StyleProp, type ViewStyle } from "react-native"
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
