/**
 * Smoke test — validate every <a href="…"> in the codebase.
 *
 * ✓ Anchor links (#id)     → matching id="…" must exist in source
 * ✓ Internal pages (/path) → matching app/ route directory must exist
 * ✓ External URLs (https:) → HEAD/GET must return 2xx or 3xx
 *
 * Runs automatically before `next build` via the "prebuild" script
 * so a broken link fails the build.
 *
 *   bun run test            # run all tests
 *   bun run test:links      # run just this file
 *   bunx vitest run         # alternative
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import https from "https"
import http from "http"

// ── Config ─────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..")
const SRC_DIRS = ["app", "components"]
const FILE_EXTS = [".tsx", ".ts"]
const APP_DIR = path.join(ROOT, "app")

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

/** Patterns we intentionally skip (dynamic, non-HTTP, placeholder). */
const SKIP_PATTERNS = [
  /^\$\{/,        // template literal
  /^\{/,          // JSX expression
  /^#$/,          // bare "#"
  /^mailto:/,
  /^tel:/,
  /^javascript:/,
]

/** External URLs that are valid but return non-2xx for bots (preconnect, bot-blocked, etc.) */
const EXTERNAL_ALLOWLIST = new Set([
  "https://fonts.googleapis.com",    // preconnect — no page at root
  "https://fonts.gstatic.com",       // preconnect — no page at root
  "https://www.googletagmanager.com", // dns-prefetch — no page at root
])

/** Domains that aggressively block cloud-IP / bot traffic (valid links, but 403 in CI). */
const BOT_BLOCKED_DOMAINS = [
  "scholar.google.com",
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function walk(dir: string): string[] {
  let results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results = results.concat(walk(full))
    else if (FILE_EXTS.some((e) => entry.name.endsWith(e))) results.push(full)
  }
  return results
}

interface HrefEntry {
  href: string
  file: string
  line: number
}

function extractHrefs(filePath: string): HrefEntry[] {
  const src = fs.readFileSync(filePath, "utf-8")
  const lines = src.split("\n")
  const found: HrefEntry[] = []

  const patterns = [
    /href=["'{]?\s*["']([^"'{}]+)["']/g,  // JSX attr
    /href:\s*["']([^"']+)["']/g,           // object property
  ]

  lines.forEach((line, idx) => {
    for (const re of patterns) {
      let m: RegExpExecArray | null
      while ((m = re.exec(line)) !== null) {
        found.push({ href: m[1].trim(), file: filePath, line: idx + 1 })
      }
      re.lastIndex = 0
    }
  })

  const seen = new Set<string>()
  return found.filter((f) => {
    const key = `${f.line}:${f.href}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function collectSectionIds(files: string[]): Set<string> {
  const ids = new Set<string>()
  const re = /\bid=["']([a-zA-Z0-9_-]+)["']/g
  for (const f of files) {
    const src = fs.readFileSync(f, "utf-8")
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) ids.add(m[1])
  }
  return ids
}

function internalPageExists(urlPath: string): boolean {
  // Strip hash fragments (e.g. "/#about" → "/")
  const pathOnly = urlPath.split("#")[0].split("?")[0]
  const stripped = pathOnly === "/" ? "" : pathOnly.replace(/^\//, "")
  const dir = path.join(APP_DIR, stripped)
  if (!fs.existsSync(dir)) return false
  return (
    fs.existsSync(path.join(dir, "page.tsx")) ||
    fs.existsSync(path.join(dir, "page.ts"))
  )
}

function checkUrl(targetUrl: string): Promise<{ ok: boolean; status: number | string; error: string | null }> {
  return new Promise((resolve) => {
    let currentUrl = targetUrl
    const doRequest = (method: string, redirects = 0) => {
      if (redirects > 5) return resolve({ ok: false, status: "too many redirects", error: null })

      const lib = currentUrl.startsWith("https") ? https : http
      const req = lib.request(currentUrl, { method, timeout: 15_000, headers: { "User-Agent": UA } }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode!) && res.headers.location) {
          currentUrl = new URL(res.headers.location, currentUrl).href
          return doRequest("HEAD", redirects + 1)
        }
        const ok = res.statusCode! >= 200 && res.statusCode! < 400
        if (!ok && method === "HEAD" && [403, 405, 406].includes(res.statusCode!)) {
          return doRequest("GET", redirects)
        }
        resolve({ ok, status: res.statusCode!, error: null })
        res.resume()
      })
      req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: "timeout", error: null }) })
      req.on("error", (err) => {
        if (method === "HEAD") return doRequest("GET", redirects)
        resolve({ ok: false, status: 0, error: err.message })
      })
      req.end()
    }
    doRequest("HEAD")
  })
}

// ── Scan the codebase once, shared by all tests ────────────────────────────────

const files = SRC_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
const allLinks = files.flatMap(extractHrefs)
const sectionIds = collectSectionIds(files)

/** Filter + categorise links */
function categorise() {
  const external = new Map<string, HrefEntry[]>()
  const anchors = new Map<string, HrefEntry[]>()
  const pages = new Map<string, HrefEntry[]>()

  for (const entry of allLinks) {
    if (SKIP_PATTERNS.some((p) => p.test(entry.href))) continue
    const rel: HrefEntry = { ...entry, file: path.relative(ROOT, entry.file) }

    if (entry.href.startsWith("http://") || entry.href.startsWith("https://")) {
      if (!external.has(entry.href)) external.set(entry.href, [])
      external.get(entry.href)!.push(rel)
    } else if (entry.href.startsWith("#")) {
      const id = entry.href.slice(1)
      if (!anchors.has(id)) anchors.set(id, [])
      anchors.get(id)!.push(rel)
    } else if (entry.href.startsWith("/")) {
      const routePath = entry.href.split("?")[0]
      if (!pages.has(routePath)) pages.set(routePath, [])
      pages.get(routePath)!.push(rel)
      // Also validate the anchor fragment if present (e.g. "/#about" → check #about)
      const hashIdx = entry.href.indexOf("#")
      if (hashIdx !== -1) {
        const id = entry.href.slice(hashIdx + 1)
        if (id) {
          if (!anchors.has(id)) anchors.set(id, [])
          anchors.get(id)!.push(rel)
        }
      }
    }
  }
  return { external, anchors, pages }
}

const { external, anchors, pages } = categorise()

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("Link smoke tests", () => {
  it("should discover links in the codebase", () => {
    expect(allLinks.length).toBeGreaterThan(0)
  })

  // ── Anchor links ─────────────────────────────────────────────────────────
  describe("Anchor links (#id → section exists)", () => {
    for (const [id, locs] of anchors) {
      const where = locs.map((l) => `${l.file}:${l.line}`).join(", ")
      it(`#${id}  (${where})`, () => {
        expect(
          sectionIds.has(id),
          `No element with id="${id}" found in source. Referenced in: ${where}`
        ).toBe(true)
      })
    }
  })

  // ── Internal page links ──────────────────────────────────────────────────
  describe("Internal page links (/path → route exists)", () => {
    for (const [routePath, locs] of pages) {
      if (routePath.includes("[")) continue // dynamic routes
      const where = locs.map((l) => `${l.file}:${l.line}`).join(", ")
      it(`${routePath}  (${where})`, () => {
        expect(
          internalPageExists(routePath),
          `No app/ route for "${routePath}". Referenced in: ${where}`
        ).toBe(true)
      })
    }
  })

  // ── External URLs ────────────────────────────────────────────────────────
  describe("External URLs (HTTP 2xx/3xx)", () => {
    for (const [url, locs] of external) {
      if (EXTERNAL_ALLOWLIST.has(url)) continue // preconnect / dns-prefetch — no page at root
      const host = new URL(url).hostname
      if (BOT_BLOCKED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) continue
      const where = locs.map((l) => `${l.file}:${l.line}`).join(", ")
      const short = url.length > 60 ? url.slice(0, 57) + "…" : url
      it(`${short}  (${where})`, async () => {
        const result = await checkUrl(url)
        expect(
          result.ok,
          `${url} → ${result.error ?? `HTTP ${result.status}`}. Referenced in: ${where}`
        ).toBe(true)
      })
    }
  })
})
