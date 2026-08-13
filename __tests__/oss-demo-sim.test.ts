import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { ossDemos, SIM_KINDS } from "@/data/oss-demos"

const source = readFileSync(join(process.cwd(), "components/sections/oss-demo-sim.tsx"), "utf8")

const withSim = ossDemos.filter((d) => d.sim)

describe("OSS demo simulations — data", () => {
    it("simulates the tools whose value is visual, not textual", () => {
        const ids = withSim.map((d) => d.id)
        for (const id of ["imsg-mcp", "imail-mcp", "inotes-mcp", "wa-mcp"]) {
            expect(ids).toContain(id)
        }
    })

    it("uses only kinds the renderer knows how to draw", () => {
        for (const demo of withSim) {
            expect(SIM_KINDS).toContain(demo.sim!.kind)
        }
    })

    it("shows the MCP round-trip as a flow of at least three stages", () => {
        for (const demo of withSim) {
            expect(demo.sim!.flow.length).toBeGreaterThanOrEqual(3)
            // The agent is one end of every round-trip; the tool is the other.
            expect(demo.sim!.flow.join(" ").toLowerCase()).toContain("agent")
        }
    })

    it("keeps rows short enough to read in a phone-width panel", () => {
        for (const demo of withSim) {
            expect(demo.sim!.rows.length).toBeGreaterThanOrEqual(2)
            for (const row of demo.sim!.rows) {
                expect(row.text.length).toBeLessThanOrEqual(90)
            }
        }
    })

    it("gives every simulated window the app it is imitating", () => {
        for (const demo of withSim) {
            expect(demo.sim!.app.length).toBeGreaterThan(0)
        }
    })
})

describe("OSS demo simulations — renderer", () => {
    it("staggers each row instead of dropping them in at once", () => {
        expect(source).toMatch(/animationDelay/)
    })

    it("only animates the featured tool, matching the terminal's gate", () => {
        expect(source).toContain("active")
    })

    it("holds still for visitors who asked for reduced motion", () => {
        const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")
        const block = css.slice(css.indexOf(".oss-sim-row"))

        expect(block).toContain("prefers-reduced-motion")
    })

    it("renders every row and flow stage server-side", async () => {
        const { renderToString } = await import("react-dom/server")
        const { createElement } = await import("react")
        const { OssDemoSim } = await import("@/components/sections/oss-demo-sim")

        const demo = withSim.find((d) => d.id === "imsg-mcp")!
        const html = renderToString(createElement(OssDemoSim, { sim: demo.sim!, active: true }))

        for (const row of demo.sim!.rows) expect(html).toContain(row.text)
        for (const stage of demo.sim!.flow) expect(html).toContain(stage)
        expect(html).toContain(demo.sim!.app)
    })
})
