/**
 * SEO & site structure tests — validate metadata, routes, and files
 *
 * Ensures the site has proper SEO metadata, all expected routes exist,
 * required static assets are present, and the sitemap/robots config
 * is well-formed. These are the kind of pre-deploy checks that catch
 * regressions Vercel won't warn you about.
 *
 *   bun run test
 *   bunx vitest run __tests__/seo-structure.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")
const APP_DIR = path.join(ROOT, "app")
const PUBLIC_DIR = path.join(ROOT, "public")

// ── Route existence ────────────────────────────────────────────────────────────

describe("App routes exist", () => {
    const expectedRoutes = [
        { route: "/", desc: "homepage" },
        { route: "/blog", desc: "blog listing" },
        { route: "/blog/[slug]", desc: "blog post (dynamic)" },
        { route: "/demo", desc: "demo page" },
        { route: "/feed.xml", desc: "RSS feed" },
    ]

    for (const { route, desc } of expectedRoutes) {
        it(`${desc} (${route}) has a page or route file`, () => {
            const stripped = route === "/" ? "" : route.replace(/^\//, "")
            const dir = path.join(APP_DIR, stripped)
            expect(fs.existsSync(dir), `Directory ${dir} should exist`).toBe(true)

            const hasPage =
                fs.existsSync(path.join(dir, "page.tsx")) ||
                fs.existsSync(path.join(dir, "page.ts")) ||
                fs.existsSync(path.join(dir, "route.ts")) ||
                fs.existsSync(path.join(dir, "route.tsx"))
            expect(hasPage, `${dir} should have a page.tsx or route.ts`).toBe(true)
        })
    }
})

// ── Essential files ────────────────────────────────────────────────────────────

describe("Essential files exist", () => {
    const requiredFiles = [
        "app/layout.tsx",
        "app/page.tsx",
        "app/not-found.tsx",
        "app/error.tsx",
        "app/robots.ts",
        "app/sitemap.ts",
        "middleware.ts",
        "next.config.mjs",
        "tailwind.config.ts",
        "tsconfig.json",
        "package.json",
    ]

    for (const file of requiredFiles) {
        it(`${file} exists`, () => {
            expect(fs.existsSync(path.join(ROOT, file))).toBe(true)
        })
    }
})

// ── Favicon & static assets ────────────────────────────────────────────────────

describe("Static assets exist", () => {
    const requiredAssets = [
        "public/favicon/favicon.ico",
        "public/favicon/favicon-16x16.png",
        "public/favicon/favicon-32x32.png",
        "public/favicon/apple-touch-icon.png",
        "public/favicon/site.webmanifest",
    ]

    for (const asset of requiredAssets) {
        it(`${asset} exists`, () => {
            expect(fs.existsSync(path.join(ROOT, asset))).toBe(true)
        })
    }
})

// ── Layout metadata ────────────────────────────────────────────────────────────

describe("Layout metadata", () => {
    const layoutSrc = fs.readFileSync(path.join(APP_DIR, "layout.tsx"), "utf-8")

    it("exports metadata", () => {
        expect(layoutSrc).toContain("export const metadata")
    })

    it("exports viewport config", () => {
        expect(layoutSrc).toContain("export const viewport")
    })

    it("sets a title", () => {
        expect(layoutSrc).toMatch(/title.*:/)
    })

    it("sets a description", () => {
        expect(layoutSrc).toMatch(/description\s*:/)
    })

    it("has Open Graph config", () => {
        expect(layoutSrc).toContain("openGraph")
    })

    it("has Twitter card config", () => {
        expect(layoutSrc).toContain("twitter")
    })

    it("has canonical URL", () => {
        expect(layoutSrc).toContain("alternates")
        expect(layoutSrc).toContain("canonical")
    })

    it("declares lang='en' on <html>", () => {
        expect(layoutSrc).toMatch(/lang=["']en["']/)
    })

    it("has skip-to-content link for accessibility", () => {
        expect(layoutSrc).toContain("Skip to main content")
        expect(layoutSrc).toContain("#main-content")
    })
})

// ── Robots.ts ──────────────────────────────────────────────────────────────────

describe("Robots config", () => {
    const robotsSrc = fs.readFileSync(path.join(APP_DIR, "robots.ts"), "utf-8")

    it("allows crawling of /", () => {
        expect(robotsSrc).toContain('allow')
        expect(robotsSrc).toContain('"/"')
    })

    it("blocks _next and api routes", () => {
        expect(robotsSrc).toContain('"/_next/"')
        expect(robotsSrc).toContain('"/api/"')
    })

    it("references sitemap", () => {
        expect(robotsSrc).toContain("sitemap")
    })
})

// ── Sitemap.ts ─────────────────────────────────────────────────────────────────

describe("Sitemap config", () => {
    const sitemapSrc = fs.readFileSync(path.join(APP_DIR, "sitemap.ts"), "utf-8")

    it("exports a default function", () => {
        expect(sitemapSrc).toContain("export default function sitemap")
    })

    it("includes homepage", () => {
        // The sitemap should reference the base URL (via SITE_URL or literal)
        expect(
            sitemapSrc.includes("mishalubich.com") || sitemapSrc.includes("SITE_URL")
        ).toBe(true)
    })

    it("includes blog posts", () => {
        expect(sitemapSrc).toContain("blogPosts")
    })
})

// ── JSON-LD structured data ────────────────────────────────────────────────────

describe("JSON-LD structured data", () => {
    const jsonLdPath = path.join(ROOT, "components/seo/json-ld.tsx")

    it("json-ld.tsx exists", () => {
        expect(fs.existsSync(jsonLdPath)).toBe(true)
    })

    const jsonLdSrc = fs.readFileSync(jsonLdPath, "utf-8")

    it("has Person schema", () => {
        expect(jsonLdSrc).toContain('"@type": "Person"')
    })

    it("has WebSite schema", () => {
        expect(jsonLdSrc).toContain("WebSite")
    })

    it("references the correct base URL", () => {
        // Base URL may be inline or imported via SITE_URL
        expect(
            jsonLdSrc.includes("mishalubich.com") || jsonLdSrc.includes("SITE_URL")
        ).toBe(true)
    })

    it("is imported in layout.tsx", () => {
        const layoutSrc = fs.readFileSync(path.join(APP_DIR, "layout.tsx"), "utf-8")
        expect(layoutSrc).toContain("JsonLd")
    })
})

// ── Page structure ─────────────────────────────────────────────────────────────

describe("Homepage structure", () => {
    const pageSrc = fs.readFileSync(path.join(APP_DIR, "page.tsx"), "utf-8")

    it("has a <main> landmark with role", () => {
        expect(pageSrc).toContain('role="main"')
    })

    it("has an id for skip-to-content", () => {
        expect(pageSrc).toContain('id="main-content"')
    })

    it("includes Navigation component", () => {
        expect(pageSrc).toContain("<Navigation")
    })

    it("includes Hero component", () => {
        expect(pageSrc).toContain("<Hero")
    })

    it("has sr-only SEO content section", () => {
        expect(pageSrc).toContain("sr-only")
        expect(pageSrc).toContain("Portfolio summary for search engines")
    })
})

// ── not-found.tsx ──────────────────────────────────────────────────────────────

describe("404 page", () => {
    const nfSrc = fs.readFileSync(path.join(APP_DIR, "not-found.tsx"), "utf-8")

    it("exists and exports a component", () => {
        expect(nfSrc).toContain("export default function NotFound")
    })

    it("sets noindex robots meta", () => {
        expect(nfSrc).toContain("index: false")
    })

    it("has Page Not Found title", () => {
        expect(nfSrc).toContain("Page Not Found")
    })
})

// ── error.tsx ──────────────────────────────────────────────────────────────────

describe("Error page", () => {
    const errSrc = fs.readFileSync(path.join(APP_DIR, "error.tsx"), "utf-8")

    it("is a client component", () => {
        expect(errSrc).toContain('"use client"')
    })

    it("has a reset button", () => {
        expect(errSrc).toContain("reset")
    })

    it("has a link back home", () => {
        expect(errSrc).toContain('href="/"')
    })
})
