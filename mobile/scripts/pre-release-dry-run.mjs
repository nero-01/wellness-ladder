#!/usr/bin/env node

import { execSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

const mobileRoot = process.cwd()
const reportDir = path.join(mobileRoot, "reports")
const reportPath = path.join(reportDir, "pre-release-dry-run.md")
const exportDir = path.join(mobileRoot, "dist-android-export")

const checks = [
  {
    name: "Expo config validation",
    command: "npx expo config --type public",
  },
  {
    name: "TypeScript check",
    command: "npx tsc --noEmit",
  },
  {
    name: "Android export build check",
    command: "npx expo export --platform android --output-dir dist-android-export",
  },
]

function run(command) {
  try {
    const output = execSync(command, {
      cwd: mobileRoot,
      stdio: "pipe",
      encoding: "utf8",
      env: process.env,
      maxBuffer: 1024 * 1024 * 16,
    })
    return { ok: true, output }
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : ""
    const stderr = error?.stderr ? String(error.stderr) : ""
    return {
      ok: false,
      output: `${stdout}\n${stderr}`.trim(),
      error: error instanceof Error ? error.message : "Unknown command error",
    }
  }
}

function fence(text) {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return "_No output captured._"
  const lines = trimmed.split("\n")
  const preview = lines.slice(-80).join("\n")
  return `\`\`\`\n${preview}\n\`\`\``
}

const startedAt = new Date()
const results = []

for (const check of checks) {
  const result = run(check.command)
  results.push({ ...check, ...result })
}

const passed = results.filter((r) => r.ok).length
const failed = results.length - passed
const overall = failed === 0 ? "PASS" : "FAIL"
const finishedAt = new Date()

const lines = [
  "# Mobile Pre-release Dry Run",
  "",
  `- **Overall:** ${overall}`,
  `- **Started:** ${startedAt.toISOString()}`,
  `- **Finished:** ${finishedAt.toISOString()}`,
  `- **Checks:** ${passed}/${results.length} passed`,
  "",
]

for (const result of results) {
  lines.push(`## ${result.name}`)
  lines.push("")
  lines.push(`- **Command:** \`${result.command}\``)
  lines.push(`- **Status:** ${result.ok ? "PASS" : "FAIL"}`)
  if (!result.ok) lines.push(`- **Error:** ${result.error}`)
  lines.push("")
  lines.push("### Output (tail)")
  lines.push("")
  lines.push(fence(result.output))
  lines.push("")
}

if (failed === 0) {
  lines.push("## Launch note")
  lines.push("")
  lines.push("- Dry run checks passed. Proceed to internal testing or store submission flow.")
  lines.push("")
}

mkdirSync(reportDir, { recursive: true })
writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8")

// Keep repository clean after a successful export check.
try {
  rmSync(exportDir, { recursive: true, force: true })
} catch {
  // ignore cleanup issues
}

console.log(`Dry run complete: ${overall}`)
console.log(`Report written to: ${reportPath}`)
process.exit(failed === 0 ? 0 : 1)
