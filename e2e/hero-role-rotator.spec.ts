import { test, expect, type Page } from "@playwright/test"

/**
 * Hero role rotator — single slot.
 *
 * The rotator shipped rendering every role at once as stacked absolutely-
 * positioned spans cross-fading by opacity, plus an sr-only twin: 10 elements
 * in the slot, and mid-swap up to three legible on top of each other (one of
 * them twice). It read as a broken hero, not an animation, and the hero copy's
 * ink halo was applied to each of them, which made the pile-up worse.
 *
 * josephheupler.com's rotator mounts one line at a time and sequences out-then-
 * in, so overlap is not possible by construction. These assert that property
 * rather than the animation: at rest the bug was invisible, which is how it
 * shipped — so the count is sampled continuously, across several swaps.
 */

const SLOT = "[data-testid=\"role-rotator\"]"

async function lines(page: Page): Promise<string[]> {
  return page.$$eval(`${SLOT} > span`, (els) => els.map((e) => (e.textContent ?? "").trim()))
}

test("only ever one role line exists, through several swaps", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForSelector(SLOT, { timeout: 30_000 })

  const seen = new Set<string>()
  let worst = 0
  let worstAt: string[] = []

  // ~14s covers three holds and the swaps between them.
  for (let i = 0; i < 140; i++) {
    const now = await lines(page)
    if (now.length > worst) {
      worst = now.length
      worstAt = now
    }
    for (const t of now) if (t) seen.add(t)
    await page.waitForTimeout(100)
  }

  expect(worst, `role lines stacked: ${JSON.stringify(worstAt)}`).toBeLessThanOrEqual(1)
  // A rotator that never advances would also satisfy the count above.
  expect(seen.size, "the rotator should have advanced at least once").toBeGreaterThan(1)
})

test("the outgoing role is gone before the next one is readable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForSelector(SLOT, { timeout: 30_000 })

  const first = (await lines(page))[0]
  expect(first, "a role line should be mounted").toBeTruthy()

  await expect
    .poll(async () => (await lines(page))[0] ?? "", { message: "role advances", timeout: 12_000 })
    .not.toBe(first)

  // Not merely "the new one exists" — the old one must be absent.
  expect(await lines(page)).not.toContain(first)
})

test("reduced motion still swaps the role, and never leaves the slot blank", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForSelector(SLOT, { timeout: 30_000 })

  // `animation-fill-mode: both` on the out phase would otherwise hold
  // opacity: 0 once the animation is suppressed, blanking the line for good.
  let blank = 0
  for (let i = 0; i < 60; i++) {
    // `isConnected` filter: the slot remounts its line on every swap, and a
    // node React has just detached still answers className/textContent while
    // getComputedStyle returns an empty declaration — every property reads ""
    // and Number("") is 0, which looks exactly like a faded-out line. Only what
    // is actually in the document counts.
    const seen = await page.$$eval(`${SLOT} > span`, (els) =>
      els.filter((el) => el.isConnected).map((el) => {
        const cs = getComputedStyle(el)
        return {
          text: (el.textContent ?? "").trim(),
          opacity: Number(cs.opacity),
          cls: el.className,
          anim: `${cs.animationName} ${cs.animationDuration} ${cs.animationFillMode}`,
        }
      }),
    )
    // A keyed remount has a sub-frame gap where the old line is detached and
    // the new one is not yet in — a sample can legitimately land in it. What
    // must never happen is the slot staying blank, or two lines coexisting.
    expect(seen.length, `sample ${i}: role lines stacked — ${JSON.stringify(seen)}`).toBeLessThanOrEqual(1)
    if (seen.length === 0) {
      blank++
      expect(blank, `slot blank for ${blank * 100}ms around sample ${i}`).toBeLessThanOrEqual(2)
    } else {
      blank = 0
      expect(seen[0].text, `sample ${i}: role line must stay readable under reduce`).toBeTruthy()
      expect(
        seen[0].opacity,
        `sample ${i}: role line faded out under reduce — ${JSON.stringify(seen[0])}`,
      ).toBeGreaterThan(0.9)
    }
    await page.waitForTimeout(100)
  }
})
