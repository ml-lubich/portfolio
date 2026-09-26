import { test, expect, type Page } from "@playwright/test"
import { BIO_SCRIPTS } from "../data/about-bio"

/**
 * The About terminal beside the portrait rewrites itself from the bio bank
 * (data/about-bio.ts): type → hold → erase → next. Unit tests cover the
 * schedule; this covers what only a real browser can — that it actually
 * moves, that the card never changes height while it does, and that the
 * window chrome is painted.
 */

async function openAbout(page: Page) {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await page.waitForFunction(
        () => {
            window.dispatchEvent(new Event("portfolio:mount-all"))
            return document.getElementById("about") !== null
        },
        undefined,
        { timeout: 30_000, polling: 100 },
    )
    const card = page.locator("#about div.rounded-xl", { hasText: "~/about — misha.bio" }).first()
    await card.scrollIntoViewIfNeeded()
    await expect(card).toBeVisible()
    // The live layer — the stacked sizer copies underneath are `invisible`.
    const live = card.locator(".col-start-1.row-start-1:not(.invisible)")
    return { card, live }
}

test.describe("About terminal", () => {
    test("rewrites itself: moves on from the first bio to a different one", async ({ page }) => {
        test.setTimeout(60_000)
        const { live } = await openAbout(page)
        await expect(live).toContainText(BIO_SCRIPTS[0][0].slice(0, 12), { timeout: 15_000 })
        await expect(live).toContainText(BIO_SCRIPTS[1][0].slice(0, 12), { timeout: 30_000 })
        await expect(live).not.toContainText(BIO_SCRIPTS[0][0])
    })

    test("the card keeps one height while bios type and erase", async ({ page }) => {
        test.setTimeout(90_000)
        const { card, live } = await openAbout(page)
        await expect(live).toContainText(BIO_SCRIPTS[0][0].slice(0, 6), { timeout: 15_000 })
        // Let the 1s fade-up/tilt entrance finish — it changes the box on purpose.
        await expect
            .poll(async () => {
                const a = (await card.boundingBox())?.height
                await page.waitForTimeout(200)
                return a === (await card.boundingBox())?.height
            }, { timeout: 10_000 })
            .toBe(true)
        // 14s of wall time covers a whole bio: type, hold, erase, next.
        const heights: number[] = []
        const texts = new Set<string>()
        const until = Date.now() + 14_000
        while (Date.now() < until) {
            const box = await card.boundingBox()
            if (box) heights.push(Math.round(box.height))
            texts.add(await live.innerText())
            await page.waitForTimeout(500)
        }
        expect(heights.length).toBeGreaterThan(5)
        // The window really spanned a rewrite — without assuming which bio is up
        // (on a loaded machine the settle wait shifts where in the cycle we are).
        expect(texts.size).toBeGreaterThan(1)
        expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1)
    })

    test("the traffic lights are painted, not transparent", async ({ page }) => {
        const { card } = await openAbout(page)
        const colours = await card.locator("span.rounded-full").evaluateAll((els) =>
            els.slice(0, 3).map((e) => getComputedStyle(e).backgroundColor),
        )
        expect(colours).toHaveLength(3)
        for (const c of colours) expect(c).not.toBe("rgba(0, 0, 0, 0)")
    })
})

test.describe("About terminal — reduced motion", () => {
    test.use({ reducedMotion: "reduce" })

    test("shows the whole first bio at once and holds it still", async ({ page }) => {
        const { live } = await openAbout(page)
        for (const line of BIO_SCRIPTS[0]) await expect(live).toContainText(line)
        const before = await live.innerText()
        await page.waitForTimeout(2500)
        expect(await live.innerText()).toBe(before)
    })
})
