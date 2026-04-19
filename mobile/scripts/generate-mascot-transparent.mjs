/**
 * One-off: build RGBA mascot from flat background PNG (no alpha in source).
 * Run: node scripts/generate-mascot-transparent.mjs
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, "../assets/mascot/wellness-splash-companion.png")
const OUT = path.join(__dirname, "../assets/mascot/mascot-transparent.png")

async function main() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const ch = info.channels
  if (ch !== 4) throw new Error(`expected 4 channels, got ${ch}`)

  let sumR = 0
  let sumG = 0
  let sumB = 0
  let n = 0
  const sample = (x, y) => {
    const i = (y * w + x) * ch
    sumR += data[i]
    sumG += data[i + 1]
    sumB += data[i + 2]
    n++
  }
  const stepX = Math.max(1, Math.floor(w / 100))
  const stepY = Math.max(1, Math.floor(h / 100))
  for (let x = 0; x < w; x += stepX) {
    sample(x, 0)
    sample(x, h - 1)
  }
  for (let y = 0; y < h; y += stepY) {
    sample(0, y)
    sample(w - 1, y)
  }
  const br = sumR / n
  const bg = sumG / n
  const bb = sumB / n

  /** Fully transparent when color is within this distance of sampled edge bg */
  const T0 = 32
  /** Fully opaque beyond this distance */
  const T1 = 88

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const dr = r - br
      const dg = g - bg
      const db = b - bb
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)
      let a = 255
      if (dist <= T0) a = 0
      else if (dist < T1) a = Math.round((255 * (dist - T0)) / (T1 - T0))
      data[i + 3] = a
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(OUT)

  // eslint-disable-next-line no-console
  console.log("Wrote", OUT, "edge-avg bg", br.toFixed(1), bg.toFixed(1), bb.toFixed(1))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
