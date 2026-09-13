import { test, expect, type Page } from "@playwright/test"

/**
 * Mounting lazy sections must not move the page under the reader.
 *
 * Each LazySection reserves a per-viewport floor close to its real height
 * (app/page.tsx). If a floor is too short the section grows on mount; growth
 * ABOVE the viewport walks the reader down the page — Chrome's scroll
 * anchoring masks it, Safari has none, so it shows on an iPhone. Two reads:
 * total document growth from "nothing mounted" to "everything mounted", and
 * the drift of whatever sits under the viewport centre while sitting still
 * mid-page (the owner's actual symptom).
 */

async function mountAll(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return document.querySelectorAll('[data-lazy-loaded="false"]').length === 0
    },
    { timeout: 30_000, polling: 100 },
  )
  // Chunks resolve after the wrappers flip; wait for the real sections.
  await page.waitForFunction(
    () => document.querySelectorAll('[data-lazy-loaded="true"] > section, [data-lazy-loaded="true"] > div > section').length >= 10,
    { timeout: 30_000, polling: 100 },
  )
  await page.waitForTimeout(1500)
}

test("mounting every section grows the document by at most a few hundred px", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-lazy-loaded]")
  const before = await page.evaluate(() => document.documentElement.scrollHeight)
  await mountAll(page)
  const after = await page.evaluate(() => document.documentElement.scrollHeight)
  // Floors are trimmed 2% under the measured wrapper height (~28k px of
  // sections on a phone), so ~600px of growth is the designed residue; it
  // was +15.9k / +23.8k before the per-section floors.
  expect(after - before, `document grew ${before} -> ${after}`).toBeLessThanOrEqual(800)
})

test("sitting still mid-page, the content under the reader does not drift", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-lazy-loaded]", { state: "attached" })
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5))
  await page.waitForTimeout(300)
  // Layout position of the block under the viewport centre, via the
  // offsetTop chain: the section reveal animates transform (scale/translate),
  // which moves getBoundingClientRect without moving any layout — only real
  // layout movement counts here.
  const layoutTop = `(() => {
    const w = window;
    if (!w.__anchor) {
      const leaf = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      w.__anchor = leaf && (leaf.closest("div, section, li, p, h2, h3") || leaf);
    }
    let el = w.__anchor, y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return Math.round(y - scrollY);
  })()`
  const before = await page.evaluate<number>(layoutTop)
  await page.waitForTimeout(4000)
  const after = await page.evaluate<number>(layoutTop)
  expect(Math.abs(after - before), `anchor moved ${before} -> ${after} while idle`).toBeLessThanOrEqual(24)
})
