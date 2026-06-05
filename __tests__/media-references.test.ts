import fs from "node:fs"
import http from "node:http"
import https from "node:https"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(__dirname, "..")
const PUBLIC_DIR = path.join(ROOT, "public")

const SCAN_DIRS = ["app", "components", "content", "data", "lib", "styles", "public"] as const
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".webmanifest",
])
const MEDIA_EXTENSIONS = /\.(?:avif|bin|gif|ico|jpe?g|m4v|mov|mp3|mp4|ogg|otf|png|svg|ttf|wav|webm|webmanifest|webp|woff2?)(?:[?#].*)?$/iu
const LOCAL_MEDIA_PREFIXES = ["/favicon/", "/images/", "/media/"] as const
const REMOTE_MEDIA_HOST_HINTS = ["images.", "img.", "media.", "cdn.", "static."] as const
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
const REQUEST_TIMEOUT_MS = 8_000
const REMOTE_MEDIA_TEST_TIMEOUT_MS = 60_000

interface MediaReference {
  url: string
  sourceFile: string
  line: number
  detector: string
}

interface ReferencePattern {
  detector: string
  regex: RegExp
  includeBrowserRelative: boolean
}

interface LocalResolution {
  reference: MediaReference
  assetPath: string | null
  ok: boolean
  reason: string
}

interface HttpResult {
  ok: boolean
  status: number | string
  error: string | null
}

const REFERENCE_PATTERNS: ReferencePattern[] = [
  {
    detector: "media attribute",
    regex: /\b(?:href|poster|src|srcSet)\s*=\s*(?:\{\s*)?["']([^"'{}]+)["']/gu,
    includeBrowserRelative: true,
  },
  {
    detector: "media property",
    regex: /\b(?:avatar|avatarSrc|coverImage|image|images|manifest|shortcut|url)\s*:\s*["']([^"']+)["']/gu,
    includeBrowserRelative: false,
  },
  {
    detector: "markdown image",
    regex: /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu,
    includeBrowserRelative: true,
  },
  {
    detector: "css url",
    regex: /url\(\s*["']?([^"')]+)["']?\s*\)/gu,
    includeBrowserRelative: false,
  },
  {
    detector: "quoted media path",
    regex: /["']([^"']+)["']/gu,
    includeBrowserRelative: false,
  },
]

function walkTextFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkTextFiles(fullPath))
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length
}

function isCommentOnlyLine(source: string, index: number): boolean {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1
  const lineEnd = source.indexOf("\n", index)
  const line = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd)
  const trimmedLine = line.trimStart()
  return trimmedLine.startsWith("*") || trimmedLine.startsWith("//") || trimmedLine.startsWith("/*")
}

function normalizeCandidate(raw: string): string {
  return raw.trim().replace(/^&quot;|&quot;$/gu, "")
}

function isDynamicCandidate(url: string): boolean {
  return url === "" || url.includes("${") || url.includes("{") || url.includes("}")
}

function isRemoteUrl(url: string): boolean {
  return url.startsWith("https://") || url.startsWith("http://")
}

function isDataMediaUrl(url: string): boolean {
  return /^(?:data:image|data:video|data:audio)\//iu.test(url)
}

function isLocalMediaUrl(url: string): boolean {
  if (LOCAL_MEDIA_PREFIXES.some((prefix) => url.startsWith(prefix))) return true
  return MEDIA_EXTENSIONS.test(url)
}

function isRemoteMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      MEDIA_EXTENSIONS.test(parsed.pathname) ||
      REMOTE_MEDIA_HOST_HINTS.some((hint) => parsed.hostname.includes(hint))
    )
  } catch {
    return false
  }
}

function shouldCollectMediaUrl(url: string, includeBrowserRelative: boolean): boolean {
  if (isDynamicCandidate(url)) return false
  if (url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return false
  if (isDataMediaUrl(url)) return true
  if (isRemoteUrl(url)) return isRemoteMediaUrl(url)
  if (isLocalMediaUrl(url)) return true
  return includeBrowserRelative && !url.startsWith("/")
}

function collectMediaReferences(): MediaReference[] {
  const files = SCAN_DIRS.flatMap((dir) => walkTextFiles(path.join(ROOT, dir)))
  const seen = new Set<string>()
  const references: MediaReference[] = []

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8")
    for (const pattern of REFERENCE_PATTERNS) {
      let match: RegExpExecArray | null
      while ((match = pattern.regex.exec(source)) !== null) {
        if (isCommentOnlyLine(source, match.index)) continue
        const url = normalizeCandidate(match[1])
        if (!shouldCollectMediaUrl(url, pattern.includeBrowserRelative)) continue

        const sourceFile = path.relative(ROOT, filePath)
        const line = lineNumberAt(source, match.index)
        const key = `${sourceFile}:${line}:${url}`
        if (seen.has(key)) continue
        seen.add(key)
        references.push({ url, sourceFile, line, detector: pattern.detector })
      }
      pattern.regex.lastIndex = 0
    }
  }

  return references.sort((a, b) =>
    `${a.sourceFile}:${a.line}:${a.url}`.localeCompare(`${b.sourceFile}:${b.line}:${b.url}`)
  )
}

function stripQueryAndHash(url: string): string {
  return url.split(/[?#]/u)[0]
}

function decodePathSegment(urlPath: string): string {
  try {
    return decodeURIComponent(urlPath)
  } catch {
    return urlPath
  }
}

function resolveLocalReference(reference: MediaReference): LocalResolution {
  const urlPath = decodePathSegment(stripQueryAndHash(reference.url))

  if (urlPath.startsWith("/")) {
    const assetPath = path.join(PUBLIC_DIR, urlPath.replace(/^\/+/, ""))
    return {
      reference,
      assetPath,
      ok: fs.existsSync(assetPath) && fs.statSync(assetPath).isFile(),
      reason: `Expected public asset ${path.relative(ROOT, assetPath)} to exist`,
    }
  }

  if (urlPath.startsWith("./") || urlPath.startsWith("../")) {
    const sourceDir = path.dirname(path.join(ROOT, reference.sourceFile))
    const assetPath = path.resolve(sourceDir, urlPath)
    return {
      reference,
      assetPath,
      ok: fs.existsSync(assetPath) && fs.statSync(assetPath).isFile(),
      reason: `Expected relative asset ${path.relative(ROOT, assetPath)} to exist`,
    }
  }

  return {
    reference,
    assetPath: null,
    ok: false,
    reason: "Browser-relative media URLs must start with /, ./, ../, https://, or data:",
  }
}

function groupByUrl(references: MediaReference[]): Map<string, MediaReference[]> {
  const grouped = new Map<string, MediaReference[]>()
  for (const reference of references) {
    const existing = grouped.get(reference.url) ?? []
    existing.push(reference)
    grouped.set(reference.url, existing)
  }
  return grouped
}

function formatLocations(references: readonly MediaReference[]): string {
  return references
    .map((reference) => `${reference.sourceFile}:${reference.line} (${reference.detector})`)
    .join(", ")
}

function checkRemoteUrl(targetUrl: string): Promise<HttpResult> {
  return new Promise((resolve) => {
    let currentUrl = targetUrl

    const doRequest = (method: "GET" | "HEAD", redirects: number): void => {
      if (redirects > 5) {
        resolve({ ok: false, status: "too many redirects", error: null })
        return
      }

      const client = currentUrl.startsWith("https://") ? https : http
      const request = client.request(
        currentUrl,
        { method, timeout: REQUEST_TIMEOUT_MS, headers: { "User-Agent": USER_AGENT } },
        (response) => {
          const statusCode = response.statusCode ?? 0
          if ([301, 302, 307, 308].includes(statusCode) && response.headers.location) {
            currentUrl = new URL(response.headers.location, currentUrl).href
            response.resume()
            doRequest("HEAD", redirects + 1)
            return
          }

          if (method === "HEAD" && [403, 405, 406].includes(statusCode)) {
            response.resume()
            doRequest("GET", redirects)
            return
          }

          response.resume()
          resolve({ ok: statusCode >= 200 && statusCode < 400, status: statusCode, error: null })
        }
      )

      request.on("timeout", () => {
        request.destroy()
        resolve({ ok: false, status: "timeout", error: null })
      })
      request.on("error", (error) => {
        if (method === "HEAD") {
          doRequest("GET", redirects)
          return
        }
        resolve({ ok: false, status: 0, error: error.message })
      })
      request.end()
    }

    doRequest("HEAD", 0)
  })
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex])
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

const mediaReferences = collectMediaReferences()
const nonDataReferences = mediaReferences.filter((reference) => !isDataMediaUrl(reference.url))
const localReferences = nonDataReferences.filter((reference) => !isRemoteUrl(reference.url))
const remoteReferencesByUrl = groupByUrl(
  nonDataReferences.filter((reference) => isRemoteUrl(reference.url))
)

describe("media references", () => {
  it("discovers media and static resource references across the app", () => {
    expect(mediaReferences.length).toBeGreaterThan(0)
    expect(localReferences.some((reference) => reference.url === "/logo.png")).toBe(true)
    expect([...remoteReferencesByUrl.keys()].some((url) => url.includes("images.unsplash.com"))).toBe(true)
  })

  it("resolves every local media reference to an existing file", () => {
    const failures = localReferences
      .map(resolveLocalReference)
      .filter((result) => !result.ok)
      .map((result) => {
        const location = formatLocations([result.reference])
        const asset = result.assetPath ? ` -> ${path.relative(ROOT, result.assetPath)}` : ""
        return `${result.reference.url}${asset} (${location}): ${result.reason}`
      })

    expect(failures, failures.join("\n")).toEqual([])
  })

  it("allows every remote blog cover host in next/image config", () => {
    const nextConfigSource = fs.readFileSync(path.join(ROOT, "next.config.mjs"), "utf8")
    const blogCoverHosts = new Set(
      [...remoteReferencesByUrl.entries()]
        .filter(([, references]) => references.some((reference) => reference.sourceFile === "data/blog/post-meta.json"))
        .map(([url]) => new URL(url).hostname)
    )

    expect(blogCoverHosts.size).toBeGreaterThan(0)
    const missingHosts = [...blogCoverHosts].filter(
      (host) => !nextConfigSource.includes(`hostname: "${host}"`)
    )

    expect(missingHosts, missingHosts.join("\n")).toEqual([])
  })

  it("gets a successful HTTP response for every remote media URL", async () => {
    const remoteUrls = [...remoteReferencesByUrl.keys()]
    const results = await mapWithConcurrency(remoteUrls, 6, async (url) => ({
      url,
      result: await checkRemoteUrl(url),
    }))
    const failures = results
      .filter(({ result }) => !result.ok)
      .map(({ url, result }) => {
        const locations = formatLocations(remoteReferencesByUrl.get(url) ?? [])
        return `${url} -> ${result.error ?? `HTTP ${result.status}`} (${locations})`
      })

    expect(failures, failures.join("\n")).toEqual([])
  }, REMOTE_MEDIA_TEST_TIMEOUT_MS)
})