import { StyleSheet } from "react-native"

/** Explicit colors so typed text is never invisible on dark/light themed screens. */
export const AUTH_PLACEHOLDER = "#6b7280"

export const authInputStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
})
