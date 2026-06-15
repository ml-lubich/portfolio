/**
 * LLM Prices — unit tests for pure utility functions and module structure.
 *
 *   bun run test
 *   bunx vitest run __tests__/llm-prices.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

// ── Import pure helpers from the client module ──────────────────────────────
// We import only exported pure functions; no DOM / React needed.
import {
  fmtPrice,
  fmtCalcCost,
  fmtDate,
  parseTokens,
  calcCost,
  vendorAccent,
  vendorLabel,
  VENDOR_ACCENTS,
  VENDOR_LABELS,
  type PriceEntry,
} from "../app/llm-prices/llm-prices-client"

const ROOT = path.resolve(__dirname, "..")

// ── fmtPrice ────────────────────────────────────────────────────────────────

describe("fmtPrice", () => {
  it("returns '—' for null", () => {
    expect(fmtPrice(null)).toBe("—")
  })
  it("returns '$0' for zero", () => {
    expect(fmtPrice(0)).toBe("$0")
  })
  it("formats sub-cent prices with 4 decimals", () => {
    expect(fmtPrice(0.001)).toBe("$0.0010")
  })
  it("formats prices under $1 with 3 decimals", () => {
    expect(fmtPrice(0.30)).toBe("$0.300")
  })
  it("formats prices under $10 with 2 decimals", () => {
    expect(fmtPrice(3.0)).toBe("$3.00")
  })
  it("formats prices $10+ as whole dollars", () => {
    expect(fmtPrice(15)).toBe("$15")
  })
  it("formats prices $10+ as whole dollars (75)", () => {
    expect(fmtPrice(75)).toBe("$75")
  })
})

// ── fmtCalcCost ─────────────────────────────────────────────────────────────

describe("fmtCalcCost", () => {
  it("returns '$0.00' for zero", () => {
    expect(fmtCalcCost(0)).toBe("$0.00")
  })
  it("formats sub-millionth costs with 8 decimals", () => {
    expect(fmtCalcCost(0.0000001)).toBe("$0.00000010")
  })
  it("formats costs >= $1 with 2 decimals", () => {
    expect(fmtCalcCost(1.5)).toBe("$1.50")
  })
})

// ── fmtDate ─────────────────────────────────────────────────────────────────

describe("fmtDate", () => {
  it("formats an ISO date string to readable form", () => {
    expect(fmtDate("2026-06-09")).toBe("Jun 9, 2026")
  })
  it("returns 'Invalid Date' string for garbage input", () => {
    expect(fmtDate("not-a-date")).toBe("Invalid Date")
  })
})

// ── parseTokens ─────────────────────────────────────────────────────────────

describe("parseTokens", () => {
  it("parses plain integers", () => {
    expect(parseTokens("1000")).toBe(1000)
  })
  it("expands k suffix", () => {
    expect(parseTokens("1k")).toBe(1000)
  })
  it("expands K suffix", () => {
    expect(parseTokens("500K")).toBe(500000)
  })
  it("expands m suffix", () => {
    expect(parseTokens("1m")).toBe(1000000)
  })
  it("expands M suffix", () => {
    expect(parseTokens("2M")).toBe(2000000)
  })
  it("strips commas", () => {
    expect(parseTokens("1,000")).toBe(1000)
  })
  it("returns 0 for empty string", () => {
    expect(parseTokens("")).toBe(0)
  })
  it("returns 0 for non-numeric input", () => {
    expect(parseTokens("abc")).toBe(0)
  })
  it("returns 0 for negative values", () => {
    expect(parseTokens("-100")).toBe(0)
  })
})

// ── calcCost ────────────────────────────────────────────────────────────────

const MOCK_ENTRY: PriceEntry = {
  id: "test-model",
  vendor: "openai",
  name: "Test Model",
  input: 3,
  output: 15,
  input_cached: 0.3,
}

describe("calcCost", () => {
  it("computes cost for input tokens only", () => {
    // 1_000_000 input at $3/M = $3
    expect(calcCost(MOCK_ENTRY, 1_000_000, 0, 0)).toBeCloseTo(3)
  })
  it("computes cost for output tokens only", () => {
    // 1_000_000 output at $15/M = $15
    expect(calcCost(MOCK_ENTRY, 0, 0, 1_000_000)).toBeCloseTo(15)
  })
  it("includes cached token cost when entry has cached rate", () => {
    // 1_000_000 cached at $0.30/M = $0.30
    expect(calcCost(MOCK_ENTRY, 0, 1_000_000, 0)).toBeCloseTo(0.3)
  })
  it("ignores cached tokens when entry has no cached rate", () => {
    const noCached: PriceEntry = { ...MOCK_ENTRY, input_cached: null }
    expect(calcCost(noCached, 0, 1_000_000, 0)).toBe(0)
  })
  it("sums input + cached + output costs", () => {
    // 1M input ($3) + 1M cached ($0.30) + 1M output ($15) = $18.30
    expect(calcCost(MOCK_ENTRY, 1_000_000, 1_000_000, 1_000_000)).toBeCloseTo(18.3)
  })
  it("returns 0 for all-zero token counts", () => {
    expect(calcCost(MOCK_ENTRY, 0, 0, 0)).toBe(0)
  })
})

// ── vendorAccent ────────────────────────────────────────────────────────────

describe("vendorAccent", () => {
  it("returns known color for anthropic", () => {
    expect(vendorAccent("anthropic")).toBe(VENDOR_ACCENTS["anthropic"])
  })
  it("is case-insensitive", () => {
    expect(vendorAccent("OpenAI")).toBe(VENDOR_ACCENTS["openai"])
  })
  it("returns fallback gray for unknown vendor", () => {
    expect(vendorAccent("unknownco")).toBe("#94a3b8")
  })
})

// ── vendorLabel ─────────────────────────────────────────────────────────────

describe("vendorLabel", () => {
  it("returns known label for anthropic", () => {
    expect(vendorLabel("anthropic")).toBe("Anthropic")
  })
  it("returns 'OpenAI' for openai", () => {
    expect(vendorLabel("openai")).toBe("OpenAI")
  })
  it("is case-insensitive", () => {
    expect(vendorLabel("MISTRAL")).toBe("Mistral")
  })
  it("capitalises first letter of unknown vendor", () => {
    expect(vendorLabel("newco")).toBe("Newco")
  })
})

// ── VENDOR_ACCENTS completeness ──────────────────────────────────────────────

describe("VENDOR_ACCENTS", () => {
  it("every accent value starts with #", () => {
    for (const [k, v] of Object.entries(VENDOR_ACCENTS)) {
      expect(v, `accent for ${k}`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})

// ── VENDOR_LABELS completeness ───────────────────────────────────────────────

describe("VENDOR_LABELS", () => {
  it("every label is non-empty", () => {
    for (const [k, v] of Object.entries(VENDOR_LABELS)) {
      expect(v.length, `label for ${k}`).toBeGreaterThan(0)
    }
  })
})

// ── File existence ───────────────────────────────────────────────────────────

describe("llm-prices module files", () => {
  it("client component exists", () => {
    expect(fs.existsSync(path.join(ROOT, "app/llm-prices/llm-prices-client.tsx"))).toBe(true)
  })
  it("page exists", () => {
    expect(fs.existsSync(path.join(ROOT, "app/llm-prices/page.tsx"))).toBe(true)
  })
  it("API proxy route exists", () => {
    expect(fs.existsSync(path.join(ROOT, "app/api/llm-prices/route.ts"))).toBe(true)
  })
})

// ── API route shape ───────────────────────────────────────────────────────────

describe("API proxy route", () => {
  it("exports a GET handler", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/api/llm-prices/route.ts"), "utf-8")
    expect(src).toContain("export async function GET")
  })
  it("sets revalidate = 3600", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/api/llm-prices/route.ts"), "utf-8")
    expect(src).toContain("revalidate = 3600")
  })
})

// ── Page metadata ─────────────────────────────────────────────────────────────

describe("llm-prices page", () => {
  it("exports metadata with a title", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/llm-prices/page.tsx"), "utf-8")
    expect(src).toContain("LLM Pricing")
  })
  it("exports revalidate", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/llm-prices/page.tsx"), "utf-8")
    expect(src).toContain("revalidate")
  })
})
