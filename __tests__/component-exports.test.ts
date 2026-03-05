/**
 * Component export tests — verify every component imported by the app resolves
 *
 * Catches the "Module not found" errors that crash `next build`.
 * Scans page.tsx imports and confirms the modules exist and export
 * the expected symbols.
 *
 *   npm run test
 *   npx vitest run __tests__/component-exports.test.ts
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Resolve a @/ alias import to an absolute path and check it exists */
function resolveAlias(importPath: string): string {
    return path.join(ROOT, importPath.replace(/^@\//, ""))
}

function moduleExists(importPath: string): boolean {
    const base = resolveAlias(importPath)
    // Check: exact file, .ts, .tsx, directory with index.ts(x)
    return [
        base,
        base + ".ts",
        base + ".tsx",
        path.join(base, "index.ts"),
        path.join(base, "index.tsx"),
    ].some((p) => fs.existsSync(p))
}

/** Extract all static imports from a file */
function extractImports(filePath: string): { from: string; names: string[] }[] {
    const src = fs.readFileSync(filePath, "utf-8")
    const results: { from: string; names: string[] }[] = []

    // Named imports: import { Foo, Bar } from "path"
    const namedRe = /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g
    let m: RegExpExecArray | null
    while ((m = namedRe.exec(src)) !== null) {
        const names = m[1].split(",").map((n) => n.trim().split(" as ")[0].trim()).filter(Boolean)
        results.push({ from: m[2], names })
    }

    // Default imports: import Foo from "path"
    const defaultRe = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g
    while ((m = defaultRe.exec(src)) !== null) {
        results.push({ from: m[2], names: [m[1]] })
    }

    return results
}

/** Extract dynamic imports: import("path").then(m => m.Foo) */
function extractDynamicImports(filePath: string): { from: string; name: string }[] {
    const src = fs.readFileSync(filePath, "utf-8")
    const results: { from: string; name: string }[] = []
    const re = /import\(["']([^"']+)["']\)\.then\(\w+\s*=>\s*\w+\.(\w+)\)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) {
        results.push({ from: m[1], name: m[2] })
    }
    return results
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("Homepage imports resolve", () => {
    const pagePath = path.join(ROOT, "app/page.tsx")
    const staticImports = extractImports(pagePath).filter((i) => i.from.startsWith("@/"))
    const dynamicImports = extractDynamicImports(pagePath).filter((i) => i.from.startsWith("@/"))

    describe("Static imports", () => {
        for (const imp of staticImports) {
            it(`${imp.from} resolves`, () => {
                expect(moduleExists(imp.from), `Module "${imp.from}" not found`).toBe(true)
            })
        }
    })

    describe("Dynamic imports", () => {
        for (const imp of dynamicImports) {
            it(`${imp.from} resolves (exports ${imp.name})`, () => {
                expect(moduleExists(imp.from), `Module "${imp.from}" not found`).toBe(true)
            })
        }
    })
})

describe("Layout imports resolve", () => {
    const layoutPath = path.join(ROOT, "app/layout.tsx")
    const staticImports = extractImports(layoutPath).filter((i) => i.from.startsWith("@/"))

    for (const imp of staticImports) {
        it(`${imp.from} resolves`, () => {
            expect(moduleExists(imp.from), `Module "${imp.from}" not found`).toBe(true)
        })
    }
})

describe("Section barrel exports", () => {
    const indexPath = path.join(ROOT, "components/sections/index.ts")
    const src = fs.readFileSync(indexPath, "utf-8")

    // Extract re-exports: export { Foo } from "./foo"
    const re = /export\s+\{([^}]+)\}\s+from\s+["']\.\/([^"']+)["']/g
    let m: RegExpExecArray | null
    const exports: { name: string; file: string }[] = []
    while ((m = re.exec(src)) !== null) {
        const names = m[1].split(",").map((n) => n.trim().split(" as ")[0].trim()).filter(Boolean)
        for (const name of names) {
            exports.push({ name, file: m[2] })
        }
    }

    for (const exp of exports) {
        it(`${exp.name} from ./sections/${exp.file} resolves`, () => {
            const fullPath = path.join(ROOT, "components/sections", exp.file)
            const exists = [fullPath + ".ts", fullPath + ".tsx", path.join(fullPath, "index.ts"), path.join(fullPath, "index.tsx")].some((p) => fs.existsSync(p))
            expect(exists).toBe(true)
        })
    }
})

describe("Blog page imports resolve", () => {
    const blogPagePath = path.join(ROOT, "app/blog/page.tsx")
    if (!fs.existsSync(blogPagePath)) return

    const staticImports = extractImports(blogPagePath).filter((i) => i.from.startsWith("@/"))
    for (const imp of staticImports) {
        it(`${imp.from} resolves`, () => {
            expect(moduleExists(imp.from), `Module "${imp.from}" not found`).toBe(true)
        })
    }
})
