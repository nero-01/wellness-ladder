import { Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"

type Props = {
  timeLeft: number
  duration: number
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function TaskTimerBar({ timeLeft, duration }: Props) {
  const W = useWellnessColors()
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0

  return (
    <View style={{ marginVertical: 8 }}>
      <View
        style={{
          height: 12,
          borderRadius: 999,
          backgroundColor: W.timerTrack,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: W.primary,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 13, color: W.textMuted }}>Timer</Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: W.text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatTime(timeLeft)}
        </Text>
      </View>
    </View>
  )
}
