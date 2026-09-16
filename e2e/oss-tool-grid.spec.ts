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

  test("/fork page exposes tap-first install block", async ({ page }) => {
    await page.goto("/fork")
    await expect(page.getByRole("heading", { name: /copy-paste agent tool installs/i })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Copy install command: brew tap ml-lubich/tap" }),
    ).toBeVisible()
  })
})
