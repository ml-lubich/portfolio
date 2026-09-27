import { test, expect } from "@playwright/test"

test.describe("OSS agent tool grid", () => {
  test("open-source section shows the tool grid with copy commands", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await page.waitForFunction(
      () => {
        window.dispatchEvent(new Event("portfolio:mount-all"))
        return document.getElementById("open-source") !== null
      },
      undefined,
      { timeout: 30_000, polling: 100 },
    )
    await page.locator("#open-source").scrollIntoViewIfNeeded()
    await expect(page.getByText("Open-Source Agent Tools")).toBeVisible()
    await expect(page.getByText("every tool = human CLI")).toBeVisible()
    const grid = page.locator("#open-source .oss-tool-grid")
    await expect(grid.getByRole("link", { name: "imsg", exact: true })).toBeVisible()
    await expect(grid.getByRole("link", { name: "bb", exact: true })).toBeVisible()

    const imsgCopy = grid.getByRole("button", {
      name: /Copy install command: brew install ml-lubich\/tap\/imsg/,
    })
    await imsgCopy.click()
    await expect(imsgCopy).toContainText("Copied")

    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toBe("brew install ml-lubich/tap/imsg")
  })

  test("odd last card is centered, not stranded left beside empty space", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await page.waitForFunction(
      () => {
        window.dispatchEvent(new Event("portfolio:mount-all"))
        return document.querySelector("#open-source .oss-tool-grid > ul") !== null
      },
      undefined,
      { timeout: 30_000, polling: 100 },
    )
    const list = page.locator("#open-source .oss-tool-grid > ul")
    await list.scrollIntoViewIfNeeded()
    const items = list.locator(":scope > li")
    const count = await items.count()
    const ul = (await list.boundingBox())!
    const last = (await items.nth(count - 1).boundingBox())!
    const prev = (await items.nth(count - 2).boundingBox())!
    const isMobile = await page.evaluate(() => window.innerWidth < 768)
    if (isMobile || count % 2 === 0) {
      // Full last row (single column, or an even count): nothing is stranded.
      if (!isMobile) expect(Math.abs(last.y - prev.y)).toBeLessThanOrEqual(1)
      expect(last.width).toBeGreaterThan(0)
      return
    }
    const lastCenter = last.x + last.width / 2
    expect(Math.abs(lastCenter - (ul.x + ul.width / 2))).toBeLessThanOrEqual(2)
    // Still half-width like its siblings, not stretched full-row.
    const first = (await items.first().boundingBox())!
    expect(Math.abs(last.width - first.width)).toBeLessThanOrEqual(1)
  })

  test("/fork page exposes tap-first install block", async ({ page }) => {
    await page.goto("/fork")
    await expect(page.getByRole("heading", { name: /copy-paste agent tool installs/i })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Copy install command: brew tap ml-lubich/tap" }),
    ).toBeVisible()
  })
})
