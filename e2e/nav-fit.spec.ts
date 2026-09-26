import { test, expect } from "@playwright/test"
import { navLinks } from "../components/nav/nav-links"

/**
 * Desktop nav must fit: every link, both dropdown triggers and the
 * "Get In Touch" CTA sit fully inside the link pill, and the pill sits
 * inside the viewport. Regression: 12 links + Tools + Games + CTA needed
 * ~1500px but the shell capped at 1280px, so the CTA was clipped mid-word.
 */

const WIDTHS = [1280, 1366, 1440, 1536, 1728, 1920, 2560]

for (const width of WIDTHS) {
  test(`desktop nav fits without clipping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")

    const pill = page.getByTestId("desktop-nav")
    await expect(pill).toBeVisible()
    // Measure the settled bar, not a frame of the centre-reveal animation.
    await page.locator(".nav-shell").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))

    const result = await pill.evaluate((el) => {
      // The shell (not the window) is what actually clipped the CTA.
      const shell = el.closest(".nav-shell")!.getBoundingClientRect()
      const own = el.getBoundingClientRect()
      const box = { left: Math.max(own.left, shell.left), right: Math.min(own.right, shell.right) }
      const clipped = [...el.querySelectorAll<HTMLElement>(":scope > a, :scope > div > button")]
        .map((child) => ({ label: child.textContent?.trim() ?? "", r: child.getBoundingClientRect() }))
        .filter(({ r }) => r.left < box.left - 0.5 || r.right > box.right + 0.5)
        .map(({ label }) => label)
      return {
        clipped,
        overflowing: el.scrollWidth > el.clientWidth + 1,
        offscreen: own.right > shell.right + 0.5 || own.left < shell.left - 0.5 || shell.right > window.innerWidth,
      }
    })

    // The shell hugs logo + pill; no wide empty gap between them.
    const slack = await pill.evaluate((el) => {
      const shell = el.closest(".nav-shell")!
      const used = [...shell.children].reduce((sum, c) => sum + c.getBoundingClientRect().width, 0)
      return shell.getBoundingClientRect().width - used
    })
    expect(slack, "empty space inside the nav shell (px)").toBeLessThanOrEqual(96)

    expect(result.clipped, "items clipped by the nav pill").toEqual([])
    expect(result.overflowing, "nav pill content overflows").toBe(false)
    expect(result.offscreen, "nav pill leaves the viewport").toBe(false)
    await expect(pill.getByRole("link", { name: "Get In Touch" })).toBeInViewport({ ratio: 1 })

    // Nothing dropped to make it fit: every section link is in the row or under "More".
    const rowLabels = await pill.locator(":scope > a").allTextContents()
    // Hover, like a mouse user: the trigger opens on mouseenter (click would toggle it
    // shut again). Generous timeout: under load the WebGL hero delays the state update.
    await pill.getByRole("button", { name: "More" }).hover()
    await expect(pill.getByTestId("nav-more-panel")).toBeVisible({ timeout: 15_000 })
    const moreLabels = await pill.getByTestId("nav-more-panel").getByRole("link").allTextContents()
    const reachable = new Set([...rowLabels, ...moreLabels].map((t) => t.trim()))
    for (const link of navLinks.filter((l) => l.href !== "#contact")) {
      expect(reachable, `"${link.label}" unreachable on desktop`).toContain(link.label)
    }
    await expect(pill.getByTestId("nav-more-panel")).toBeInViewport({ ratio: 1 })
  })
}
