import React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import { Easing, View } from "react-native"
import { FirstUseTipsOverlay } from "@/components/FirstUseTipsOverlay"
import { useColorScheme } from "@/components/useColorScheme"
import {
  WellnessColors,
  WellnessColorsLight,
} from "@/constants/wellnessTheme"
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
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const W = useWellnessColors()
  const tabBarBg = isDark ? "rgba(21, 17, 24, 0.94)" : "rgba(250, 250, 250, 0.94)"

  const homeAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[0])
  const taskAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[1])
  const progressAccent = moodPastelAccent(W.moodPastels, NAV_TAB_PASTEL_KEYS[2])

  const tabBarTopLine = isDark
    ? "rgba(196, 181, 253, 0.28)"
    : "rgba(167, 139, 250, 0.35)"

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: isDark ? "#71717a" : "#a1a1aa",
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 1,
          borderTopColor: tabBarTopLine,
          paddingTop: 4,
        },
        sceneStyle: { backgroundColor: "transparent" },
        headerStyle: {
          backgroundColor: tabBarBg,
        },
        headerTintColor: isDark ? WellnessColors.text : WellnessColorsLight.text,
        headerShadowVisible: false,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
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
