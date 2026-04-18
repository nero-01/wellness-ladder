import React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Link, Tabs } from "expo-router"
import { Pressable } from "react-native"
import { useColorScheme } from "@/components/useColorScheme"
import { WellnessColors } from "@/constants/wellnessTheme"

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"]
  color: string
}) {
  return <FontAwesome size={26} style={{ marginBottom: -2 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#c4b5fd" : "#7c3aed",
        tabBarInactiveTintColor: isDark ? "#71717a" : "#a1a1aa",
        tabBarStyle: {
          backgroundColor: isDark ? WellnessColors.bg : "#ffffff",
          borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#e4e4e7",
        },
        headerStyle: {
          backgroundColor: isDark ? WellnessColors.bg : "#ffffff",
        },
        headerTintColor: isDark ? WellnessColors.text : "#18181b",
        headerShadowVisible: false,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 16 }}>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={24}
                    color={isDark ? WellnessColors.text : "#18181b"}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: "Task",
          tabBarIcon: ({ color }) => <TabBarIcon name="check-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  )
}
