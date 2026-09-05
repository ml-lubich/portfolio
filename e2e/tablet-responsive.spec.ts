import { test, expect, type Page } from "@playwright/test"

/**
 * Tablet-class regressions (768–1180px):
 *
 *  1. Navbar clipping — `.nav-shell` and every visible control inside it
 *     (logo tile, desktop CTA / mobile hamburger) must stay fully inside the
 *     viewport, and the page must not scroll horizontally.
 *  2. Detail panel below the fold — opening a journey/project card must land
 *     the detail panel substantially in view without further scrolling.
 *  3. Logo containment — the logo image must stay inside the nav-shell box.
 */

const TABLET_WIDTHS = [768, 810, 834, 1024, 1180]
const HEIGHT = 1080

interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** Mirrors the app's own "mount every LazySection now" escape hatch (used by
 *  nav's woosh-scroll) instead of simulating a manual scroll pass.
 *
 *  Firing it once right after `domcontentloaded` races React hydration: if
 *  `LazySection`'s `portfolio:mount-all` listener hasn't registered yet, the
 *  event is lost and nothing below the fold ever mounts (verified — a real
 *  scroll pass mounts every section fine, only the single blind dispatch was
 *  racy). Retry the dispatch until `#journey` actually appears instead of a
 *  fixed wait, so this can't flake under a slow-hydrating page. */
async function mountAllSections(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return document.getElementById("journey") !== null
    },
    { timeout: 20_000, polling: 100 },
  )
}

function assertWithinViewport(box: Box, viewportWidth: number, label: string) {
  expect(box.x, `${label} left edge should be inside the viewport`).toBeGreaterThanOrEqual(-0.5)
  expect(
    box.x + box.width,
    `${label} right edge (${Math.round(box.x + box.width)}px) should be <= viewport width (${viewportWidth}px)`,
  ).toBeLessThanOrEqual(viewportWidth + 0.5)
}

for (const width of TABLET_WIDTHS) {
  test.describe(`navbar not clipped @ ${width}x${HEIGHT}`, () => {
    test.use({ viewport: { width, height: HEIGHT } })

    test.beforeEach(async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" })
      await expect(page.locator(".nav-shell")).toBeVisible()
    })

    test("nav-shell and its visible controls stay inside the viewport", async ({ page }) => {
      const shellBox = await page.locator(".nav-shell").boundingBox()
      expect(shellBox, "nav-shell should have a bounding box").not.toBeNull()
      assertWithinViewport(shellBox!, width, ".nav-shell")

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.scrollingElement?.scrollWidth ?? 0,
        innerWidth: window.innerWidth,
      }))
      expect(
        overflow.scrollWidth,
        "document.scrollingElement.scrollWidth must not exceed innerWidth",
      ).toBeLessThanOrEqual(overflow.innerWidth + 1)

      // Visible-child cluster: logo tile, desktop "Get In Touch" CTA (>=lg),
      // mobile hamburger (<lg). Only the ones actually rendered are checked.
      const candidateSelectors = [
        'nav a[aria-label="Back to top"]',
        'nav a[aria-label="Get In Touch"]',
        'nav button[aria-label="Toggle menu"]',
      ]
      for (const selector of candidateSelectors) {
        const locator = page.locator(selector).first()
        if (!(await locator.isVisible())) continue
        const box = await locator.boundingBox()
        expect(box, `${selector} should have a bounding box`).not.toBeNull()
        assertWithinViewport(box!, width, selector)
      }
    })

    test("logo mark stays inside the nav-shell bounds", async ({ page }) => {
      const shellBox = await page.locator(".nav-shell").boundingBox()
      // The mark is the metallic ML monogram PNG rendered by SiteLogoMark — it
      // stopped being an inline <svg> when that brand mark landed, and this
      // selector went on waiting 90s for an element that no longer exists.
      const logoBox = await page.locator('nav a[aria-label="Back to top"] img').boundingBox()
      expect(shellBox, "nav-shell bounding box").not.toBeNull()
      expect(logoBox, "logo image bounding box").not.toBeNull()

      expect(logoBox!.x, "logo left edge should be inside nav-shell").toBeGreaterThanOrEqual(shellBox!.x - 0.5)
      expect(logoBox!.y, "logo top edge should be inside nav-shell").toBeGreaterThanOrEqual(shellBox!.y - 0.5)
      expect(
        logoBox!.x + logoBox!.width,
        "logo right edge should be inside nav-shell",
      ).toBeLessThanOrEqual(shellBox!.x + shellBox!.width + 0.5)
      expect(
        logoBox!.y + logoBox!.height,
        "logo bottom edge should be inside nav-shell",
      ).toBeLessThanOrEqual(shellBox!.y + shellBox!.height + 0.5)
    })
  })
}

const DETAIL_VIEWPORTS = [
  { width: 810, height: 1080 },
  { width: 1024, height: 768 },
]

/** Panel must be readable without the user scrolling further: mostly on-screen, near the top. */
async function assertPanelSubstantiallyInView(page: Page, viewportHeight: number) {
  const panel = page.getByRole("dialog").first()
  await expect(panel).toBeVisible()
  await page.waitForTimeout(700) // let scrollIntoView / slide-in transition settle

  const box = await panel.boundingBox()
  expect(box, "detail panel bounding box").not.toBeNull()

  expect(box!.y, "panel top should be at/below the viewport top").toBeGreaterThanOrEqual(0)
  expect(
    box!.y,
    "panel top should be in the upper half of the viewport (no extra scroll needed)",
  ).toBeLessThan(viewportHeight * 0.5)

  const visibleTop = Math.max(box!.y, 0)
  const visibleBottom = Math.min(box!.y + box!.height, viewportHeight)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)
  const ratio = visibleHeight / box!.height
  expect(
    ratio,
    `at least 60% of the panel height should be visible without scrolling (was ${Math.round(ratio * 100)}%)`,
  ).toBeGreaterThanOrEqual(0.6)
}

for (const viewport of DETAIL_VIEWPORTS) {
  test.describe(`detail panel in view on tablet @ ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test.beforeEach(async ({ page }) => {
      // Freeze the project marquee's auto-scroll (CSS already honors this
      // media query) so clicking a card isn't fighting a moving target.
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto("/", { waitUntil: "domcontentloaded" })
      await mountAllSections(page)
    })

    test("opening the first journey card lands the detail panel in view", async ({ page }) => {
      await page.locator("#journey").scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)

      await page.locator("#journey button").first().click()
      await assertPanelSubstantiallyInView(page, viewport.height)
    })

    test("opening the first project card lands the detail panel in view", async ({ page }) => {
      await page.locator("#projects").scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)

      await page.locator('#projects article[role="button"]').first().click()
      await assertPanelSubstantiallyInView(page, viewport.height)
    })
  })
}
