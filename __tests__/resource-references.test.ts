import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(__dirname, "..")
const PUBLIC_DIR = path.join(ROOT, "public")
const SCAN_DIRS = ["app", "components", "content", "data", "lib", "public", "styles"] as const
const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".webmanifest",
])
const RESOURCE_EXTENSIONS = [
  "avif",
  "bin",
  "gif",
  "ico",
  "jpg",
  "jpeg",
  "m4v",
  "mov",
  "mp3",
  "mp4",
  "ogg",
  "png",
  "svg",
  "webm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
] as const
const RESOURCE_EXTENSION_PATTERN = RESOURCE_EXTENSIONS.join("|")
const MEDIA_PROPERTY_NAMES = "(?:src|poster|coverImage|avatarSrc|avatar|image|manifest|shortcut|url)"

interface ResourceReference {
  url: string
  absoluteFilePath: string
  relativeFilePath: string
  line: number
  source: string
  requirePublicRoot: boolean
}

function walkTextFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkTextFiles(fullPath))
    } else if (TEXT_FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function stripBlockComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//gu, (match) =>
    match.replace(/[^\n]/gu, " ")
  )
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length
}

function hasResourceExtension(url: string): boolean {
  const pathname = stripQueryAndHash(url)
  return new RegExp(`\\.(${RESOURCE_EXTENSION_PATTERN})$`, "iu").test(pathname)
}

function stripQueryAndHash(url: string): string {
  return url.split("#")[0]?.split("?")[0] ?? url
}

function isExternalOrSpecialUrl(url: string): boolean {
  const trimmed = url.trim()
  return (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("$") ||
    trimmed.includes("${") ||
    trimmed.includes("data:") ||
    /^[a-z][a-z0-9+.-]*:/iu.test(trimmed)
  )
}

function isPublicTextFile(filePath: string): boolean {
  const relative = path.relative(PUBLIC_DIR, filePath)
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

function addReference(
  references: ResourceReference[],
  seen: Set<string>,
  absoluteFilePath: string,
  source: string,
  url: string,
  index: number,
  requirePublicRoot: boolean
): void {
  const trimmedUrl = url.trim().replace(/^\\?["']|\\?["']$/gu, "")
  if (isExternalOrSpecialUrl(trimmedUrl)) return

  const shouldCheck = hasResourceExtension(trimmedUrl) || requirePublicRoot
  if (!shouldCheck) return

  const relativeFilePath = path.relative(ROOT, absoluteFilePath)
  const line = lineNumberAt(source, index)
  const key = `${relativeFilePath}:${line}:${trimmedUrl}`
  if (seen.has(key)) return
  seen.add(key)

  references.push({
    url: trimmedUrl,
    absoluteFilePath,
    relativeFilePath,
    line,
    source,
    requirePublicRoot,
  })
}

function extractReferencesFromFile(absoluteFilePath: string): ResourceReference[] {
  const rawSource = fs.readFileSync(absoluteFilePath, "utf8")
  const source = stripBlockComments(rawSource)
  const references: ResourceReference[] = []
  const seen = new Set<string>()

  const quotedResourcePattern = new RegExp(
    "[\\x22\\x27\\x60]((?:/|\\./|\\.\\./)[^\\x22\\x27\\x60\\s)]+\\.(?:" +
      RESOURCE_EXTENSION_PATTERN +
      ")(?:[?#][^\\x22\\x27\\x60\\s)]*)?)[\\x22\\x27\\x60]",
    "giu"
  )
  const mediaAttributePattern = /\b(?:src|poster)\s*=\s*["']([^"']+)["']/giu
  const hrefResourcePattern = /\bhref\s*=\s*["']([^"']+)["']/giu
  const mediaPropertyPattern = new RegExp(
    `(?:^|[,{])\\s*(?:"${MEDIA_PROPERTY_NAMES}"|'${MEDIA_PROPERTY_NAMES}'|${MEDIA_PROPERTY_NAMES})\\s*:\\s*["']([^"']+)["']`,
    "gimu"
  )
  const markdownImagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/giu
  const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/giu

  for (const pattern of [quotedResourcePattern, markdownImagePattern, cssUrlPattern]) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(source)) !== null) {
      addReference(references, seen, absoluteFilePath, source, match[1] ?? "", match.index, false)
    }
  }

  let mediaMatch: RegExpExecArray | null
  while ((mediaMatch = mediaAttributePattern.exec(source)) !== null) {
    addReference(references, seen, absoluteFilePath, source, mediaMatch[1] ?? "", mediaMatch.index, true)
  }

  while ((mediaMatch = mediaPropertyPattern.exec(source)) !== null) {
    addReference(references, seen, absoluteFilePath, source, mediaMatch[1] ?? "", mediaMatch.index, true)
  }

  while ((mediaMatch = hrefResourcePattern.exec(source)) !== null) {
    const url = mediaMatch[1] ?? ""
    addReference(references, seen, absoluteFilePath, source, url, mediaMatch.index, hasResourceExtension(url))
  }

  return references
}

function resolveResourceReference(reference: ResourceReference): string | null {
  const pathname = stripQueryAndHash(reference.url)

  if (pathname.startsWith("/")) {
    return path.join(PUBLIC_DIR, pathname.slice(1))
  }

  if (isPublicTextFile(reference.absoluteFilePath)) {
    return path.resolve(path.dirname(reference.absoluteFilePath), pathname)
  }

  return null
}

function formatReference(reference: ResourceReference, reason: string): string {
  return `${reference.relativeFilePath}:${reference.line} -> ${reference.url} (${reason})`
}

const scanFiles = SCAN_DIRS.flatMap((dir) => walkTextFiles(path.join(ROOT, dir)))
const resourceReferences = scanFiles.flatMap(extractReferencesFromFile)

describe("static resource references", () => {
  it("discovers media and static asset references across app, content, data, and public metadata", () => {
    expect(resourceReferences.length).toBeGreaterThan(0)
  })

  it("resolves every local media/static asset reference to an existing public file", () => {
    const failures: string[] = []

    for (const reference of resourceReferences) {
      const resolved = resolveResourceReference(reference)
      if (resolved === null) {
        failures.push(formatReference(reference, "relative media paths in app/content/data must be rooted at / and served from public/"))
        continue
      }

      const relativeToPublic = path.relative(PUBLIC_DIR, resolved)
      if (relativeToPublic.startsWith("..") || path.isAbsolute(relativeToPublic)) {
        failures.push(formatReference(reference, "resolved outside public/"))
        continue
      }

      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        failures.push(formatReference(reference, `missing public/${relativeToPublic}`))
      }
    }

    expect(failures, failures.join("\n")).toEqual([])
  })
})