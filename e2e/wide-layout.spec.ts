import { test, expect, type Page } from "@playwright/test"

/**
 * Wide-viewport layout invariants — the page must not "fall apart" when the
 * window is very wide (large monitors, or normal monitors at 50% browser
 * zoom, which multiplies the CSS viewport width the same way).
 *
 * Invariants:
 *  1. No horizontal document overflow (nothing pushes the page sideways).
 *  2. Every content section is centered on the viewport and bounded by a
 *     max-width container (no left-anchored or off-center ribbons).
 *  3. Marquee strips loop seamlessly: a `translateX(-50%)` loop only covers
 *     the viewport at every animation offset when HALF the track is at least
 *     as wide as the strip's visible box. Anything less and a blank gap
 *     sweeps across the row (the "looks broken zoomed out" bug).
 */

const WIDE_VIEWPORTS = [
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
]

/** Content sections that must be centered within a bounded container. */
const CENTERED_SECTION_IDS = [
  "consulting",
  "testimonials",
  "projects",
  "skills",
  "github",
  "research",
  "contact",
  "about",
  "journey",
  "ai-expertise",
]

/**
 * Mount every LazySection via the app's own `portfolio:mount-all` escape
 * hatch (same mechanism `tablet-responsive.spec.ts` uses), retrying the
 * dispatch until every section id this file checks actually exists — rather
 * than scrolling with fixed delays and hoping mounting kept up. A fixed
 * delay is a guess at how long hydration + mount takes; under CPU
 * contention (many concurrent browser contexts, a loaded dev box) that
 * guess is wrong and the section is measured before it exists, which is
 * exactly the "#consulting should exist" / "marquee rows should exist"
 * flake this used to produce. Polling the real condition has no such
 * ceiling — it only takes as long as mounting actually takes.
 */
async function mountAllSections(page: Page, ids: readonly string[]): Promise<void> {
  await page.waitForFunction(
    (wantedIds: readonly string[]) => {
      window.dispatchEvent(new Event("portfolio:mount-all"))
      return wantedIds.every((id) => document.getElementById(id) !== null)
    },
    ids,
    { timeout: 30_000, polling: 100 },
  )
  // Layout needs one settle pass after mount (marquee tracks compute their
  // width from post-mount DOM); back at the top so hero-relative assertions
  // aren't affected by whatever scroll position mounting left us at.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

for (const viewport of WIDE_VIEWPORTS) {
  test.describe(`wide layout @ ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test.beforeEach(async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" })
      await mountAllSections(page, CENTERED_SECTION_IDS)
    })

    test("no horizontal overflow", async ({ page }) => {
      const widths = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        html: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }))
      expect(widths.html, "html scrollWidth must not exceed viewport").toBeLessThanOrEqual(widths.viewport + 1)
      expect(widths.body, "body scrollWidth must not exceed viewport").toBeLessThanOrEqual(widths.viewport + 1)
    })

    test("content sections are centered and bounded", async ({ page }) => {
      const results = await page.evaluate((ids: string[]) => {
        const vw = document.documentElement.clientWidth
        return ids.map((id) => {
          const el = document.getElementById(id)
          if (!el) return { id, missing: true, bounded: false, offCenter: 0, width: 0, maxWidth: 0 }
          // Find the first max-width-bounded container in the section.
          let target: HTMLElement | null = null
          const candidates = [el, ...Array.from(el.querySelectorAll<HTMLElement>("*")).slice(0, 60)]
          for (const c of candidates) {
            const mw = getComputedStyle(c).maxWidth
            if (mw !== "none" && mw.endsWith("px")) {
              target = c
              break
            }
          }
          const box = (target ?? el).getBoundingClientRect()
          const maxWidth = target ? parseFloat(getComputedStyle(target).maxWidth) : Number.POSITIVE_INFINITY
          return {
            id,
            missing: false,
            bounded: target != null,
            offCenter: (box.left + box.right) / 2 - vw / 2,
            width: box.width,
            maxWidth,
          }
        })
      }, CENTERED_SECTION_IDS)

      for (const r of results) {
        expect(r.missing, `#${r.id} should exist on the page`).toBe(false)
        expect(r.bounded, `#${r.id} should have a max-width bounded container`).toBe(true)
        expect(Math.abs(r.offCenter), `#${r.id} should be horizontally centered (off by ${r.offCenter}px)`).toBeLessThanOrEqual(4)
        expect(r.width, `#${r.id} content should respect its max-width`).toBeLessThanOrEqual(r.maxWidth + 1)
      }
    })

    test("hero content is centered", async ({ page }) => {
      const off = await page.evaluate(() => {
        const h1 = document.querySelector("h1")
        if (!h1) return Number.POSITIVE_INFINITY
        const box = h1.getBoundingClientRect()
        return (box.left + box.right) / 2 - document.documentElement.clientWidth / 2
      })
      expect(Math.abs(off), "hero <h1> should be centered").toBeLessThanOrEqual(8)
    })

    test("project marquee rows loop without blank gaps", async ({ page }) => {
      await page.evaluate(() => document.getElementById("projects")?.scrollIntoView({ block: "center" }))
      await page.waitForTimeout(600)
      const tracks = await page.$$eval(".marquee-track", (els) =>
        els.map((el, i) => ({
          index: i,
          half: el.scrollWidth / 2,
          box: el.parentElement?.clientWidth ?? 0,
        })),
      )
      expect(tracks.length, "marquee rows should exist").toBeGreaterThan(0)
      for (const t of tracks) {
        expect(
          t.half,
          `marquee row ${t.index}: half the track (${Math.round(t.half)}px) must cover its visible box (${Math.round(t.box)}px) or a blank gap sweeps through`,
        ).toBeGreaterThanOrEqual(t.box)
      }
    })

    test("consulting client carousel loops without blank gaps", async ({ page }) => {
      await page.evaluate(() => document.getElementById("consulting")?.scrollIntoView({ block: "center" }))
      await page.waitForTimeout(600)
      const carousel = await page.evaluate(() => {
        const track = document.querySelector<HTMLElement>(".client-carousel-track")
        if (!track) return null
        const set = track.children[0] as HTMLElement | undefined
        return {
          // The rail wraps by one set width, so the run of track AFTER the
          // first set is what has to cover the visible box. Requiring a single
          // set to cover it is stricter than the loop actually needs.
          spare: track.scrollWidth - (set?.scrollWidth ?? 0),
          box: track.parentElement?.clientWidth ?? 0,
        }
      })
      expect(carousel, "client carousel should exist").not.toBeNull()
      expect(
        carousel!.spare,
        "track beyond the first card set must cover the carousel box or the slide-by-one-set loop sweeps a blank through it",
      ).toBeGreaterThanOrEqual(carousel!.box)
    })

    test("logo marquee covers the full strip width", async ({ page }) => {
      const logo = await page.evaluate(() => {
        const section = document.getElementById("partners")
        const track = section?.querySelector<HTMLElement>(".flex.will-change-transform")
        if (!section || !track) return null
        // LogoScroll wraps its offset within one set width (total / copies),
        // so the visible strip is covered only while total - set >= viewport.
        const total = track.scrollWidth
        return { total, box: section.clientWidth }
      })
      expect(logo, "logo marquee should exist").not.toBeNull()
      expect(
        logo!.total - logo!.total / 6,
        "logo track (minus one wrap set) must cover the strip",
      ).toBeGreaterThanOrEqual(logo!.box)
    })
  })
}
