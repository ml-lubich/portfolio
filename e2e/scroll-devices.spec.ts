import { test, expect, type Page } from "@playwright/test"

/**
 * Scroll devices below the hero — what actually paints, per scroll-craft.
 *
 * Each device publishes its rendered state as `data-sc-verify-state` on the
 * element it drives. On a wide, mouse-driven, motion-ok viewport that state
 * must CHANGE as the section travels through the viewport (no dead scroll),
 * and under prefers-reduced-motion it must NOT — the hook never attaches, so
 * the section is exactly what it was before these devices existed.
 *
 * 1600×1000 is the scroll-stack skill's reference desktop; anything ≤1366
 * routes to the static branch by design, so a 1440-wide run would test
 * nothing here.
 */

const DESKTOP = { width: 1600, height: 1000 }

const IDS = ["ai-expertise", "consulting", "testimonials"] as const

/** Mount every LazySection via the app's own escape hatch, then settle. */
async function mountAll(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForFunction(
    (wanted: readonly string[]) => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return wanted.every((id) => document.getElementById(id) !== null)
    },
    IDS,
    { timeout: 30_000, polling: 100 },
  )
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

async function scrollSectionTo(page: Page, id: string, viewportFraction: number): Promise<void> {
  await page.evaluate(
    ([sid, f]) => {
      const el = document.getElementById(sid as string)!
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, Math.max(0, top - window.innerHeight * (f as number)))
    },
    [id, viewportFraction] as const,
  )
}

async function readState(page: Page, id: string): Promise<string | null> {
  return page.evaluate((sid) => {
    const section = document.getElementById(sid)!
    const el = section.matches("[data-sc-verify-state]")
      ? section
      : section.querySelector<HTMLElement>("[data-sc-verify-state]")
    return el?.dataset.scVerifyState ?? null
  }, id)
}

test.describe("desktop: scroll changes what the section paints", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await mountAll(page)
  })

  test("skill map is scrubbed by scroll: node index follows travel through the viewport", async ({ page }) => {
    await scrollSectionTo(page, "ai-expertise", 0.6)
    await expect.poll(() => readState(page, "ai-expertise"), { timeout: 8_000 }).toMatch(/^node:\d$/)
    const first = await readState(page, "ai-expertise")

    await scrollSectionTo(page, "ai-expertise", -0.6)
    await expect
      .poll(() => readState(page, "ai-expertise"), { message: "node changes as the section scrolls through", timeout: 8_000 })
      .not.toBe(first)

    // The panel says so, and the timer's progress line is gone while scrubbing.
    await expect(page.getByText("Scroll to trace")).toBeVisible()
    await expect(page.locator("#ai-expertise .cycle-progress")).toHaveCount(0)
  })

  test("consulting rail pans with the wheel: scroll moves it far more than idle drift does", async ({ page }) => {
    // The hook measures the RAIL's own travel, and the rail sits below the
    // section's header and intro — anchor on it, or the wheel below scrolls
    // while the rail is still under the fold and the impulse is ~0 (which
    // is exactly what a first version of this test measured).
    await scrollSectionTo(page, "consulting", 0)
    await expect.poll(() => readState(page, "consulting"), { timeout: 8_000 }).toMatch(/^rail:-?\d+$/)
    await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>("#consulting .client-carousel")!
      window.scrollTo(0, rail.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6)
    })
    // Let any momentum from positioning decay before the idle baseline.
    await page.waitForTimeout(1500)

    // Idle: the rail drifts on its own at a few tens of px/s.
    const idle0 = Number((await readState(page, "consulting"))!.split(":")[1])
    await page.waitForTimeout(1000)
    // A scroll event is needed to republish; a 1px nudge is not wheel travel worth an impulse.
    await page.mouse.wheel(0, 1)
    await page.waitForTimeout(150)
    const idle1 = Number((await readState(page, "consulting"))!.split(":")[1])
    const idleDrift = Math.abs(idle1 - idle0)

    // Scroll like a wheel: headless Chromium applies mouse.wheel(0, 500) as one
    // instant 500px jump, which the device's jump guard rightly ignores (a
    // resize or anchor jump is not travel). Real wheels send ~100px ticks.
    const before = idle1
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100)
      await page.waitForTimeout(30)
    }
    await expect
      .poll(async () => Math.abs(Number((await readState(page, "consulting"))!.split(":")[1]) - before), {
        message: `rail travels with scroll (idle drift over 1s was ${idleDrift}px)`,
        timeout: 4_000,
      })
      .toBeGreaterThan(idleDrift * 2 + 80)
  })

  test("testimonials ground shifts colour through the section and is dark at both ends", async ({ page }) => {
    await scrollSectionTo(page, "testimonials", 1.2)
    await expect.poll(() => readState(page, "testimonials"), { timeout: 8_000 }).toMatch(/^ground:\d+$/)
    const atEntry = Number((await readState(page, "testimonials"))!.split(":")[1])
    expect(atEntry, "ground is untinted before the section enters").toBeLessThanOrEqual(5)

    await scrollSectionTo(page, "testimonials", 0.15)
    await expect
      .poll(async () => Number((await readState(page, "testimonials"))!.split(":")[1]), {
        message: "ground tint peaks while the section is centred",
        timeout: 8_000,
      })
      .toBeGreaterThanOrEqual(70)
  })
})

test.describe("reduced motion: the devices never attach", () => {
  test("no state changes with scroll under prefers-reduced-motion", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await mountAll(page)

    for (const id of ["ai-expertise", "testimonials"] as const) {
      await scrollSectionTo(page, id, 0.8)
      await page.waitForTimeout(300)
      const a = await readState(page, id)
      await scrollSectionTo(page, id, -0.5)
      await page.waitForTimeout(300)
      const b = await readState(page, id)
      expect(b, `${id} must not publish scroll-driven state under reduce`).toBe(a)
    }
    // And the panel never claims to be scrubbable.
    await expect(page.getByText("Scroll to trace")).toHaveCount(0)
  })
})
