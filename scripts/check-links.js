#!/usr/bin/env node
/**
 * check-links.js
 * ───────────────
 * Dynamically scans every .tsx / .ts source file for <a href="…"> values,
 * then validates:
 *   • External URLs  → HEAD (fallback GET) must return 2xx/3xx
 *   • Anchor links   → #id must match a real  id="…"  in the codebase
 *   • Internal pages  → /path must map to an existing app/ route directory
 *
 * Usage:
 *   node scripts/check-links.js          # run standalone
 *   bun run test:links                   # via package.json script
 *
 * Exit codes:  0 = all good,  1 = broken links found
 */

const fs = require("fs")
const path = require("path")
const https = require("https")
const http = require("http")

// ── Config ─────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..")
const SRC_DIRS = ["app", "components"]
const FILE_EXTS = [".tsx", ".ts"]
const APP_DIR = path.join(ROOT, "app")

// Some URLs need a real browser User-Agent to avoid 403
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

// Patterns we intentionally skip (template literals, placeholders, etc.)
const SKIP_PATTERNS = [
  /^\$\{/,        // template literal expression
  /^\{/,          // JSX expression (dynamic)
  /^#$/,          // bare "#" (scroll-to-top / placeholder)
  /^mailto:/,     // mailto links — not HTTP
  /^tel:/,        // tel links — not HTTP
  /^javascript:/, // legacy inline JS
]

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Recursively list every file under `dir` matching `exts`. */
function walk(dir, exts) {
  let results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir.toString(), entry.name)
    if (entry.isDirectory()) {
      results = results.concat(walk(full, exts))
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full)
    }
  }
  return results
}

/** Extract every href="…" value from source text, returning { href, file, line }. */
function extractHrefs(filePath) {
  const src = fs.readFileSync(filePath, "utf-8")
  const lines = src.split("\n")
  const found = []

  // Match JSX:  href="...", href={'...'}, href={"..."}
  // Match obj:  href: "...", href: '...'
  const patterns = [
    /href=["'{]?\s*["']([^"'{}]+)["']/g,
    /href:\s*["']([^"']+)["']/g,
  ]

  lines.forEach((line, idx) => {
    for (const re of patterns) {
      let m
      while ((m = re.exec(line)) !== null) {
        found.push({ href: m[1].trim(), file: filePath, line: idx + 1 })
      }
      re.lastIndex = 0 // reset per line
    }
  })

  // Dedupe within same file+href (both patterns might match the same JSX attr)
  const seen = new Set()
  return found.filter((f) => {
    const key = `${f.line}:${f.href}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Collect all id="..." values across source files (section anchors). */
function collectSectionIds(files) {
  const ids = new Set()
  const re = /\bid=["']([a-zA-Z0-9_-]+)["']/g
  for (const f of files) {
    const src = fs.readFileSync(f, "utf-8")
    let m
    while ((m = re.exec(src)) !== null) {
      ids.add(m[1])
    }
  }
  return ids
}

/** Check whether an internal page path like /blog or / maps to an app/ route. */
function internalPageExists(urlPath) {
  // "/" → app/page.tsx
  // "/blog" → app/blog/page.tsx
  const stripped = urlPath === "/" ? "" : urlPath.replace(/^\//, "")
  const dir = path.join(APP_DIR, stripped)
  if (!fs.existsSync(dir)) return false
  // Must contain a page.tsx (or page.ts)
  return (
    fs.existsSync(path.join(dir, "page.tsx")) ||
    fs.existsSync(path.join(dir, "page.ts"))
  )
}

/** HEAD-then-GET check for an external URL. Resolves to { ok, status, error }. */
function checkUrl(url) {
  return new Promise((resolve) => {
    const doRequest = (method, redirects = 0) => {
      if (redirects > 5) {
        return resolve({ ok: false, status: "too many redirects", error: null })
      }

      const lib = url.startsWith("https") ? https : http
      const options = {
        method,
        timeout: 15000,
        headers: { "User-Agent": UA },
      }

      const req = lib.request(url, options, (res) => {
        // Follow redirects
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          const next = new URL(res.headers.location, url).href
          url = next
          return doRequest("HEAD", redirects + 1)
        }

        const ok = res.statusCode >= 200 && res.statusCode < 400
        // Some servers reject HEAD — fall back to GET
        if (!ok && method === "HEAD" && [403, 405, 406].includes(res.statusCode)) {
          return doRequest("GET", redirects)
        }
        resolve({ ok, status: res.statusCode, error: null })

        // Consume data so socket frees
        res.resume()
      })

      req.on("timeout", () => {
        req.destroy()
        resolve({ ok: false, status: "timeout", error: null })
      })
      req.on("error", (err) => {
        // HEAD rejected — try GET
        if (method === "HEAD") return doRequest("GET", redirects)
        resolve({ ok: false, status: null, error: err.message })
      })
      req.end()
    }

    doRequest("HEAD")
  })
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔗  Link checker – scanning source files…\n")

  // 1. Collect files
  const files = SRC_DIRS.flatMap((d) => walk(path.join(ROOT, d), FILE_EXTS))
  console.log(`   Found ${files.length} source files`)

  // 2. Extract all href values
  const allLinks = files.flatMap(extractHrefs)
  console.log(`   Found ${allLinks.length} raw href values\n`)

  // 3. Dedupe + categorise
  const externalUrls = new Map() // url → [{ file, line }]
  const anchorLinks = new Map()  // #id → [{ file, line }]
  const internalPages = new Map() // /path → [{ file, line }]

  for (const { href, file, line } of allLinks) {
    if (SKIP_PATTERNS.some((p) => p.test(href))) continue

    const relFile = path.relative(ROOT, file)
    const loc = { file: relFile, line }

    if (href.startsWith("http://") || href.startsWith("https://")) {
      // Strip dynamic query params from share-intent URLs for dedup,
      // but we still test the full URL.
      const key = href
      if (!externalUrls.has(key)) externalUrls.set(key, [])
      externalUrls.get(key).push(loc)
    } else if (href.startsWith("#")) {
      const id = href.slice(1)
      if (!anchorLinks.has(id)) anchorLinks.set(id, [])
      anchorLinks.get(id).push(loc)
    } else if (href.startsWith("/")) {
      // Strip query strings for route resolution
      const routePath = href.split("?")[0]
      if (!internalPages.has(routePath)) internalPages.set(routePath, [])
      internalPages.get(routePath).push(loc)
    }
  }

  // 4. Collect section IDs for anchor validation
  const sectionIds = collectSectionIds(files)

  const broken = []

  // ── 4a. Anchor links ─────────────────────────────────────────────────────
  console.log(`⚓  Checking ${anchorLinks.size} anchor links…`)
  for (const [id, locs] of anchorLinks) {
    if (!sectionIds.has(id)) {
      broken.push({ type: "anchor", href: `#${id}`, locs, reason: `no id="${id}" found in source` })
    }
  }

  // ── 4b. Internal pages ───────────────────────────────────────────────────
  console.log(`📄  Checking ${internalPages.size} internal page links…`)

  // Dynamic routes (contain [param]) are OK if the parent dir exists
  for (const [routePath, locs] of internalPages) {
    if (routePath.includes("[")) continue // dynamic route — skip runtime check
    if (!internalPageExists(routePath)) {
      broken.push({ type: "page", href: routePath, locs, reason: "no matching app/ route found" })
    }
  }

  // ── 4c. External URLs ────────────────────────────────────────────────────
  console.log(`🌐  Checking ${externalUrls.size} external URLs (this may take a moment)…\n`)

  // Check in batches of 5 to be polite
  const entries = [...externalUrls.entries()]
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5)
    const results = await Promise.all(
      batch.map(async ([url, locs]) => {
        const result = await checkUrl(url)
        const shortUrl = url.length > 70 ? url.slice(0, 67) + "…" : url
        if (result.ok) {
          console.log(`   ✅  ${result.status}  ${shortUrl}`)
        } else {
          const reason = result.error || `HTTP ${result.status}`
          console.log(`   ❌  ${reason}  ${shortUrl}`)
          broken.push({ type: "external", href: url, locs, reason })
        }
        return result
      })
    )
  }

  // ── 5. Report ─────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60))

  if (broken.length === 0) {
    console.log("✅  All links are valid!\n")
    process.exit(0)
  }

  console.log(`\n❌  Found ${broken.length} broken link(s):\n`)
  for (const b of broken) {
    console.log(`  [${b.type.toUpperCase()}]  ${b.href}`)
    console.log(`    Reason: ${b.reason}`)
    for (const loc of b.locs) {
      console.log(`    → ${loc.file}:${loc.line}`)
    }
    console.log()
  }

  process.exit(1)
}

main().catch((err) => {
  console.error("Link checker failed:", err)
  process.exit(1)
})
