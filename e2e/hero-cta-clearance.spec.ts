import { test, expect, type Page } from "@playwright/test"

/**
 * Hero CTAs vs the brain — the "buttons are sitting on my brain" guard.
 *
 * The hero used to draw the whole copy stack, CTA pills included, centred on
 * top of a full-bleed wireframe: both pills and the blurred tertiary bar
 * landed dead in the middle of the mesh, and the mesh centre was dimmed by
 * two stacked scrims so the type over it stayed legible. The result read as a
 * grey blob with buttons on it rather than josephheupler.com's bright brain.
 *
 * Everything here is geometry and rendered pixels, never class names:
 *
 *  - CTA rects must not intersect the <canvas> rect, at desktop and phone.
 *  - elementFromPoint at each CTA's centre must return that CTA (or a child),
 *    i.e. the button is genuinely on top and clickable, not under the canvas.
 *  - The canvas must actually re-render between two samples — the same region
 *    screenshotted at t0 and t1 has to differ. A mounted <Canvas> proves
 *    nothing; a frozen brain still mounts.
 *  - A 390×844 phone must not scroll sideways and must not trap the reader
 *    on the hero.
 */

type Box = { l: number; t: number; r: number; b: number }

const intersects = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t

async function heroReady(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect
    .poll(
      async () =>
        (await page.locator(".hero-brain-underlay canvas").first().getAttribute("data-brain-bbox")) ?? "",
      { message: "brain telemetry appears once the mesh renders", timeout: 30_000 },
    )
    .toMatch(/^-?\d+,-?\d+,-?\d+,-?\d+$/)
  // Let the entrance ladder finish so the CTA row is at its settled position.
  await page.waitForTimeout(3000)
}

/** Canvas rect plus every CTA's rect and what is actually on top of it. */
async function heroGeometry(page: Page) {
  return page.evaluate(() => {
    const rect = (el: Element): Box => {
      const b = el.getBoundingClientRect()
      return { l: b.left, t: b.top, r: b.right, b: b.bottom }
    }
    const canvas = document.querySelector(".hero-brain-underlay canvas")
    const ctas = [...document.querySelectorAll<HTMLElement>("#hero [data-weight]")]
    return {
      canvas: canvas ? rect(canvas) : null,
      ctas: ctas.map((el) => {
        const b = el.getBoundingClientRect()
        const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
        return {
          label: (el.textContent ?? "").trim().slice(0, 24),
          weight: el.dataset.weight ?? "?",
          rect: rect(el),
          hitsSelf: !!top && (top === el || el.contains(top)),
          hitTag: top ? `${top.tagName}.${(top.className || "").toString().slice(0, 30)}` : "null",
        }
      }),
    }
  })
}

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 720 },
  { name: "phone", width: 390, height: 844 },
]) {
  test(`CTAs clear the brain canvas and stay clickable at ${vp.name} ${vp.width}×${vp.height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await heroReady(page)

    const { canvas, ctas } = await heroGeometry(page)
    expect(canvas, "the brain canvas must exist").not.toBeNull()
    expect(ctas.length, "the hero CTA row must render").toBeGreaterThanOrEqual(5)

    for (const cta of ctas) {
      expect(
        intersects(cta.rect, canvas!),
        `CTA "${cta.label}" (${JSON.stringify(cta.rect)}) must not overlap the brain canvas (${JSON.stringify(canvas)})`,
      ).toBe(false)
      expect(cta.hitsSelf, `CTA "${cta.label}" must be the topmost element at its own centre, got <${cta.hitTag}>`).toBe(
        true,
      )
    }
  })
}

test("the brain canvas re-renders over time (it is not a frozen frame)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await heroReady(page)

  const canvas = page.locator(".hero-brain-underlay canvas").first()
  const a = await canvas.screenshot()
  await page.waitForTimeout(1500)
  const b = await canvas.screenshot()

  // Byte-identical PNGs of the same region 1.5s apart = nothing moved.
  expect(a.equals(b), "the brain canvas painted an identical frame 1.5s later — it is not rotating").toBe(false)

  // And quantify it: the mean absolute pixel difference has to be real, not
  // one stray antialiased edge.
  const meanDiff = await page.evaluate(
    async ([p, q]) => {
      const load = async (b64: string) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const c = document.createElement("canvas")
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext("2d")!.drawImage(img, 0, 0)
        return c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data
      }
      const [x, y] = [await load(p), await load(q)]
      let sum = 0
      for (let i = 0; i < x.length; i += 4) sum += Math.abs(x[i] - y[i])
      return sum / (x.length / 4)
    },
    [a.toString("base64"), b.toString("base64")] as const,
  )
  expect(meanDiff, "mean per-pixel change across the canvas over 1.5s").toBeGreaterThan(0.5)
})

test.describe("phone 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test("no horizontal overflow and no scroll trap on the hero", async ({ page }) => {
    await heroReady(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, "the hero must not scroll sideways").toBe(0)

    const touchAction = await page
      .locator(".hero-brain-underlay canvas")
      .first()
      .evaluate((el) => getComputedStyle(el).touchAction)
    expect(touchAction, "vertical swipes over the brain must scroll the page").toBe("pan-y")

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" as ScrollBehavior }))
    expect(await page.evaluate(() => Math.round(window.scrollY)), "the page scrolls past the hero").toBeGreaterThan(500)
  })
})
