import { test, expect } from "@playwright/test"

/**
 * The runtime-error gate — the reason this file exists.
 *
 * A page can pass every unit test and still throw in the browser (a bad
 * three.js frame loop, a null ref, a hook ordering bug) — those only show up
 * once real DOM + real animation frames run. This spec loads every real
 * route and fails the build if the browser itself complains:
 *
 *  - an uncaught page error (`pageerror`)
 *  - a `console.error` that isn't explicitly allow-listed below
 *  - the Next.js dev error overlay rendering
 *
 * Keep the allow-list short and justified — it exists for genuinely benign
 * noise (third-party libs logging through console.error), never to silence
 * a real bug.
 */

const ROUTES = ["/", "/blog", "/tools", "/llm-prices", "/games", "/demo", "/privacy", "/terms"]

/** Each entry needs a comment explaining why it's not a real bug. */
const ALLOWED_CONSOLE_ERRORS: RegExp[] = [
  // None yet — keep this empty until a genuinely benign case is found. An
  // empty allow-list is the correct default: it means every console.error
  // seen so far has been a real bug worth fixing, not noise worth hiding.
]

function isAllowed(text: string): boolean {
  return ALLOWED_CONSOLE_ERRORS.some((re) => re.test(text))
}

for (const route of ROUTES) {
  test(`no runtime errors on ${route}`, async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on("pageerror", (err) => pageErrors.push(err.stack ?? err.message))
    page.on("console", (msg) => {
      if (msg.type() !== "error") return
      const text = msg.text()
      if (!isAllowed(text)) consoleErrors.push(text)
    })

    await page.goto(route, { waitUntil: "domcontentloaded" })
    // Let the page settle: hydration, mounted effects, and (on the homepage)
    // several animation frames of the three.js hero scene where the known
    // frame-loop TypeError actually fires.
    await page.waitForTimeout(3000)

    // Next.js dev error overlay renders inside a <nextjs-portal> custom
    // element with its own shadow root — check for its error dialog directly
    // rather than relying on pageerror alone (a caught-and-swallowed render
    // error can still surface the overlay without an uncaught exception).
    const overlayVisible = await page.evaluate(() => {
      const portal = document.querySelector("nextjs-portal")
      const root = portal?.shadowRoot
      if (!root) return false
      return root.querySelector('[data-nextjs-dialog], #nextjs__container_errors_label') !== null
    })

    expect(overlayVisible, `Next.js dev error overlay appeared on ${route}`).toBe(false)
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([])
    expect(consoleErrors, `console.error calls on ${route}`).toEqual([])
  })
}
