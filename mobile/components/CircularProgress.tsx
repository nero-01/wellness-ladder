import { useMemo } from "react"
import { Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"

type Props = {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
}

/**
 * View-only ring progress (no react-native-svg). SVG + Fabric + Fast Refresh
 * can re-register RNSVG* native views and throw "Tried to register two views…".
 */
export function CircularProgress({
  progress,
  size = 64,
  strokeWidth = 4,
  label = "1/1",
}: Props) {
  const W = useWellnessColors()
  const percent = Math.min(100, Math.max(0, progress))
  const radius = size / 2
  const bw = Math.max(2, strokeWidth)

  const { left, right } = useMemo(() => {
    if (percent >= 50) {
      return {
        right: "180deg" as const,
        left: `${(percent - 50) * 3.6}deg` as const,
      }
    }
    return {
      right: `${percent * 3.6}deg` as const,
      left: "0deg" as const,
    }
  }, [percent])

  return (
    <View
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: W.ringTrack,
        borderRadius: radius,
      }}
    >
      <View
        style={{
          overflow: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
          width: radius,
          height: size,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: radius,
            width: radius,
            height: size,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            backgroundColor: W.primary,
            transform: [
              { translateX: -radius / 2 },
              { rotate: left },
              { translateX: radius / 2 },
            ],
          }}
        />
      </View>
      <View
        style={{
          overflow: "hidden",
          position: "absolute",
          top: 0,
          left: radius,
          width: radius,
          height: size,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: -radius,
            width: radius,
            height: size,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: W.primary,
            transform: [
              { translateX: radius / 2 },
              { rotate: right },
              { translateX: -radius / 2 },
            ],
          }}
        />
      </View>
      <View
        style={{
          overflow: "hidden",
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          width: (radius - bw) * 2,
          height: (radius - bw) * 2,
          borderRadius: radius - bw,
          backgroundColor: W.bgElevated,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: W.text }}>{label}</Text>
      </View>
    </View>
  )
}
