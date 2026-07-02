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

/**
 * Wait for the programmatic scroll to actually START (scrollY > 100).
 * The current implementation waits for layout to stabilize BEFORE
 * scrolling (see woosh-scroll.ts), so polling for "settled" immediately
 * after a click can read a false-positive "settled at 0" before the
 * woosh has even begun. Wait for real movement first.
 */
async function waitForScrollStart(page: Page): Promise<void> {
  await page.waitForFunction(() => window.scrollY > 100, undefined, { timeout: 10_000 })
}

/** Resolve once window.scrollY has been stable for ~1s (woosh + lazy-mount churn done). */
async function settledScrollY(page: Page): Promise<number> {
  await waitForScrollStart(page)
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

/**
 * Sample window.scrollY every 50ms (browser-side, via page.evaluate) for up
 * to 20s, stopping early once scrollY has been stable for 1.5s AND total
 * movement has exceeded 500px. Runs entirely in-page so sampling isn't
 * skewed by IPC round-trip latency.
 */
async function traceScroll(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    return new Promise<number[]>((resolve) => {
      const samples: number[] = []
      const sampleIntervalMs = 50
      const maxDurationMs = 20_000
      const stableForMs = 1_500
      const minTotalMovementPx = 500
      const startTime = performance.now()
      let lastY = window.scrollY
      let lastMoveTime = startTime
      let totalMovement = 0

      const timer = setInterval(() => {
        const y = window.scrollY
        samples.push(y)
        const delta = Math.abs(y - lastY)
        totalMovement += delta
        if (delta >= 2) lastMoveTime = performance.now()
        lastY = y

        const now = performance.now()
        const stableLongEnough = now - lastMoveTime >= stableForMs
        const movedEnough = totalMovement >= minTotalMovementPx
        const timedOut = now - startTime >= maxDurationMs
        if ((stableLongEnough && movedEnough) || timedOut) {
          clearInterval(timer)
          resolve(samples)
        }
      }, sampleIntervalMs)
    })
  })
}

interface ScrollStall {
  /** Index into the samples array where the flat run starts. */
  startIndex: number
  /** Number of consecutive small (<2px) sample-to-sample deltas in the run. */
  length: number
  /** Total |delta| movement observed after the run ends. */
  movementAfterPx: number
}

/**
 * Find "stop-and-go" stalls in a scrollY trace: runs of >=10 consecutive
 * sample-to-sample deltas under 2px (>=500ms visually stopped) that occur
 * AFTER motion has begun, where the scroll subsequently moves at least 500px
 * further — the old chase behavior (decelerate to a stop at a section, pause,
 * scroll again). Deliberately tolerant of sub-500ms compositor hiccups inside
 * a single native smooth scroll on a loaded machine; the one-scroll-command
 * assertion below is what pins the architecture. A flat run at the very tail
 * of the trace (easing out to rest, nothing after) is a normal finish.
 */
function findStopAndGoStalls(samples: number[]): ScrollStall[] {
  const deltas: number[] = []
  for (let i = 0; i < samples.length - 1; i++) {
    deltas.push(Math.abs(samples[i + 1] - samples[i]))
  }

  const motionStart = deltas.findIndex((d) => d >= 2)
  if (motionStart === -1) return []

  const stalls: ScrollStall[] = []
  let i = motionStart
  while (i < deltas.length) {
    if (deltas[i] >= 2) {
      i++
      continue
    }
    const runStart = i
    let runLength = 0
    while (i < deltas.length && deltas[i] < 2) {
      runLength++
      i++
    }
    if (runLength >= 10) {
      let movementAfterPx = 0
      for (let j = i; j < deltas.length; j++) movementAfterPx += deltas[j]
      if (movementAfterPx >= 500) {
        stalls.push({ startIndex: runStart, length: runLength, movementAfterPx })
      }
    }
  }
  return stalls
}

test("anchor scroll is one continuous motion (no stop-and-go)", async ({ page }) => {
  // Count programmatic scroll commands: the stop-and-go bug WAS multiple
  // scroll episodes per navigation (chase re-scrolls / rAF spring steps).
  // One anchor click must issue exactly one scroll command.
  await page.addInitScript(() => {
    const w = window as unknown as { __scrollCalls: number }
    w.__scrollCalls = 0
    const orig = window.scrollTo.bind(window)
     
    ;(window as any).scrollTo = (...args: unknown[]) => {
      const w2 = window as unknown as { __scrollCalls: number }
      w2.__scrollCalls++
       
      return orig(...(args as any))
    }
  })
  await page.goto("/")
  await expect(page.getByRole("button", { name: /get in touch/i })).toBeVisible()
  await page.getByRole("button", { name: /get in touch/i }).click()
  const samples = await traceScroll(page)
  const stalls = findStopAndGoStalls(samples)
  expect(stalls, `stop-and-go stalls found in trace: ${JSON.stringify(stalls)}`).toHaveLength(0)
  const scrollCalls = await page.evaluate(() => (window as unknown as { __scrollCalls: number }).__scrollCalls)
  expect(scrollCalls, "programmatic scroll commands per navigation").toBe(1)
})

// NAV_OFFSET documented for future tightening; the band above is deliberately loose
// so the test is timing-robust while still catching multi-thousand-px misses.
void NAV_OFFSET
