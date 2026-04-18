import { useEffect, type ReactNode } from "react"
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useLabeledInput } from "@/utils/useLabeledInput"

export type FloatingLabelInputProps = Omit<
  TextInputProps,
  "placeholder" | "style"
> & {
  label: string
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  borderColor: string
  backgroundColor: string
  textColor: string
  labelColorFloating: string
  labelColorInside: string
  placeholderTextColor: string
  error?: boolean
  errorBorderColor?: string
  rightSlot?: ReactNode
}

/**
 * Floating label with Reanimated: smooth float when focused or filled.
 * Label rests inside the field only when blurred and empty — never “vanishes” on focus.
 */
export function FloatingLabelInput({
  label,
  containerStyle,
  inputStyle,
  borderColor,
  backgroundColor,
  textColor,
  labelColorFloating,
  labelColorInside,
  placeholderTextColor,
  error,
  errorBorderColor = "#dc2626",
  rightSlot,
  editable = true,
  onFocus,
  onBlur,
  multiline = false,
  ...rest
}: FloatingLabelInputProps) {
  const value = typeof rest.value === "string" ? rest.value : ""
  const { active, onFocus: hookFocus, onBlur: hookBlur } = useLabeledInput(value)

  const progress = useSharedValue(active ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 180 })
  }, [active, progress])

  const labelStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: 14,
      zIndex: 1,
      fontWeight: "600",
      top: interpolate(progress.value, [0, 1], [18, 8]),
      fontSize: interpolate(progress.value, [0, 1], [16, 12]),
      color: interpolateColor(
        progress.value,
        [0, 1],
        [labelColorInside, labelColorFloating],
      ),
    }
  })

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <View
        style={[
          styles.inputRow,
          {
            borderColor: error ? errorBorderColor : borderColor,
            backgroundColor,
            minHeight: 50,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }, inputStyle]}
          placeholder=""
          placeholderTextColor={placeholderTextColor}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={(e) => {
            hookFocus()
            onFocus?.(e)
          }}
          onBlur={(e) => {
            hookBlur()
            onBlur?.(e)
          }}
          {...rest}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    paddingTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 28,
    paddingVertical: 0,
  },
  rightSlot: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
})
