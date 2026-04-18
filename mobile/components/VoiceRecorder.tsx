import { Audio } from "expo-av"
import { wellnessTapLight, wellnessTapMedium } from "@/lib/wellnessFeedback"
import { useCallback, useState } from "react"
import { Pressable, StyleSheet, View as RNView } from "react-native"
import { Text, View } from "@/components/Themed"

/**
 * Records short audio with the device mic (expo-av). Pair with Next.js
 * `POST /api/voice/transcribe` using `apiFetch` + FormData for Whisper.
 */
export function VoiceRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [label, setLabel] = useState<string | null>(null)

  const start = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync()
      if (!perm.granted) {
        setLabel("Microphone permission denied")
        return
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
      wellnessTapMedium()
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(rec)
      setLabel("Recording… tap stop")
    } catch (e) {
      setLabel(e instanceof Error ? e.message : "Could not start recording")
    }
  }, [])

  const stop = useCallback(async () => {
    if (!recording) return
    try {
      wellnessTapLight()
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)
      setLabel(uri ? `Saved clip (${uri.slice(-24)})` : "Stopped")
    } catch (e) {
      setLabel(e instanceof Error ? e.message : "Stop failed")
    }
  }, [recording])

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>Voice (mic)</Text>
      <Text style={styles.hint}>
        expo-av recording. Upload the file to your API for Whisper transcription.
      </Text>
      <RNView style={styles.row}>
        <Pressable style={styles.btn} onPress={() => void start()} disabled={!!recording}>
          <Text style={styles.btnText}>Record</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => void stop()} disabled={!recording}>
          <Text style={styles.btnSecondaryText}>Stop</Text>
        </Pressable>
      </RNView>
      {label ? <Text style={styles.status}>{label}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    marginTop: 32,
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.35)",
    gap: 8,
  },
  heading: { fontWeight: "700", fontSize: 16 },
  hint: { fontSize: 13, opacity: 0.75 },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSecondaryText: { fontWeight: "600" },
  status: { fontSize: 12, opacity: 0.8, marginTop: 4 },
})
