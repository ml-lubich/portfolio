/**
 * Data-integrity guard for the Open-Source Showcase demo data.
 * Every entry must map to a real, public `ml-lubich` project — no Polaris/
 * work/client/course content, no invented repos, no empty demo scripts.
 */

import { describe, it, expect } from "vitest"
import { ossDemos } from "@/data/oss-demos"
import { projects } from "@/data/projects"

// Mirrors the spec's "Public OSS set" — the only ids eligible for the showcase.
const ALLOWED_PUBLIC_IDS = new Set([
  "imsg-mcp",
  "imail-mcp",
  "inotes-mcp",
  "wa-mcp",
  "bitbucket-cli",
  "twig",
  "confluence-cli",
  "like-fable",
  "imessage-exporter",
  "synthdata-forge",
  "multimodal-captcha-solver",
])

const EXCLUDED_IDS = new Set([
  "equiverse",
  "flyoneo",
  "verizon",
  "encrypted-fs",
  "gitlet",
  "pintos",
  "enrichdata",
  "lupfr",
  "w3sourcing",
  "eria",
  "reviewly",
  "scrapechat",
  "leadpipe",
  "briopedia",
  "brio-bot",
  "ai-invoice-agent",
])

const VALID_LINE_TYPES = new Set(["cmd", "out", "code", "hdr", "gap"])
const STAT_VALUE_RE = /^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/

describe("oss-demos data integrity", () => {
  it("ships at least the 8-entry minimum public set", () => {
    expect(ossDemos.length).toBeGreaterThanOrEqual(8)
  })

  it("every entry's id exists in data/projects.ts", () => {
    for (const demo of ossDemos) {
      expect(
        projects.some((p) => p.id === demo.id),
        `oss-demos id '${demo.id}' has no matching entry in data/projects.ts`,
      ).toBe(true)
    }
  })

  it("every entry's id is in the allowed public set", () => {
    for (const demo of ossDemos) {
      expect(ALLOWED_PUBLIC_IDS.has(demo.id), `'${demo.id}' is not in the allowed public set`).toBe(true)
    }
  })

  it("no entry maps to an explicitly excluded (internal/client/course) id", () => {
    for (const demo of ossDemos) {
      expect(EXCLUDED_IDS.has(demo.id), `'${demo.id}' is excluded and must not appear in the showcase`).toBe(false)
    }
  })

  it("ids are unique", () => {
    const ids = ossDemos.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every repoUrl points at github.com/ml-lubich", () => {
    for (const demo of ossDemos) {
      expect(demo.repoUrl).toMatch(/^https:\/\/github\.com\/ml-lubich\//)
    }
  })

  it("no field anywhere contains internal/proprietary host strings", () => {
    const blob = JSON.stringify(ossDemos).toLowerCase()
    expect(blob).not.toContain("polariswireless")
    expect(blob).not.toContain(".int")
  })

  it("every demo is a non-empty array of valid Line entries", () => {
    for (const demo of ossDemos) {
      expect(Array.isArray(demo.demo)).toBe(true)
      expect(demo.demo.length).toBeGreaterThan(0)
      for (const line of demo.demo) {
        expect(VALID_LINE_TYPES.has(line.t), `invalid Line.t '${line.t}' in '${demo.id}'`).toBe(true)
        expect(typeof line.s).toBe("string")
        if (line.t !== "gap") {
          expect(line.s.trim().length, `empty Line.s in '${demo.id}'`).toBeGreaterThan(0)
        }
      }
    }
  })

  it("every stats array is non-empty with AnimatedCounter-usable values", () => {
    for (const demo of ossDemos) {
      expect(Array.isArray(demo.stats)).toBe(true)
      expect(demo.stats.length).toBeGreaterThan(0)
      for (const stat of demo.stats) {
        expect(stat.label.trim().length).toBeGreaterThan(0)
        expect(stat.value.trim().length).toBeGreaterThan(0)
        // Either count-up-able (has a digit AnimatedCounter's parser can grab)
        // or intentionally static text — both are valid, but it must be one or the other.
        const isParseable = STAT_VALUE_RE.test(stat.value)
        const isStatic = !/[0-9]/.test(stat.value)
        expect(isParseable || isStatic, `stat value '${stat.value}' in '${demo.id}' is neither parseable nor static`).toBe(true)
      }
    }
  })

  it("every entry has a non-empty tagline", () => {
    for (const demo of ossDemos) {
      expect(demo.tagline.trim().length).toBeGreaterThan(0)
    }
  })

  it("does not duplicate gradient/accent/diagramType fields (single source of truth in data/projects.ts)", () => {
    for (const demo of ossDemos) {
      expect(demo).not.toHaveProperty("gradient")
      expect(demo).not.toHaveProperty("accent")
      expect(demo).not.toHaveProperty("diagramType")
    }
  })
})
