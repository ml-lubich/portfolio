import { test, expect, type Page } from "@playwright/test"

/**
 * Cross-page visual invariants that keep regressing in ad-hoc ways:
 *
 *  1. No horizontal overflow at the three widths that matter most (small
 *     phone, tablet, desktop) — complements wide-layout.spec.ts (2560/3840)
 *     and tablet-responsive.spec.ts (768-1180, homepage-only).
 *  2. Every <img> actually loads (naturalWidth > 0) — a broken remote image
 *     reference ships silently otherwise.
 *  3. No "ghosting" card: a `bg-card`-styled panel whose *resolved* CSS
 *     background color is indistinguishable from the page's own background —
 *     the class of bug behind "black cards on scroll" / invisible light-mode
 *     cards. `light-mode-contrast.test.ts` (vitest) greps source for known
 *     hard-coded-fill patterns; this checks the rendered, cascaded, runtime
 *     value instead, so it catches anything that resolves wrong regardless
 *     of how the source looks.
 *
 * Light mode is currently shipped disabled (`lib/light-mode.ts`,
 * `forcedTheme="dark"`) — the toggle isn't even rendered — so only dark, the
 * theme that actually ships, is checked here. Run with
 * `NEXT_PUBLIC_LIGHT_MODE=1` (and update this file to drop the skip) once
 * light mode is re-enabled by default; until then a "light mode" pass here
 * would just be dark mode twice.
 */

const ROUTES = ["/", "/blog", "/tools", "/llm-prices", "/games", "/demo", "/privacy", "/terms"]
const WIDTHS = [390, 834, 1440]

/**
 * Mount every LazySection (see components/layout/lazy-section.tsx) by
 * dispatching its `portfolio:mount-all` escape hatch and polling the real
 * DOM condition — `[data-lazy-loaded="false"]` wrappers remaining — instead
 * of scrolling with a fixed delay and hoping mounting kept up in time. A
 * fixed delay is a guess at how long hydration + mount takes; under CPU
 * contention that guess is wrong and a page gets measured before its
 * content exists. Works on every route: pages with no LazySections have
 * nothing matching the selector and the wait resolves on the first check.
 */
async function mountAllSections(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return document.querySelectorAll('[data-lazy-loaded="false"]').length === 0
    },
    { timeout: 20_000, polling: 100 },
  )
  await page.waitForTimeout(200) // one settle pass for post-mount layout
}

for (const width of WIDTHS) {
  test.describe(`no horizontal overflow @ ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    for (const route of ROUTES) {
      test(`${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "domcontentloaded" })
        await mountAllSections(page)
        const widths = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scroll: document.scrollingElement?.scrollWidth ?? 0,
        }))
        expect(widths.scroll, `${route} @ ${width}px: scrollWidth vs clientWidth`).toBeLessThanOrEqual(
          widths.viewport + 1,
        )
      })
    }
  })
}

test.describe("images load", () => {
  for (const route of ROUTES) {
    test(`every <img> on ${route} loads`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      await mountAllSections(page)
      await page.waitForTimeout(500)
      const broken = await page.$$eval("img", (imgs) =>
        imgs
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.src || img.getAttribute("data-src") || "(no src)"),
      )
      expect(broken, `broken <img> sources on ${route}`).toEqual([])
    })
  }
})

test.describe("card/page background ghosting (dark mode)", () => {
  for (const route of ROUTES) {
    test(`no bg-card panel matches the page background on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      await mountAllSections(page)

      const offenders = await page.evaluate(() => {
        const parseRgb = (s: string): [number, number, number, number] | null => {
          const m = s.match(/rgba?\(([^)]+)\)/)
          if (!m) return null
          const parts = m[1].split(",").map((n) => parseFloat(n.trim()))
          return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts.length > 3 ? parts[3] : 1]
        }

        const pageBg = parseRgb(getComputedStyle(document.body).backgroundColor)
        if (!pageBg) return []

        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>('[class*="bg-card"], [role="dialog"]'),
        )

        const bad: string[] = []
        for (const el of candidates) {
          const rect = el.getBoundingClientRect()
          if (rect.width < 24 || rect.height < 24) continue // ignore icon-sized chips
          const bg = parseRgb(getComputedStyle(el).backgroundColor)
          if (!bg) continue
          const [r, g, b, a] = bg
          if (a < 0.4) continue // genuinely translucent glass — not the ghosting bug
          const close = Math.abs(r - pageBg[0]) <= 3 && Math.abs(g - pageBg[1]) <= 3 && Math.abs(b - pageBg[2]) <= 3
          if (close) {
            bad.push(
              `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${Array.from(el.classList).join(".")}`,
            )
          }
        }
        return bad
      })

      expect(offenders, `card(s) whose resolved background matches the page background on ${route}`).toEqual([])
    })
  }
})
