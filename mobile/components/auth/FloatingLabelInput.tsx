import { useState, type ReactNode } from "react"
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { Text } from "@/components/Themed"

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
 * Floating label pattern (shadcn-like): label moves up when focused or filled.
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
  const [focused, setFocused] = useState(false)
  const active = focused || (typeof rest.value === "string" && rest.value.length > 0)

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text
        pointerEvents="none"
        style={[
          styles.floatingLabel,
          {
            color: active ? labelColorFloating : labelColorInside,
            fontSize: active ? 12 : 16,
            top: active ? 8 : 18,
          },
        ]}
      >
        {label}
      </Text>
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
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
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
  floatingLabel: {
    position: "absolute",
    left: 14,
    zIndex: 1,
    fontWeight: "600",
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
