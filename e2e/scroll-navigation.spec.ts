import { test, expect, type Page } from "@playwright/test"

/**
 * Regression: clicking "Get In Touch" must land on #contact and STAY there.
 *
 * Bug: #contact lives in a LazySection near the page bottom. navigateTo()
 * computed the target Y while intermediate LazySections were still collapsed
 * placeholders; as the woosh scroll passed them they mounted and expanded,
 * shifting layout by thousands of px — the user ended up far above #contact
 * ("something scrolls me back up").
 */

const NAV_OFFSET = 80

/** Resolve once window.scrollY has been stable for ~1s (woosh + lazy-mount churn done). */
async function settledScrollY(page: Page): Promise<number> {
  return page.evaluate(async () => {
    let last = window.scrollY
    let stableTicks = 0
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 200))
      const y = window.scrollY
      if (Math.abs(y - last) < 1) {
        stableTicks++
        if (stableTicks >= 5) return y
      } else {
        stableTicks = 0
      }
      last = y
    }
    return window.scrollY
  })
}

async function contactViewportTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.getElementById("contact")
    if (!el) return Number.POSITIVE_INFINITY
    return el.getBoundingClientRect().top
  })
}

async function expectLandedOnContact(page: Page) {
  await settledScrollY(page)
  const top = await contactViewportTop(page)
  // #contact heading should sit near the nav offset — generous band, but a
  // landing thousands of px above (the bug) blows way past it.
  expect(top, "#contact top after scroll settles").toBeGreaterThan(-300)
  expect(top, "#contact top after scroll settles").toBeLessThan(900 * 0.6)

  // "Scrolls me back up": position must not drift after settling.
  await page.waitForTimeout(1500)
  const topAfter = await contactViewportTop(page)
  expect(Math.abs(topAfter - top), "#contact drift after settle").toBeLessThan(150)
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: /get in touch/i })).toBeVisible()
})

test("hero 'Get In Touch' button scrolls to #contact and stays", async ({ page }) => {
  await page.getByRole("button", { name: /get in touch/i }).click()
  await expectLandedOnContact(page)
})

test("nav 'Get In Touch' pill scrolls to #contact and stays", async ({ page }) => {
  await page.locator("nav a[href='#contact']").first().click()
  await expectLandedOnContact(page)
})

test("nav section link ('Journey') lands on its section and stays", async ({ page }) => {
  await page.locator("nav a[href='#journey']").first().click()
  await settledScrollY(page)
  const top = await page.evaluate(
    () => document.getElementById("journey")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
  )
  expect(top, "#journey top after scroll settles").toBeGreaterThan(-300)
  expect(top, "#journey top after scroll settles").toBeLessThan(900 * 0.6)
})

// NAV_OFFSET documented for future tightening; the band above is deliberately loose
// so the test is timing-robust while still catching multi-thousand-px misses.
void NAV_OFFSET
