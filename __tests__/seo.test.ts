/**
 * SEO contract — title/description lengths, JSON-LD @graph, canonical host,
 * sitemap/robots shape, llms.txt, and no phone numbers in public metadata.
 *
 * Run: bunx vitest run __tests__/seo.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { SEO_TITLE, SEO_DESCRIPTION, jsonLd } from "@/lib/seo"
import { SITE_URL } from "@/lib/site-config"
import sitemap from "@/app/sitemap"
import robots from "@/app/robots"

const ROOT = path.resolve(__dirname, "..")
const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf8")
const PHONE = /\+?\d[\d\s().-]{8,}\d/

type Node = { "@id"?: string; "@type"?: string }
const graph = (jsonLd as { "@graph": Node[] })["@graph"]

describe("title and description", () => {
  it("title is 1-60 chars", () => {
    expect(SEO_TITLE.length).toBeGreaterThan(0)
    expect(SEO_TITLE.length).toBeLessThanOrEqual(60)
  })
  it("description is 140-160 chars", () => {
    expect(SEO_DESCRIPTION.length).toBeGreaterThanOrEqual(140)
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160)
  })
})

describe("JSON-LD @graph", () => {
  it("round-trips through JSON and has an @graph array", () => {
    const parsed = JSON.parse(JSON.stringify(jsonLd))
    expect(parsed["@context"]).toBe("https://schema.org")
    expect(Array.isArray(parsed["@graph"])).toBe(true)
  })
  it("has Person and WebSite nodes with stable @ids", () => {
    expect(graph.find((n) => n["@type"] === "Person")?.["@id"]).toBe(`${SITE_URL}/#person`)
    expect(graph.find((n) => n["@type"] === "WebSite")?.["@id"]).toBe(`${SITE_URL}/#website`)
  })
  it("@ids are unique and live under SITE_URL", () => {
    const ids = graph.map((n) => n["@id"]).filter((x): x is string => !!x)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith(SITE_URL)).toBe(true)
  })
})

describe("canonical host", () => {
  it("defaults to www (Vercel redirects apex -> www)", () => {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      expect(SITE_URL.endsWith("/")).toBe(false)
    } else {
      expect(SITE_URL).toBe("https://www.mishalubich.com")
    }
  })
})

describe("sitemap", () => {
  const entries = sitemap()
  const urls = entries.map((e) => e.url)
  it("includes the home page", () => expect(urls).toContain(SITE_URL))
  it("every url is on SITE_URL", () => {
    for (const u of urls) expect(u.startsWith(SITE_URL)).toBe(true)
  })
  it("has no duplicate urls", () => expect(new Set(urls).size).toBe(urls.length))
  it("excludes noindex pages", () => {
    for (const p of ["/demo", "/fork", "/status"]) expect(urls).not.toContain(`${SITE_URL}${p}`)
  })
  it("lists every game page under app/games", () => {
    const games = fs.readdirSync(path.join(ROOT, "app/games"), { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, "app/games", d.name, "page.tsx")))
    expect(games.length).toBeGreaterThan(0)
    for (const g of games) expect(urls).toContain(`${SITE_URL}/games/${g.name}`)
  })
  it("every entry has lastModified", () => {
    for (const e of entries) expect(e.lastModified).toBeTruthy()
  })
})

describe("robots", () => {
  const r = robots()
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules
  it("points at the sitemap and host", () => {
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
    expect(r.host).toBe(SITE_URL)
  })
  it("keeps private disallows", () => {
    expect(rules.disallow).toEqual(expect.arrayContaining(["/status", "/api/"]))
  })
})

describe("no telephone in public metadata", () => {
  const stripUrls = (s: string) => s.replace(/https?:\/\/\S+/g, "")
  it("JSON-LD has no telephone and no phone-like number", () => {
    const s = JSON.stringify(jsonLd)
    expect(s).not.toMatch(/telephone/i)
    expect(stripUrls(s)).not.toMatch(PHONE)
  })
  it("llms.txt has no phone-like number", () => {
    expect(llms).not.toMatch(/telephone/i)
    expect(stripUrls(llms)).not.toMatch(PHONE)
  })
})

describe("search console verification", () => {
  it("layout wires NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION into metadata.verification", () => {
    const src = fs.readFileSync(path.join(ROOT, "app/layout.tsx"), "utf8")
    expect(src).toContain("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION")
    expect(src).toContain("verification")
  })
})

describe("llms.txt", () => {
  it("starts with an H1 and names the site host", () => {
    expect(llms.startsWith("# ")).toBe(true)
    expect(llms).toContain(new URL(SITE_URL).host)
  })
})
