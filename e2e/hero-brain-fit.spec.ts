import { test, expect, type Page } from "@playwright/test"

/**
 * Hero brain — fit and motion guards.
 *
 * The brain shipped hard-clipped once (its foot ran past the hero's bottom
 * edge) and nothing in the gate noticed, because every existing check read
 * class names. This spec reads what the visitor sees: BrainTelemetry
 * (components/brain/index.tsx) projects the mesh's bounding box through the
 * camera every few frames and writes the page-pixel extent to the <canvas>
 * as `data-brain-bbox="l,t,r,b"`, plus the camera azimuth as
 * `data-brain-rot`. The assertions here are geometry and pixels, not markup.
 *
 * Fit (four desktop viewports): the mesh spans a Heupler-scale share of the
 * viewport height, sits centred, and is inside the viewport and the hero on
 * every side — and the hero's bottom edge holds no stray wireframe pixels.
 * Motion (1440×900): the azimuth advances at idle, a drag moves it further,
 * it keeps advancing after release, and it holds still under reduced motion.
 */

const VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
]

type Box = { l: number; t: number; r: number; b: number }

async function readBbox(page: Page): Promise<Box> {
  const raw = await page.locator(".hero-brain-underlay canvas").first().getAttribute("data-brain-bbox")
  const [l, t, r, b] = (raw ?? "").split(",").map(Number)
  return { l, t, r, b }
}

async function readRot(page: Page): Promise<number> {
  const raw = await page.locator(".hero-brain-underlay canvas").first().getAttribute("data-brain-rot")
  return Number(raw)
}

async function waitForTelemetry(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect
    .poll(async () => (await page.locator(".hero-brain-underlay canvas").first().getAttribute("data-brain-bbox")) ?? "", {
      message: "brain telemetry should appear once the mesh renders",
      timeout: 30_000,
    })
    .toMatch(/^-?\d+,-?\d+,-?\d+,-?\d+$/)
  // The reveal fade and the entrance ladder settle inside ~2.5s; the fit
  // numbers don't depend on them, but the pixel check below does.
  await page.waitForTimeout(2500)
}

/**
 * Luminance stats (0–255) of a PNG buffer, decoded by the browser itself so
 * the spec needs no image dependency. A strip of plain background is flat:
 * median ≈ max. A sliced wireframe puts bright strokes in it: max ≫ median.
 */
async function luminanceStats(page: Page, png: Buffer): Promise<{ median: number; max: number }> {
  return page.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = document.createElement("canvas")
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext("2d")!
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    const hist = new Array<number>(256).fill(0)
    let max = 0
    const n = d.length / 4
    for (let i = 0; i < d.length; i += 4) {
      const l = Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])
      hist[l]++
      if (l > max) max = l
    }
    let acc = 0
    let median = 0
    for (let l = 0; l < 256; l++) {
      acc += hist[l]
      if (acc >= n / 2) {
        median = l
        break
      }
    }
    return { median, max }
  }, png.toString("base64"))
}

for (const vp of VIEWPORTS) {
  test(`brain fits the hero at ${vp.width}×${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp)
    await waitForTelemetry(page)

    const box = await readBbox(page)
    const hero = (await page.locator("#hero").boundingBox())!
    const nav = (await page.locator("nav").first().boundingBox())!
    const h = box.b - box.t
    const share = h / vp.height
    const centreOffset = Math.abs((box.l + box.r) / 2 - vp.width / 2) / vp.width

    expect(share, `mesh height share of viewport (${h.toFixed(0)}px)`).toBeGreaterThanOrEqual(0.78)
    expect(share, `mesh height share of viewport (${h.toFixed(0)}px)`).toBeLessThanOrEqual(0.94)
    // The brain is not symmetric, so its silhouette centre wanders ±3% of the
    // viewport as it orbits; 5% still catches the "shifted left" ship.
    expect(centreOffset, "mesh centred horizontally").toBeLessThanOrEqual(0.05)
    expect(box.l, "mesh inside the viewport (left)").toBeGreaterThanOrEqual(0)
    expect(box.r, "mesh inside the viewport (right)").toBeLessThanOrEqual(vp.width)
    expect(box.t, "mesh inside the viewport (top)").toBeGreaterThanOrEqual(0)
    expect(box.b, "mesh inside the hero (bottom)").toBeLessThanOrEqual(hero.y + hero.height)
    expect(box.t, "crown does not rise above the nav pill's top").toBeGreaterThanOrEqual(nav.y)

    // No horizontal overflow from the stage.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, "no horizontal overflow").toBe(0)

    // Pixel check: the hero's last 4px must be flat background, not sliced
    // mesh. The hero is taller than the fold, so the clip needs fullPage.
    const strip = await page.screenshot({
      fullPage: true,
      clip: { x: 0, y: Math.floor(hero.y + hero.height) - 4, width: vp.width, height: 4 },
    })
    const { median, max } = await luminanceStats(page, strip)
    expect(max - median, `hero bottom edge: brightest pixel ${max} vs median ${median} — a hard-clipped mesh leaves strokes here`).toBeLessThanOrEqual(40)
  })
}

test("brain rotates at idle, responds to a drag, and resumes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await waitForTelemetry(page)

  const r0 = await readRot(page)
  await expect
    .poll(async () => Math.abs((await readRot(page)) - r0), { message: "idle orbit advances", timeout: 6_000 })
    .toBeGreaterThanOrEqual(0.05)

  // Drag on the mesh, away from the headline and CTAs (left lobe).
  const before = await readRot(page)
  await page.mouse.move(300, 450)
  await page.mouse.down()
  await page.mouse.move(560, 450, { steps: 12 })
  await page.mouse.up()
  await expect
    .poll(async () => Math.abs((await readRot(page)) - before), { message: "drag rotates the brain", timeout: 4_000 })
    .toBeGreaterThanOrEqual(0.25)

  const afterDrag = await readRot(page)
  await expect
    .poll(async () => Math.abs((await readRot(page)) - afterDrag), { message: "auto-rotate resumes after release", timeout: 8_000 })
    .toBeGreaterThanOrEqual(0.05)
})

test("brain holds still under prefers-reduced-motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await waitForTelemetry(page)

  const r0 = await readRot(page)
  await page.waitForTimeout(2000)
  const r1 = await readRot(page)
  expect(Math.abs(r1 - r0), "no idle orbit under reduced motion").toBeLessThan(0.001)
})

/* ── Phone ─────────────────────────────────────────────────────────────
 * The phone tier is authored, not inherited, so it gets its own assertions
 * rather than a fifth entry in VIEWPORTS. Two things differ deliberately:
 *
 *  - The box is wider than the viewport, so the mesh bleeds off both edges.
 *    The desktop "mesh inside the viewport" bound would fail by design here;
 *    what matters instead is that the bleed never becomes horizontal scroll.
 *  - touch-action must be pan-y. OrbitControls stamps touch-action:none on the
 *    canvas when it connects, and with the mesh covering most of the screen
 *    that turns every vertical swipe into a rotation and traps the reader on
 *    the hero. This is the regression guard for that.
 */
const PHONES = [
  { width: 375, height: 667 }, // SE / small handset — the tightest case
  { width: 390, height: 844 },
  { width: 430, height: 932 }, // Pro Max — the box is bound by svh here, not vw
]

for (const vp of PHONES) {
test.describe(`phone ${vp.width}x${vp.height}`, () => {
  test.use({ viewport: vp, hasTouch: true, isMobile: true })

  test("brain fills the phone hero without stealing the scroll", async ({ page }) => {
    await waitForTelemetry(page)

    const box = await readBbox(page)
    const share = (box.b - box.t) / vp.height

    // Was ~0.40 when the phone inherited the desktop box and camera; the point
    // of the phone tier is that it reads as the centrepiece on a handset.
    expect(share, `mesh height share of viewport (${(box.b - box.t).toFixed(0)}px)`).toBeGreaterThanOrEqual(0.7)
    expect(share, "taller than this and the mesh swallows the CTAs").toBeLessThanOrEqual(0.92)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, "the box is wider than the viewport, but it must not scroll sideways").toBe(0)

    const touchAction = await page
      .locator(".hero-brain-underlay canvas")
      .first()
      .evaluate((el) => getComputedStyle(el).touchAction)
    expect(touchAction, "vertical swipes over the brain must scroll the page").toBe("pan-y")

    // And prove the page actually moves, rather than trusting the declaration.
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" as ScrollBehavior }))
    expect(await page.evaluate(() => Math.round(window.scrollY)), "page scrolls past the hero").toBeGreaterThan(500)
  })
})
}
