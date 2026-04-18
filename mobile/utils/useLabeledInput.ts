import { useCallback, useMemo, useState } from "react"

/**
 * Floating-label state: label stays up while **focused** or when **value** is non-empty.
 * On blur with an empty field, the label returns to the resting (inside) position — it does not “disappear” on focus.
 */
export function useLabeledInput(value: string) {
  const [focused, setFocused] = useState(false)

  const active = useMemo(
    () => focused || value.trim().length > 0,
    [focused, value],
  )

  const onFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const onBlur = useCallback(() => {
    setFocused(false)
  }, [])

  return {
    focused,
    /** True when the label should float (focused or filled). */
    active,
    onFocus,
    onBlur,
  }
}
