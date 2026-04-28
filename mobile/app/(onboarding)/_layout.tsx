import { Stack } from "expo-router"

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        /** Transparent so full-screen splash media (GIF/image) is never hidden by scene bg. */
        contentStyle: { flex: 1, backgroundColor: "transparent" },
      }}
    />
  )
}
