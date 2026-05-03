import React, { useMemo } from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import { Easing, View } from "react-native"
import { FirstUseTipsOverlay } from "@/components/FirstUseTipsOverlay"
import { useAppTheme } from "@/contexts/ThemeContext"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import {
  moodPastelAccent,
  NAV_TAB_PASTEL_KEYS,
} from "@/lib/mood-pastels"

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"]
  color: string
}) {
  return <FontAwesome size={26} style={{ marginBottom: -2 }} {...props} />
}

export default function TabLayout() {
  const { colors, isDark } = useAppTheme()
  const W = useWellnessColors()

  const homeAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[0])
  const taskAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[1])
  const progressAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[2])

  const { tabBarBg, tabBarTopLine, tabBarInactive } = useMemo(() => {
    const bg = isDark ? "rgba(21, 24, 39, 0.97)" : "rgba(255, 255, 255, 0.97)"
    const top = isDark ? "rgba(122, 139, 255, 0.22)" : "rgba(91, 109, 219, 0.18)"
    const inactive = isDark ? "rgba(245, 247, 255, 0.42)" : "rgba(17, 24, 39, 0.42)"
    return { tabBarBg: bg, tabBarTopLine: top, tabBarInactive: inactive }
  }, [isDark])

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: tabBarInactive,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 1,
          borderTopColor: tabBarTopLine,
          paddingTop: 6,
          paddingBottom: 2,
        },
        sceneStyle: { backgroundColor: "transparent" },
        headerStyle: {
          backgroundColor: tabBarBg,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
        /** Very short cross-fade between tabs — still feels animated, not instant */
        animation: "fade",
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 72,
            easing: Easing.out(Easing.cubic),
          },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          /** Custom header on the home screen — avoid double header + extra top gap */
          headerShown: false,
          tabBarActiveTintColor: homeAccent.navIcon,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: "Task",
          tabBarActiveTintColor: taskAccent.navIcon,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="check-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Progress",
          tabBarActiveTintColor: progressAccent.navIcon,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
    <FirstUseTipsOverlay />
    </View>
  )
}
