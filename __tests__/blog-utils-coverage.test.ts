/**
 * Tests for client-safe blog utilities + format helpers + chart schema.
 * Cover error paths so coverage thresholds stay above 80%.
 */

import { describe, it, expect } from "vitest"
import {
    BLOG_CATEGORIES,
    normalizeBlogCategoryFromParam,
    getReadingTime,
    getTagsFromPosts,
    AUTHOR,
} from "@/lib/blog-shared"
import {
    formatBlogDate,
    formatBlogDateUtc,
    getBlogDateEpochMs,
    getBlogDateYear,
} from "@/lib/blog-format"
import { validateBlogChartJsonString } from "@/lib/blog-chart-schema"

describe("blog-shared / normalizeBlogCategoryFromParam", () => {
    it("returns 'All' when raw is undefined / null / empty", () => {
        expect(normalizeBlogCategoryFromParam(undefined)).toBe("All")
        expect(normalizeBlogCategoryFromParam(null)).toBe("All")
        expect(normalizeBlogCategoryFromParam("")).toBe("All")
    })

    it("returns first array entry when given string[]", () => {
        expect(normalizeBlogCategoryFromParam(["MLOps"])).toBe("MLOps")
    })

    it("returns 'All' when value is not a known category", () => {
        expect(normalizeBlogCategoryFromParam("garbage")).toBe("All")
    })

    it("preserves valid known category", () => {
        for (const cat of BLOG_CATEGORIES) {
            expect(normalizeBlogCategoryFromParam(cat)).toBe(cat)
        }
    })
})

describe("blog-shared / getReadingTime", () => {
    it("returns at least 1 minute for any non-empty content", () => {
        expect(getReadingTime("hi there")).toBeGreaterThanOrEqual(1)
    })

    it("strips fenced code blocks (mermaid + generic) before counting", () => {
        const withCode =
            "intro words here\n```mermaid\nflowchart LR\n  A --> B\n```\nmore words"
        expect(getReadingTime(withCode)).toBe(1)
    })

    it("scales with word count (~238 wpm)", () => {
        const longText = "word ".repeat(500)
        expect(getReadingTime(longText)).toBe(Math.ceil(500 / 238))
    })
})

describe("blog-shared / getTagsFromPosts", () => {
    it("returns sorted unique tags across posts", () => {
        const tags = getTagsFromPosts([
            { tags: ["b", "a"] },
            { tags: ["a", "c"] },
        ])
        expect(tags).toEqual(["a", "b", "c"])
    })

    it("returns empty array for empty input", () => {
        expect(getTagsFromPosts([])).toEqual([])
    })
})

describe("blog-shared / AUTHOR + BLOG_CATEGORIES", () => {
    it("AUTHOR has required fields", () => {
        expect(AUTHOR.name).toBeTruthy()
        expect(AUTHOR.role).toBeTruthy()
        expect(AUTHOR.avatar).toMatch(/\.(png|jpe?g|webp|svg)$/i)
    })

    it("BLOG_CATEGORIES starts with 'All'", () => {
        expect(BLOG_CATEGORIES[0]).toBe("All")
    })
})

describe("blog-format", () => {
    it("getBlogDateEpochMs returns UTC midnight epoch", () => {
        expect(getBlogDateEpochMs("2025-01-15")).toBe(Date.UTC(2025, 0, 15))
    })

    it("getBlogDateYear returns the year", () => {
        expect(getBlogDateYear("2024-06-30")).toBe(2024)
    })

    it("formatBlogDate accepts YYYY-MM-DD", () => {
        expect(formatBlogDate("2025-01-15")).toMatch(/January 15, 2025/u)
    })

    it("formatBlogDate accepts ISO strings via Date.parse fallback", () => {
        expect(formatBlogDate("2025-01-15T00:00:00Z")).toMatch(/January 15, 2025/u)
    })

    it("formatBlogDateUtc returns a UTC string", () => {
        expect(formatBlogDateUtc("2025-01-15")).toMatch(/GMT$/u)
    })

    it("rejects malformed date strings", () => {
        expect(() => formatBlogDate("not-a-date")).toThrow()
        expect(() => getBlogDateEpochMs("2025-13-99")).toThrow()
        expect(() => getBlogDateEpochMs("2025/01/15")).toThrow()
    })
})

describe("blog-chart-schema / validateBlogChartJsonString", () => {
    it("rejects non-JSON input", () => {
        const r = validateBlogChartJsonString("{not json")
        expect(r.ok).toBe(false)
        if (!r.ok) expect(r.error).toMatch(/Invalid JSON/u)
    })

    it("rejects unknown chart type", () => {
        const r = validateBlogChartJsonString(JSON.stringify({ type: "bogus" }))
        expect(r.ok).toBe(false)
    })

    it("accepts a valid pipeline chart", () => {
        const json = JSON.stringify({
            type: "pipeline",
            steps: [{ label: "Ingest" }, { label: "Embed", color: "blue" }],
        })
        const r = validateBlogChartJsonString(json)
        expect(r.ok).toBe(true)
        if (r.ok) expect(r.chart.type).toBe("pipeline")
    })

    it("accepts a valid comparison chart", () => {
        const json = JSON.stringify({
            type: "comparison",
            left: { title: "Before", steps: ["a", "b"] },
            right: { title: "After", color: "green", steps: ["x", "y"] },
        })
        expect(validateBlogChartJsonString(json).ok).toBe(true)
    })

    it("accepts a valid pie chart", () => {
        const json = JSON.stringify({
            type: "pie",
            data: [
                { label: "TS", value: 60 },
                { label: "Py", value: 40 },
            ],
        })
        expect(validateBlogChartJsonString(json).ok).toBe(true)
    })

    it("accepts a valid tree chart with branches", () => {
        const json = JSON.stringify({
            type: "tree",
            steps: [
                "init",
                {
                    label: "decide",
                    branches: [
                        { condition: "yes", steps: ["go"] },
                        { condition: "no", steps: ["stop"], loop: "retry" },
                    ],
                },
            ],
        })
        expect(validateBlogChartJsonString(json).ok).toBe(true)
    })

    it("rejects pipeline with missing steps", () => {
        const r = validateBlogChartJsonString(JSON.stringify({ type: "pipeline" }))
        expect(r.ok).toBe(false)
        if (!r.ok) expect(r.error.length).toBeGreaterThan(0)
    })
})
