/**
 * Runs `prisma migrate deploy` after loading root `.env` then `.env.local`
 * (Next.js convention). Prisma CLI alone only reads `.env`, which causes
 * P1012 when DATABASE_URL exists only in `.env.local`.
 */
const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")

function loadEnv(file) {
  const p = path.join(root, file)
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p, override: file === ".env.local" })
  }
}

loadEnv(".env")
loadEnv(".env.local")

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
})

process.exit(result.status ?? 1)
