import { test, expect, type Page } from "@playwright/test"

/**
 * Scroll devices A: About parallax depth and Open-source progress rail.
 * Wide + mouse + motion-ok: published state changes with scroll.
 * Compact (phone) and reduced motion: no state attribute, no rail node.
 */

const DESKTOP = { width: 1600, height: 1000 }
const IDS = ["about", "open-source"] as const

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
    const el = document.getElementById(sid)!.querySelector<HTMLElement>("[data-sc-verify-state]")
    return el?.dataset.scVerifyState ?? null
  }, id)
}

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "desktop-only by design")
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await mountAll(page)
  })

  test("about parallax depth changes with scroll and stays within the 40px cap", async ({ page }) => {
    await scrollSectionTo(page, "about", 0.9)
    await expect.poll(() => readState(page, "about"), { timeout: 8_000 }).toMatch(/^depth:-?\d+$/)
    const first = await readState(page, "about")
    await scrollSectionTo(page, "about", -0.3)
    await expect.poll(() => readState(page, "about"), { timeout: 8_000 }).not.toBe(first)
    const n = Number((await readState(page, "about"))!.split(":")[1])
    expect(Math.abs(n)).toBeLessThanOrEqual(40)
  })

  test("open-source rail is aria-hidden and fills as the section is scrolled", async ({ page }) => {
    await scrollSectionTo(page, "open-source", 0.9)
    await expect.poll(() => readState(page, "open-source"), { timeout: 8_000 }).toMatch(/^rail:\d+$/)
    const first = Number((await readState(page, "open-source"))!.split(":")[1])
    await scrollSectionTo(page, "open-source", -0.4)
    await expect
      .poll(async () => Number((await readState(page, "open-source"))!.split(":")[1]), { timeout: 8_000 })
      .toBeGreaterThan(first + 20)
    await expect(page.locator('#open-source [data-sc-verify-state="rail:0"], #open-source [data-sc-verify-state^="rail:"]').first()).toHaveAttribute("aria-hidden", "true")
  })
})

test.describe("reduced motion", () => {
  test("neither device attaches or adds markup", async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await mountAll(page)
    for (const id of IDS) {
      await scrollSectionTo(page, id, 0.5)
      await page.waitForTimeout(300)
      expect(await readState(page, id), `${id} publishes no state under reduce`).toBeNull()
    }
  })
})

test.describe("compact (phone)", () => {
  test.skip(({ isMobile }) => !isMobile, "phone project only")
  test("no state attribute changes and no rail node", async ({ page }) => {
    await mountAll(page)
    for (const id of IDS) {
      await scrollSectionTo(page, id, 0.8)
      await page.waitForTimeout(300)
      expect(await readState(page, id)).toBeNull()
    }
  })
})
