import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { macDemos } from "@/data/mac-demos"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

/* These demos claim "this command produced this app state". The data has to
 * actually hold up that claim — a step whose rows never change, or whose
 * activeRow points nowhere, quietly turns the section into a lie. */

describe("mac demo data", () => {
    it("covers the three Mac apps the tools target", () => {
        expect(macDemos.map((d) => d.app)).toEqual(["Messages", "Mail", "Notes"])
        expect(macDemos.map((d) => d.tool)).toEqual(["imsg", "imail", "inotes"])
    })

    it("gives every demo steps and a repo link", () => {
        for (const d of macDemos) {
            expect(d.steps.length, `${d.app} has no steps`).toBeGreaterThan(1)
            expect(d.repoUrl).toMatch(/^https:\/\/github\.com\/ml-lubich\//)
            expect(d.tagline.length).toBeGreaterThan(20)
            expect(d.sidebarTitle).toBeTruthy()
        }
    })

    it("pairs every step with the command that caused it", () => {
        for (const d of macDemos) {
            for (const s of d.steps) {
                // The command must actually invoke that demo's tool.
                expect(s.command.startsWith(d.tool), `${s.command} is not an ${d.tool} command`).toBe(true)
                expect(s.caption.length).toBeGreaterThan(15)
            }
        }
    })

    it("keeps activeRow inside the row list for every step", () => {
        for (const d of macDemos) {
            for (const s of d.steps) {
                expect(s.rows.length).toBeGreaterThan(0)
                expect(s.activeRow).toBeGreaterThanOrEqual(0)
                expect(s.activeRow).toBeLessThan(s.rows.length)
            }
        }
    })

    it("gives every step a detail pane with content", () => {
        for (const d of macDemos) {
            for (const s of d.steps) {
                expect(s.detail.title).toBeTruthy()
                const hasContent = Boolean(s.detail.bubbles?.length) || Boolean(s.detail.body?.length)
                expect(hasContent, `${d.app} step "${s.command}" renders an empty detail pane`).toBe(true)
            }
        }
    })

    it("actually changes state between steps rather than replaying one screen", () => {
        for (const d of macDemos) {
            const shots = d.steps.map((s) => JSON.stringify({ rows: s.rows, detail: s.detail }))
            expect(new Set(shots).size, `${d.app} repeats an identical screen`).toBe(shots.length)
        }
    })

    it("only marks rows unread with a real preview to show", () => {
        for (const d of macDemos) {
            for (const s of d.steps) {
                for (const r of s.rows) {
                    expect(r.title).toBeTruthy()
                    expect(r.preview).toBeTruthy()
                }
            }
        }
    })
})

describe("mac demo section", () => {
    const section = read("components/sections/mac-app-demos.tsx")
    const window = read("components/demos/mac-window.tsx")

    it("does not run its timer while off screen", () => {
        // This section sits well below the fold; an unconditional interval
        // would re-render a window nobody is looking at.
        expect(section).toContain("IntersectionObserver")
        expect(section).toMatch(/if \(!inView\) return/)
    })

    it("respects reduced motion", () => {
        expect(section).toContain("prefers-reduced-motion")
    })

    it("clears the interval on unmount", () => {
        expect(section).toContain("clearInterval")
    })

    it("renders macOS traffic lights", () => {
        expect(window).toContain("#ff5f56")
        expect(window).toContain("#ffbd2e")
        expect(window).toContain("#27c93f")
    })

    it("themes from the shared surface stack rather than hardcoded darks", () => {
        const css = read("app/globals.css")
        const block = css.slice(css.indexOf(".mac-window {"))
        expect(block).toContain("var(--surface-1)")
        expect(block).toContain("var(--line-soft)")
        expect(css).toContain(".light .mac-window")
    })

    it("is reachable from the page", () => {
        expect(read("app/page.tsx")).toContain("MacAppDemos")
    })
})
