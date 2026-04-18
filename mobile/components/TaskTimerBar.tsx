import { Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { WalkPhase } from "@/hooks/useTaskSessionTimer"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

type CountdownProps = {
  mode: "countdown"
  timeLeft: number
  duration: number
}

type ManualProps = {
  mode: "manual"
  elapsed: number
  targetSeconds: number
  walkPhase: WalkPhase
  minSeconds: number
}

type Props = CountdownProps | ManualProps

export function TaskTimerBar(props: Props) {
  const W = useWellnessColors()

  if (props.mode === "countdown") {
    const { timeLeft, duration } = props
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

  const { elapsed, targetSeconds, walkPhase, minSeconds } = props
  const progress =
    targetSeconds > 0 ? Math.min(100, (elapsed / targetSeconds) * 100) : 0
  const label =
    walkPhase === "idle" ? "Walk timer"
    : walkPhase === "walking" ? "Walking"
    : "Walk paused"

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
        <Text style={{ fontSize: 13, color: W.textMuted }}>{label}</Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: W.text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatTime(elapsed)}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: W.textMuted, marginTop: 6 }}>
        {`Done unlocks after at least ${minSeconds}s walked (after Stop).`}
      </Text>
    </View>
  )
}
