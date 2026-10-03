import { test, expect, type Page } from "@playwright/test"

/**
 * Scroll devices B — AI expertise opacity reveals (the Contact kinetic band was removed).
 *
 * Wide, mouse-driven, motion-ok viewport: each device publishes
 * `data-sc-verify-state` and it must CHANGE with scroll. Compact (phone) and
 * reduced-motion: no state, no band, markup as before.
 */

const DESKTOP = { width: 1600, height: 1000 }
const PHONE = { width: 390, height: 844 }

async function mountAll(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForFunction(
    () => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return ["ai-expertise", "contact"].every((id) => document.getElementById(id) !== null)
    },
    undefined,
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

const readState = (page: Page, id: string, prefix: string): Promise<string | null> =>
  page.evaluate(
    ([sid, pre]) =>
      document.querySelector<HTMLElement>(`#${sid} [data-sc-verify-state^="${pre}"]`)?.dataset.scVerifyState ?? null,
    [id, prefix] as const,
  )

test.describe("desktop: scroll changes what the sections paint", () => {
  test.skip(({ isMobile }) => isMobile, "scroll devices are desktop-only by design")
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await mountAll(page)
  })

  test("AI expertise reveals complete with scroll and never leave content hidden", async ({ page }) => {
    await scrollSectionTo(page, "ai-expertise", 0.9)
    await expect.poll(() => readState(page, "ai-expertise", "reveal:"), { timeout: 8_000 }).toMatch(/^reveal:[0-4]$/)
    const early = await readState(page, "ai-expertise", "reveal:")

    await scrollSectionTo(page, "ai-expertise", -1.2)
    await expect
      .poll(() => readState(page, "ai-expertise", "reveal:"), { timeout: 8_000 })
      .toBe("reveal:4")
    expect(early).not.toBe("reveal:4")

    // The constellation scrub's own state is still the first one in the section.
    expect(await readState(page, "ai-expertise", "node:")).toMatch(/^node:\d$/)
    // Past the midpoint nothing in the section is dimmed by the reveal.
    const minOpacity = await page.evaluate(() => {
      const col = document.querySelector("#ai-expertise > div:last-child") as HTMLElement
      return Math.min(...[1, 2, 3, 4].map((i) => {
        const c = col.children[i] as HTMLElement
        const t = c.tagName === "SECTION" ? (c.firstElementChild as HTMLElement) : c
        return Number(getComputedStyle(t).opacity)
      }))
    })
    expect(minOpacity).toBe(1)
  })

  test("contact has no ghost band text and adds no horizontal scroll", async ({ page }) => {
    await scrollSectionTo(page, "contact", 0.5)
    await expect(page.locator("#contact", { hasText: /LET['\u2019]S BUILD/i })).toHaveCount(0)
    expect(await readState(page, "contact", "band:")).toBeNull()
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )
    expect(noOverflow).toBe(true)
  })
})

test.describe("compact and reduced motion: devices never attach", () => {
  test("phone: no state, no band", async ({ page }) => {
    await page.setViewportSize(PHONE)
    await mountAll(page)
    for (const [id, pre] of [["ai-expertise", "reveal:"], ["contact", "band:"]] as const) {
      await scrollSectionTo(page, id, 0.5)
      await page.waitForTimeout(300)
      expect(await readState(page, id, pre)).toBeNull()
    }
    await expect(page.locator("#contact", { hasText: "LET'S BUILD" }).locator("[aria-hidden='true']")).toHaveCount(0)
  })

  test("reduced motion on desktop: no state, no band", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await mountAll(page)
    for (const [id, pre] of [["ai-expertise", "reveal:"], ["contact", "band:"]] as const) {
      await scrollSectionTo(page, id, 0.5)
      await page.waitForTimeout(300)
      expect(await readState(page, id, pre)).toBeNull()
    }
  })
})
