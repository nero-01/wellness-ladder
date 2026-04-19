const path = require("path")
const { config: loadEnv } = require("dotenv")

// Resolve from this file so env loads correctly even when npm is run from the repo root.
const dir = __dirname
loadEnv({ path: path.join(dir, ".env") })
loadEnv({ path: path.join(dir, ".env.local") })
loadEnv({ path: path.join(dir, "..", ".env") })
loadEnv({ path: path.join(dir, "..", ".env.local") })

// Allow a single root .env used by Next.js (NEXT_PUBLIC_*) to satisfy Expo (EXPO_PUBLIC_*).
if (!process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && process.env.EXPO_PUBLIC_SUPABASE_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY
}
if (!process.env.EXPO_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL) {
  process.env.EXPO_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
}
if (!process.env.EXPO_PUBLIC_USE_MOCK_AUTH && process.env.NEXT_PUBLIC_USE_MOCK_AUTH) {
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH
}
if (!process.env.EXPO_PUBLIC_MOCK_DEV_EMAIL && process.env.NEXT_PUBLIC_MOCK_DEV_EMAIL) {
  process.env.EXPO_PUBLIC_MOCK_DEV_EMAIL = process.env.NEXT_PUBLIC_MOCK_DEV_EMAIL
}
if (!process.env.EXPO_PUBLIC_MOCK_DEV_PASSWORD && process.env.NEXT_PUBLIC_MOCK_DEV_PASSWORD) {
  process.env.EXPO_PUBLIC_MOCK_DEV_PASSWORD = process.env.NEXT_PUBLIC_MOCK_DEV_PASSWORD
}
if (!process.env.EXPO_PUBLIC_USE_ELEVENLABS_TTS && process.env.NEXT_PUBLIC_USE_ELEVENLABS_TTS) {
  process.env.EXPO_PUBLIC_USE_ELEVENLABS_TTS = process.env.NEXT_PUBLIC_USE_ELEVENLABS_TTS
}
if (!process.env.EXPO_PUBLIC_WELLNESS_PRO && process.env.NEXT_PUBLIC_WELLNESS_PRO) {
  process.env.EXPO_PUBLIC_WELLNESS_PRO = process.env.NEXT_PUBLIC_WELLNESS_PRO
}

module.exports = {
  expo: {
    name: "Wellness Ladder",
    slug: "wellness-ladder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    /** Same asset as `Mascot` (`companion-official.png`). Rebuild native app after changing. */
    splash: {
      image: "./assets/mascot/companion-official.png",
      resizeMode: "contain",
      backgroundColor: "#151118",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "Record short voice notes for wellness journaling and transcription.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-av",
        {
          microphonePermission:
            "Allow $(PRODUCT_NAME) to record voice notes for wellness features.",
        },
      ],
      [
        "expo-notifications",
        {
          sounds: [],
          enableBackgroundRemoteNotifications: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
}
