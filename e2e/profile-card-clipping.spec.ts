import { expect, test, type Page } from "@playwright/test"

async function checkProfileClipping(page: Page, hover: boolean) {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  const profile = page.locator("#profile")
  const reveal = profile.locator("section.animated-section")
  const card = reveal.locator(":scope > div.group.relative")
  await profile.scrollIntoViewIfNeeded()
  await expect(reveal).toHaveAttribute("data-reveal-settled", "true")

  for (const ancestor of [profile, reveal]) {
    await expect(ancestor).toHaveCSS("overflow-x", "visible")
    await expect(ancestor).toHaveCSS("overflow-y", "visible")
  }
  // Clipping belongs to the rounded card itself, so its glare stays inside.
  await expect(card).toHaveCSS("overflow-x", "hidden")
  await expect(card).toHaveCSS("overflow-y", "hidden")
  expect(await card.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(0)

  if (hover) {
    await card.hover({ position: { x: 60, y: 60 } })
    await expect.poll(async () => card.evaluate((el) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
      return Math.abs(matrix.m13) + Math.abs(matrix.m23)
    }), { message: "real pointer movement tilts the profile card" }).toBeGreaterThan(0.01)
    // Wait for the hover transition before measuring the resulting layout.
    await card.evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((animation) => animation.finished))
    })
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    "profile interaction must not cause horizontal page overflow").toBeLessThanOrEqual(1)
}

test.describe("desktop profile card", () => {
  test.skip(({ isMobile }) => isMobile, "requires a desktop pointer context")
  for (const width of [1440, 834]) {
    test(`tilted corners stay unclipped at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await checkProfileClipping(page, true)
    })
  }
})

test.describe("mobile profile card", () => {
  test.skip(({ isMobile }) => !isMobile, "requires the mobile touch context")
  test("keeps the rounded card contained at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await checkProfileClipping(page, false)
  })
})
