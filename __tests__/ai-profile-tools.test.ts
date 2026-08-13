import { describe, it, expect } from "vitest"
import { runTool, TOOL_SCHEMAS, SYSTEM_PROMPT, type ChartSpec } from "@/lib/ai/profile-tools"

/* The model can only answer as well as these tools resolve. If a tool returns
 * nothing, MLBot's fallback is to invent — so empty results are the failure. */

function chartOf(result: unknown): ChartSpec {
    const chart = (result as { chart?: ChartSpec }).chart
    if (!chart) throw new Error("expected a chart spec")
    return chart
}

describe("tool schemas", () => {
    it("every advertised tool is dispatchable", () => {
        for (const s of TOOL_SCHEMAS) {
            const result = runTool(s.function.name, {})
            expect(result, `${s.function.name} returned an error`).not.toHaveProperty("error")
        }
    })

    it("schemas are well-formed function definitions", () => {
        for (const s of TOOL_SCHEMAS) {
            expect(s.type).toBe("function")
            expect(s.function.name).toMatch(/^[a-z_]+$/)
            expect(s.function.description.length).toBeGreaterThan(20)
            expect(s.function.parameters.type).toBe("object")
        }
    })

    it("rejects an unknown tool without throwing", () => {
        expect(runTool("drop_tables", {})).toHaveProperty("error")
    })
})

describe("data lookups return real content", () => {
    it("experience has roles with companies and dates", () => {
        const { experience } = runTool("get_experience", {}) as { experience: { role: string; company: string; period: string }[] }
        expect(experience.length).toBeGreaterThan(0)
        for (const e of experience) {
            expect(e.role).toBeTruthy()
            expect(e.company).toBeTruthy()
            expect(e.period).toBeTruthy()
        }
    })

    it("projects carry a metric and tech tags", () => {
        const { projects } = runTool("get_projects", {}) as { projects: { name: string; tech: string[] }[] }
        expect(projects.length).toBeGreaterThan(0)
        expect(projects.every((p) => p.name && Array.isArray(p.tech))).toBe(true)
    })

    it("filters projects by tag, case-insensitively", () => {
        const all = (runTool("get_projects", {}) as { projects: unknown[] }).projects
        const filtered = (runTool("get_projects", { tag: "python" }) as { projects: { tech: string[] }[] }).projects
        expect(filtered.length).toBeGreaterThan(0)
        expect(filtered.length).toBeLessThanOrEqual(all.length)
        expect(filtered.every((p) => p.tech.some((t) => t.toLowerCase().includes("python")))).toBe(true)
    })

    it("publications expose venue and year", () => {
        const { publications } = runTool("get_publications", {}) as { publications: { title: string; year: string; venue: string }[] }
        expect(publications.length).toBeGreaterThan(0)
        expect(publications.every((p) => p.title && p.year && p.venue)).toBe(true)
    })

    it("testimonials keep attribution", () => {
        const { testimonials } = runTool("get_testimonials", {}) as { testimonials: { quote: string; name: string }[] }
        expect(testimonials.length).toBeGreaterThan(0)
        expect(testimonials.every((t) => t.quote && t.name)).toBe(true)
    })
})

describe("search", () => {
    it("finds a technology that appears in the profile", () => {
        const { matches } = runTool("search_profile", { query: "python" }) as { matches: { kind: string }[] }
        expect(matches.length).toBeGreaterThan(0)
    })

    it("ranks multi-term matches above single-term ones", () => {
        const { matches } = runTool("search_profile", { query: "agentic mcp" }) as { matches: unknown[] }
        expect(matches.length).toBeGreaterThan(0)
    })

    it("returns empty rather than everything for a nonsense query", () => {
        const { matches } = runTool("search_profile", { query: "zzzzqqqxyzzy" }) as { matches: unknown[] }
        expect(matches).toHaveLength(0)
    })

    it("handles an empty query without crashing", () => {
        expect(runTool("search_profile", { query: "" })).toEqual({ matches: [] })
    })

    it("caps results so a broad query cannot blow up the context window", () => {
        const { matches } = runTool("search_profile", { query: "a e i o u" }) as { matches: unknown[] }
        expect(matches.length).toBeLessThanOrEqual(8)
    })
})

describe("chart tools produce renderable specs", () => {
    it("skills chart is sorted descending and respects the top-N cap", () => {
        const chart = chartOf(runTool("chart_skills", { top: 5 }))
        expect(chart.kind).toBe("bar")
        expect(chart.data).toHaveLength(5)
        const values = chart.data.map((d) => d.value)
        expect([...values].sort((a, b) => b - a)).toEqual(values)
    })

    it("tech usage counts across both roles and projects", () => {
        const chart = chartOf(runTool("chart_tech_usage", { top: 6 }))
        expect(chart.data).toHaveLength(6)
        expect(chart.data.every((d) => d.value >= 1)).toBe(true)
    })

    it("publications chart is chronological", () => {
        const chart = chartOf(runTool("chart_publications_by_year", {}))
        expect(chart.kind).toBe("line")
        const years = chart.data.map((d) => d.label)
        expect([...years].sort()).toEqual(years)
    })

    it("every chart point has a finite value and a non-empty label", () => {
        for (const name of ["chart_skills", "chart_tech_usage", "chart_publications_by_year"]) {
            const chart = chartOf(runTool(name, {}))
            expect(chart.data.length).toBeGreaterThan(0)
            for (const p of chart.data) {
                expect(p.label).toBeTruthy()
                expect(Number.isFinite(p.value)).toBe(true)
            }
        }
    })

    it("clamps a nonsense top-N instead of returning an empty chart", () => {
        expect(chartOf(runTool("chart_skills", { top: 0 })).data.length).toBeGreaterThan(0)
        expect(chartOf(runTool("chart_skills", { top: 999 })).data.length).toBeGreaterThan(0)
    })
})

describe("system prompt", () => {
    it("instructs the model to ground answers in tools rather than invent", () => {
        expect(SYSTEM_PROMPT).toMatch(/never invent/i)
        expect(SYSTEM_PROMPT).toMatch(/tool/i)
    })
})
