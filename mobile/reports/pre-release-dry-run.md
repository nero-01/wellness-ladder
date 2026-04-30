# Mobile Pre-release Dry Run

- **Overall:** PASS
- **Started:** 2026-04-30T05:13:32.883Z
- **Finished:** 2026-04-30T05:13:47.812Z
- **Checks:** 3/3 passed

## Expo config validation

- **Command:** `npx expo config --type public`
- **Status:** PASS

### Output (tail)

```
env: load .env
env: export EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY EXPO_PUBLIC_API_URL EXPO_PUBLIC_FORCE_ONBOARDING
◇ injected env (0) from .env // tip: ⌁ auth for agents [www.vestauth.com]
◇ injected env (0) from .env.local // tip: ⌘ enable debugging { debug: true }
◇ injected env (0) from ../.env // tip: ⌁ auth for agents [www.vestauth.com]
◇ injected env (10) from ../.env.local // tip: ⌘ custom filepath { path: '/custom/path/.env' }

{
  name: [32m'Wellness Ladder'[39m,
  slug: [32m'wellness-ladder'[39m,
  version: [32m'1.0.0'[39m,
  orientation: [32m'portrait'[39m,
  icon: [32m'./assets/images/icon.png'[39m,
  scheme: [32m'mobile'[39m,
  userInterfaceStyle: [32m'automatic'[39m,
  newArchEnabled: [33mtrue[39m,
  plugins: [
    [32m'expo-router'[39m,
    [32m'expo-asset'[39m,
    [
      [32m'expo-av'[39m,
      {
        microphonePermission: [32m'Allow $(PRODUCT_NAME) to record voice notes for wellness features.'[39m
      }
    ],
    [
      [32m'expo-notifications'[39m,
      {
        sounds: [],
        enableBackgroundRemoteNotifications: [33mfalse[39m
      }
    ]
  ],
  assetBundlePatterns: [
    [32m'assets/**/*'[39m
  ],
  description: [90mundefined[39m,
  sdkVersion: [32m'54.0.0'[39m,
  platforms: [
    [32m'ios'[39m,
    [32m'android'[39m,
    [32m'web'[39m
  ],
  splash: {
    image: [32m'./assets/mascot/mascot-transparent.png'[39m,
    resizeMode: [32m'contain'[39m,
    backgroundColor: [32m'#151118'[39m
  },
  ios: {
    supportsTablet: [33mtrue[39m,
    infoPlist: {
      NSMicrophoneUsageDescription: [32m'Record short voice notes for wellness journaling and transcription.'[39m
    }
  },
  android: {
    package: [32m'com.wellnessladder.app'[39m,
    versionCode: [33m1[39m,
    edgeToEdgeEnabled: [33mtrue[39m,
    predictiveBackGestureEnabled: [33mfalse[39m,
    permissions: [
      [32m'android.permission.RECORD_AUDIO'[39m,
      [32m'android.permission.MODIFY_AUDIO_SETTINGS'[39m
    ],
    adaptiveIcon: {
      foregroundImage: [32m'./assets/images/adaptive-icon.png'[39m,
      backgroundColor: [32m'#ffffff'[39m
    }
  },
  web: {
    bundler: [32m'metro'[39m,
    output: [32m'static'[39m,
    favicon: [32m'./assets/images/favicon.png'[39m
  },
  experiments: {
    typedRoutes: [33mtrue[39m
  },
  extra: {
    router: {}
  }
}
```

## TypeScript check

- **Command:** `npx tsc --noEmit`
- **Status:** PASS

### Output (tail)

_No output captured._

## Android export build check

- **Command:** `npx expo export --platform android --output-dir dist-android-export`
- **Status:** PASS

### Output (tail)

```
◇ injected env (4) from .env // tip: ⌘ enable debugging { debug: true }
◇ injected env (0) from .env.local // tip: ⌘ override existing { override: true }
◇ injected env (0) from ../.env // tip: ⌘ enable debugging { debug: true }
◇ injected env (10) from ../.env.local // tip: ⌘ suppress logs { quiet: true }
◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
◇ injected env (0) from .env.local // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from ../.env // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from ../.env.local // tip: ⌘ override existing { override: true }
◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
◇ injected env (0) from .env.local // tip: ◈ encrypted .env [www.dotenvx.com]
◇ injected env (0) from ../.env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from ../.env.local // tip: ⌘ custom filepath { path: '/custom/path/.env' }
◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }
◇ injected env (0) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from ../.env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
◇ injected env (0) from ../.env.local // tip: ⌘ enable debugging { debug: true }
◇ injected env (0) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from ../.env // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from ../.env.local // tip: ◈ encrypted .env [www.dotenvx.com]
Starting Metro Bundler
| (node:21211) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
| (Use `node --trace-warnings ...` to show where the warning was created)
| (node:21212) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
| (Use `node --trace-warnings ...` to show where the warning was created)
Android node_modules/expo-router/entry.js ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99.9% (2329/2329)
Android Bundled 4825ms node_modules/expo-router/entry.js (2329 modules)

› Assets (47):
assets/backgrounds/splash-bg-hd.png (24.8 kB)
assets/fonts/SpaceMono-Regular.ttf (93.3 kB)
assets/mascot/mascot-transparent.png (143 kB)
assets/sounds/soft-chime.wav (7.1 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf (130 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf (66.2 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/EvilIcons.ttf (13.5 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf (55.6 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf (166 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf (134 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf (33.7 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf (203 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Brands.ttf (209 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Regular.ttf (68 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome6_Solid.ttf (424 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Fontisto.ttf (314 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Foundation.ttf (57 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf (390 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf (1.31 MB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf (357 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Octicons.ttf (69.4 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/SimpleLineIcons.ttf (54.1 kB)
node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Zocial.ttf (25.8 kB)
node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.png (653 B)
node_modules/@react-navigation/elements/lib/module/assets/back-icon.png (4 variations | 152 B)
node_modules/@react-navigation/elements/lib/module/assets/clear-icon.png (4 variations | 425 B)
node_modules/@react-navigation/elements/lib/module/assets/close-icon.png (4 variations | 235 B)
node_modules/@react-navigation/elements/lib/module/assets/search-icon.png (4 variations | 599 B)
node_modules/expo-router/assets/arrow_down.png (9.46 kB)
node_modules/expo-router/assets/error.png (469 B)
node_modules/expo-router/assets/file.png (138 B)
node_modules/expo-router/assets/forward.png (188 B)
node_modules/expo-router/assets/pkg.png (364 B)
node_modules/expo-router/assets/sitemap.png (465 B)
node_modules/expo-router/assets/unmatched.png (4.75 kB)

› android bundles (1):
_expo/static/js/android/entry-3a28db013a56a24f24dd61cf2d018320.hbc (5.9 MB)

› Files (1):
metadata.json (3.24 kB)

Exported: dist-android-export
```

## Launch note

- Dry run checks passed. Proceed to internal testing or store submission flow.

