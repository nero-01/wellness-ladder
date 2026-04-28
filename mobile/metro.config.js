const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "..")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Allow importing shared `lib/*` from the repo root (e.g. mood-picker-data re-export).
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
]
// Keep GIF support explicit in case resolver assetExts are customized later.
if (!config.resolver.assetExts.includes("gif")) {
  config.resolver.assetExts.push("gif")
}

module.exports = config
