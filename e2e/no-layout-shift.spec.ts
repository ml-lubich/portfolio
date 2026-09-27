import { test, expect } from "@playwright/test"

/**
 * Regression: nothing above #contact should change height once it's mounted.
 *
 * Bug: ai-expertise's typing terminal, its "Core Proficiency" auto-cycling
 * panel, and the open-source showcase's featured-tool terminal all reserved
 * less than their final height, so the section around them grew/shrank for
 * several seconds after landing — read by Safari (no scroll anchoring) as
 * the page scrolling itself.
 */

async function readSectionHeights(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((el) => ({
      id: el.dataset.section,
      height: el.getBoundingClientRect().height,
    })),
  )
}

test("no [data-section] element changes height after mount", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForFunction(
    () => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return document.getElementById("contact") !== null
    },
    undefined,
    { timeout: 30_000, polling: 100 },
  )

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)

  const before = await readSectionHeights(page)

  await page.waitForTimeout(5000)

  const after = await readSectionHeights(page)

  const changed = before
    .map((b, i) => ({ id: b.id, before: b.height, after: after[i]?.height ?? -1 }))
    .filter((r) => Math.abs(r.after - r.before) > 2)

  expect(changed, `sections changed height: ${JSON.stringify(changed)}`).toEqual([])
})
