import { test, expect, type Page } from "@playwright/test"

/**
 * ─── MLBot: one question at a time ────────────────────────────────────
 *
 * Two follow-up pills tapped in the same tick used to fire two requests:
 * both handlers read the same pre-render `busy`, so two answers streamed
 * into the transcript at once, tool lines interleaved. These are behaviour
 * assertions against the real widget in a real browser — request COUNT and
 * transcript CONTENT, not the presence of a guard.
 *
 * `/api/chat` is stubbed in the page before the app boots, so the run needs
 * no API key and the stream's timing is scripted rather than hoped for.
 */

/** Frames the stub streams, as [delay from request start (ms), event, data]. */
type Frame = [number, string, unknown]

const FOLLOWUPS = [
    "MCP architecture :: How is AigisQuery's MCP server laid out?",
    "Eval gates :: What evidence gates does he put in front of a release?",
]

/** Long enough for a mid-stream tap to land, short enough to keep the suite quick. */
const SCRIPT: Frame[] = [
    [120, "tool", { name: "search_profile" }],
    // A wide gap: the first step stays visibly running long enough to be
    // sampled twice without the sampling racing the second step's mount.
    [1500, "tool", { name: "get_projects" }],
    [1900, "text", "He has shipped several agent systems. "],
    [2100, "text", "AigisQuery is the one with an MCP server."],
    [2200, "followups", FOLLOWUPS],
]
const SCRIPT_END = 2400

async function stubChat(page: Page): Promise<void> {
    await page.addInitScript(
        ([script, end]: [Frame[], number]) => {
            const w = window as unknown as { __chatCalls: string[][] }
            w.__chatCalls = []
            const realFetch = window.fetch.bind(window)

            window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
                const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
                if (!url.includes("/api/chat")) return realFetch(input as RequestInfo, init)

                const body = JSON.parse(String(init?.body ?? "{}")) as { messages: { content: string }[] }
                w.__chatCalls.push(body.messages.map((m) => m.content))

                const timers: number[] = []
                const stream = new ReadableStream<Uint8Array>({
                    start(controller) {
                        const enc = new TextEncoder()
                        let closed = false
                        const stop = () => {
                            closed = true
                            timers.forEach(clearTimeout)
                        }
                        init?.signal?.addEventListener("abort", () => {
                            if (closed) return
                            stop()
                            controller.error(new DOMException("Aborted", "AbortError"))
                        })
                        for (const [at, event, data] of script) {
                            timers.push(
                                window.setTimeout(() => {
                                    if (closed) return
                                    controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
                                }, at),
                            )
                        }
                        timers.push(
                            window.setTimeout(() => {
                                if (closed) return
                                stop()
                                controller.close()
                            }, end),
                        )
                    },
                })

                return Promise.resolve(new Response(stream, { status: 200, headers: { "Content-Type": "text/event-stream" } }))
            }) as typeof window.fetch
        },
        [SCRIPT, SCRIPT_END] as [Frame[], number],
    )
}

const calls = (page: Page) => page.evaluate(() => (window as unknown as { __chatCalls: string[][] }).__chatCalls.length)

async function openPanel(page: Page): Promise<void> {
    await page.goto("/")
    await page.getByRole("button", { name: "Chat with MLBot" }).click()
    await expect(page.getByRole("dialog", { name: "Chat with MLBot" })).toBeVisible()
}

async function ask(page: Page, question: string): Promise<void> {
    await page.getByLabel("Message MLBot").fill(question)
    await page.getByLabel("Send").click()
}

const userBubbles = (page: Page) => page.locator('[data-mlbot-role="user"]')
const pills = (page: Page) => page.locator("[data-mlbot-followup]")
const steps = (page: Page) => page.locator("[data-mlbot-tool]")

test.describe("MLBot answers one question at a time", () => {
    test.beforeEach(async ({ page }) => {
        await stubChat(page)
        await openPanel(page)
    })

    test("two follow-up pills tapped in the same tick fire exactly one request", async ({ page }) => {
        await ask(page, "What has Misha built with agents?")
        await expect(pills(page)).toHaveCount(2)
        // The answer has landed: both pills are live, which is the state Misha
        // was in when he tapped two of them.
        await expect(page.getByLabel("Message MLBot")).toBeEnabled({ timeout: 10_000 })
        expect(await calls(page)).toBe(1)

        // Misha's report: two taps in quick succession, before any re-render.
        await page.evaluate(() => {
            const all = [...document.querySelectorAll<HTMLButtonElement>("[data-mlbot-followup]")]
            all[0].click()
            all[1].click()
        })

        // One new request, one new user message — the second tap is dropped,
        // never queued. Waits out the whole stream so a queued send would
        // have had every chance to fire.
        await expect(userBubbles(page)).toHaveCount(2)
        await page.waitForTimeout(SCRIPT_END + 400)
        expect(await calls(page)).toBe(2)
        await expect(userBubbles(page)).toHaveCount(2)
    })

    test("disables the composer and every pill while a reply is streaming", async ({ page }) => {
        await ask(page, "What has Misha built with agents?")
        await expect(pills(page)).toHaveCount(2)

        await pills(page).first().click()
        await expect(page.getByLabel("Message MLBot")).toBeDisabled()
        await expect(pills(page).first()).toBeDisabled()
        // Visibly so, not just semantically.
        expect(await pills(page).first().evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(1)

        await expect(page.getByLabel("Message MLBot")).toBeEnabled({ timeout: 10_000 })
    })

    test("a stream started before the panel closed never writes into the next chat", async ({ page }) => {
        await ask(page, "What has Misha built with agents?")
        await expect(steps(page).first()).toBeVisible()

        // The header control, not the launcher: on a phone the panel is
        // inset-0 and covers the launcher entirely.
        await page.getByRole("dialog", { name: "Chat with MLBot" }).getByLabel("Close MLBot").click()
        await page.waitForTimeout(SCRIPT_END + 400)
        await page.getByRole("button", { name: "Chat with MLBot" }).click()

        // Whatever the closed conversation was doing, it is not still typing here.
        await expect(page.getByText("Stopped.")).toHaveCount(0)
        await expect(page.getByText("AigisQuery is the one with an MCP server.")).toHaveCount(0)
    })
})

test.describe("MLBot tool calls animate", () => {
    test.beforeEach(async ({ page }) => {
        await stubChat(page)
        await openPanel(page)
    })

    test("the running step moves, and each call reads as its own step", async ({ page }) => {
        await ask(page, "What has Misha built with agents?")

        /* Record every state the rows pass through, from now on. The pair
           assertion below used to POLL for a snapshot, which only reads
           ["done","running"] inside the 400ms between the second tool frame
           (1500ms) and the first text frame (1900ms) that settles it. One
           poll landing inside a 400ms window is a coin flip under parallel
           load, and it came up tails. An observer cannot miss it. */
        await page.evaluate(() => {
            const w = window as unknown as { __toolStates: (string | undefined)[][] }
            w.__toolStates = []
            const snap = () => {
                const rows = [...document.querySelectorAll("[data-mlbot-tool]")]
                if (!rows.length) return
                w.__toolStates.push(
                    rows.map((r) => r.querySelector("[data-mlbot-tool-state]")?.getAttribute("data-mlbot-tool-state") ?? undefined),
                )
            }
            snap()
            new MutationObserver(snap).observe(document.body, { subtree: true, childList: true, attributes: true })
        })

        const running = steps(page).nth(0)
        const spinner = running.locator('[data-mlbot-tool-state="running"]')
        await expect(spinner).toBeVisible()

        // Animation, not just presence: ONE pinned element must render
        // differently at two moments inside its own running window.
        //
        // This POLLS rather than taking a single fixed-delay snapshot. The
        // original sampled transform once at +250ms, which passed alone and
        // failed inside the full 205-test parallel run — under load the step
        // can settle before the second sample lands, so the gate went red on a
        // spinner that was working perfectly. A flaky gate is worse than no
        // gate: it teaches everyone to re-run instead of read.
        const moved = await spinner.evaluate(
            (el) =>
                new Promise<{ first: string; ticked: boolean; changed: boolean }>((resolve) => {
                    const first = getComputedStyle(el).transform
                    const t0 = Number(el.getAnimations()[0]?.currentTime ?? 0)
                    const deadline = performance.now() + 4000
                    const poll = () => {
                        const changed = getComputedStyle(el).transform !== first
                        const ticked = Number(el.getAnimations()[0]?.currentTime ?? 0) > t0
                        // Either signal is sufficient proof it is running; we
                        // still require the element to have a transform at all.
                        if (changed || ticked || performance.now() > deadline) {
                            resolve({ first, ticked, changed })
                            return
                        }
                        requestAnimationFrame(poll)
                    }
                    requestAnimationFrame(poll)
                }),
        )
        expect(moved.first).not.toBe("none")
        expect(
            moved.changed || moved.ticked,
            `spinner neither transformed nor ticked — changed=${moved.changed} ticked=${moved.ticked}`,
        ).toBe(true)

        // Two sequential calls, each its own numbered step. Two spinners at
        // once is the "wall of identical lines" this replaces; one merged row
        // is the opposite failure — two real lookups collapsed into one.
        await expect(steps(page)).toHaveCount(2, { timeout: 10_000 })

        const seen = await page.evaluate(
            () => (window as unknown as { __toolStates: (string | undefined)[][] }).__toolStates,
        )
        const why = ` — transitions: ${JSON.stringify(seen)}`

        /* Asserted over EVERY rendered state, not one sampled instant.
           An earlier version demanded that the exact frame ["done","running"]
           be caught. That is a claim about React's commit granularity, not
           about the widget: when the box is loaded the tool frame (1500ms) and
           the text frame (1900ms) are read from the stream together and
           committed once, so the DOM steps straight from ["running"] to
           ["done","done"] having been correct throughout. It went red on a
           panel that was behaving perfectly, which is the flake this spec's
           own comment warns about. These three invariants hold at every commit
           and still fail on every way the steps could actually be wrong. */
        expect(seen.some((row) => row.length === 2), `the second call never got its own step${why}`).toBe(true)
        expect(
            seen.every((row) => row.filter((state) => state === "running").length <= 1),
            `two lookups span at once${why}`,
        ).toBe(true)
        expect(
            seen.every((row) => row.length < 2 || row[0] === "done"),
            `an earlier step was still spinning after the next one started${why}`,
        ).toBe(true)

        await expect(steps(page).nth(0)).toContainText("Searching the profile")
        await expect(steps(page).nth(1)).toContainText("Pulling up projects")

        // …and both settle when the answer lands.
        await expect(page.locator('[data-mlbot-tool-state="running"]')).toHaveCount(0, { timeout: 10_000 })
        await expect(page.locator('[data-mlbot-tool-state="done"]')).toHaveCount(2)
    })

    test("reduced motion keeps the step legible and explicitly running, never frozen", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" })
        await ask(page, "What has Misha built with agents?")

        const running = steps(page).filter({ has: page.locator('[data-mlbot-tool-state="running"]') }).first()
        await expect(running).toBeVisible()
        await expect(running).toContainText(/running/i)
        await expect(page.locator('[data-mlbot-tool-state="done"]').first()).toBeVisible({ timeout: 10_000 })
    })
})

test.describe("MLBot follow-up pills", () => {
    test.beforeEach(async ({ page }) => {
        await stubChat(page)
        await openPanel(page)
    })

    test("shows a short label but asks the full question", async ({ page }) => {
        await ask(page, "What has Misha built with agents?")
        await expect(pills(page)).toHaveCount(2)

        const label = (await pills(page).first().innerText()).trim()
        expect(label).toBe("MCP architecture")

        await pills(page).first().click()
        await expect(userBubbles(page).nth(1)).toHaveText("How is AigisQuery's MCP server laid out?")
    })
})
