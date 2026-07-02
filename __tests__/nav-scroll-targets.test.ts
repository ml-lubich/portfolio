import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { navLinks } from "../components/nav/nav-links"

/* ── Nav scroll-target reachability gate ────────────────────────────────
 * Regression: the "Stats" nav link pointed at #github, but the GitHubStats
 * LazySection had no `sectionId` — so before the section lazy-mounted there
 * was no #github element AND no [data-section="github"] wrapper in the DOM,
 * and navigateTo() had nothing to scroll to. The link looked dead.
 *
 * Contract: EVERY in-page anchor used anywhere in the app (nav links,
 * navigateTo() calls, plain href="#...") must be reachable BEFORE lazy
 * sections mount — either via `sectionId="<id>"` on a LazySection in
 * app/page.tsx (which renders an always-present [data-section] wrapper),
 * or by living on an always-mounted element (whitelist below).
 * ─────────────────────────────────────────────────────────────────────── */

const ROOT = path.resolve(__dirname, "..")

// Ids on elements that render eagerly (never inside a LazySection).
const ALWAYS_MOUNTED = new Set(["hero", "main-content"])

function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) return walk(full)
        return /\.(tsx|ts)$/.test(entry.name) ? [full] : []
    })
}

function collectAnchors(): string[] {
    const files = [...walk(path.join(ROOT, "components")), ...walk(path.join(ROOT, "app"))]
        .filter((f) => !f.startsWith(path.join(ROOT, "app", "demo") + path.sep))
    const ids = new Set<string>()
    for (const file of files) {
        const src = fs.readFileSync(file, "utf8")
        for (const m of src.matchAll(/(?:navigateTo\(|href[=:]\s*)["'`]#([a-z][a-z0-9-]*)["'`]/g)) {
            ids.add(m[1])
        }
    }
    for (const link of navLinks) {
        if (link.href.startsWith("#")) ids.add(link.href.slice(1))
    }
    return [...ids].sort()
}

const pageSrc = fs.readFileSync(path.join(ROOT, "app", "page.tsx"), "utf8")
const lazySectionIds = new Set(
    [...pageSrc.matchAll(/sectionId="([a-z][a-z0-9-]*)"/g)].map((m) => m[1])
)

describe("nav scroll targets are reachable before lazy mount", () => {
    it.each(collectAnchors())(
        'anchor "#%s" has a sectionId placeholder in app/page.tsx (or is always mounted)',
        (id) => {
            expect(
                ALWAYS_MOUNTED.has(id) || lazySectionIds.has(id),
                `"#${id}" is used as a scroll target but app/page.tsx has no LazySection sectionId="${id}" ` +
                    `and it is not on the always-mounted whitelist — clicking a link to it does nothing ` +
                    `until the user happens to scroll near the section. Add sectionId="${id}" to its LazySection.`
            ).toBe(true)
        }
    )
})
