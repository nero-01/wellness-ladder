/**
 * Builds App Store / Expo icon PNGs from the canonical reference image
 * (lavender squircle, white script "w", small leaf) by:
 * 1. Trimming near-white canvas (matches JPEG edges)
 * 2. Padding to a square
 * 3. Applying an iOS-style rounded-rect mask (~22.37% corner radius) so
 *    only the squircle remains on a transparent background
 * 4. Lanczos resize to target sizes
 *
 * Reference: docs/design/reference/wellness-icon-reference.jpg
 * Run from repo root: node scripts/build-wellness-store-icon.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const REFERENCE = path.join(root, "docs/design/reference/wellness-icon-reference.jpg")
const OUT_DIR = path.join(root, "docs/design/wellness-icon-exports")
const TRIM_THRESHOLD = 48
/** iOS squircle common approximation: corner radius / side */
const CORNER_RADIUS_FR = 0.2237

const STORE_SIZES = [1024, 512, 256, 128]

async function buildMasterPng1024() {
  let base = await sharp(REFERENCE).trim({ threshold: TRIM_THRESHOLD }).ensureAlpha().png().toBuffer()

  let { width: w, height: h } = await sharp(base).metadata()
  const side = Math.max(w, h)
  const pl = Math.floor((side - w) / 2)
  const pr = Math.ceil((side - w) / 2)
  const pt = Math.floor((side - h) / 2)
  const pb = Math.ceil((side - h) / 2)

  base = await sharp(base)
    .extend({
      top: pt,
      bottom: pb,
      left: pl,
      right: pr,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  ;({ width: w, height: h } = await sharp(base).metadata())
  if (w !== h) throw new Error(`Expected square after pad, got ${w}x${h}`)

  const rx = Math.max(1, Math.round(w * CORNER_RADIUS_FR))
  const maskSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="#ffffff"/></svg>`

  const masked = await sharp(base)
    .composite([{ input: Buffer.from(maskSvg), blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  return sharp(masked)
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  if (!fs.existsSync(REFERENCE)) {
    console.error("Missing reference:", REFERENCE)
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const master1024 = await buildMasterPng1024()
  fs.writeFileSync(path.join(OUT_DIR, "icon-1024.png"), master1024)

  for (const s of STORE_SIZES) {
    if (s === 1024) continue
    const buf = await sharp(master1024)
      .resize(s, s, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toBuffer()
    fs.writeFileSync(path.join(OUT_DIR, `icon-${s}.png`), buf)
  }

  const favicon48 = await sharp(master1024)
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer()

  fs.writeFileSync(path.join(root, "mobile/assets/images/icon.png"), master1024)
  fs.writeFileSync(path.join(root, "mobile/assets/images/adaptive-icon.png"), master1024)
  fs.writeFileSync(path.join(root, "mobile/assets/images/favicon.png"), favicon48)

  console.log("Wrote exports under", path.relative(root, OUT_DIR))
  console.log("Updated mobile/assets/images/icon.png, adaptive-icon.png, favicon.png")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
