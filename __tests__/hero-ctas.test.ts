/**
 * Hero CTA row — hierarchy, icons, shape, keyboard parity.
 *
 * The row used to be five equal-height `rounded-xl` boxes (one white, four
 * ghost) with two of them sharing the same sparkles icon, so it read as a
 * toolbar rather than a hero: no weight beyond "one is white", nothing to
 * tell the resume link from the expertise link at a glance. These are source
 * assertions on `components/hero/hero-actions.tsx` that pin the redesign:
 * one primary, one secondary, quiet tertiaries; every icon unique; one radius
 * language (the nav's pill); and every hover treatment mirrored on
 * focus-visible.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const src = fs.readFileSync(
  path.resolve(__dirname, "../components/hero/hero-actions.tsx"),
  "utf8"
)

/** Class-list constants (`const PILL = "…"` / template literals) with `${PILL}` inlined. */
const consts: Record<string, string> = {}
for (const m of src.matchAll(/const ([A-Z_]+) =\s*(?:"([^"]*)"|`([^`]*)`)/g)) {
  consts[m[1]] = (m[2] ?? m[3]).replace(/\$\{(\w+)\}/g, (_, k) => consts[k] ?? "")
}
/** Every class list in the file: inline `className="…"` plus the constants. */
const classStrings = [
  ...[...src.matchAll(/className="([^"]*)"/g)].map((m) => m[1]),
  ...Object.values(consts),
]
/** Class list of the element carrying `data-weight="<w>"`. */
const classesOf = (w: string) => {
  const m = src.match(new RegExp(`data-weight="${w}"[\\s\\S]{0,200}?className=(?:"([^"]*)"|\\{(\\w+)\\})`))
  return m?.[1] ?? consts[m?.[2] ?? ""] ?? ""
}

describe("Hero CTAs — hierarchy", () => {
  it("has exactly one primary, one secondary and three tertiary actions", () => {
    const weight = (w: string) => src.match(new RegExp(`data-weight="${w}"`, "g"))?.length ?? 0
    expect(weight("primary")).toBe(1)
    expect(weight("secondary")).toBe(1)
    expect(weight("tertiary")).toBe(3)
  })

  it("primary is the contact CTA, secondary is MLBot — the site's signature", () => {
    expect(src).toMatch(/data-weight="primary"[\s\S]{0,600}?Get In Touch/)
    expect(src).toMatch(/data-weight="secondary"[\s\S]{0,600}?Ask MLBot/)
    // Existing mechanisms are kept.
    expect(src).toContain('navigateTo("#contact")')
    expect(src).toContain('new Event("mlbot:open")')
  })

  it("primary uses the theme-aware white/background pair, never text-black", () => {
    const primary = classesOf("primary")
    expect(primary).toContain("bg-white")
    expect(primary).toContain("text-background")
    expect(src).not.toContain("text-black")
    expect(src).not.toContain("hsl(217 100% 68%)")
  })
})

describe("Hero CTAs — icons", () => {
  it("no two actions share an icon", () => {
    const used = [...src.matchAll(/<([A-Z][A-Za-z]+)\s+(?:className|aria-hidden)/g)].map((m) => m[1])
    const icons = used.filter((n) => n !== "SocialIcons")
    expect(new Set(icons).size).toBe(icons.length)
  })

  it("the resume link carries a download icon, not sparkles", () => {
    expect(src).toMatch(/download=[\s\S]{0,400}?<FileDown/)
  })
})

describe("Hero CTAs — shape and motion", () => {
  it("speaks the nav's pill language: rounded-full, no rounded-xl, no glass-btn", () => {
    for (const c of classStrings) {
      expect(c).not.toContain("rounded-xl")
      expect(c).not.toContain("glass-btn")
    }
    expect(classesOf("primary")).toContain("rounded-full")
    expect(classesOf("secondary")).toContain("rounded-full")
  })

  it("every hover utility has the same focus-visible twin (keyboard parity)", () => {
    const hovers = classStrings.flatMap((c) => c.match(/(?<![\w:-])hover:[^\s"]+/g) ?? [])
    expect(hovers.length).toBeGreaterThan(0)
    for (const c of classStrings) {
      for (const h of c.match(/(?<![\w:-])hover:[^\s"]+/g) ?? []) {
        expect(c, `${h} needs focus-visible:${h.slice(6)}`).toContain(`focus-visible:${h.slice(6)}`)
      }
    }
  })

  it("no JS timers — reduced motion is handled by the global CSS", () => {
    expect(src).not.toMatch(/setTimeout|setInterval/)
  })

  it("keeps the entrance beats from the ladder", () => {
    expect(src).toContain('animationDelay: heroBeatDelay("ctas")')
    expect(src).toContain('animationDelay: heroBeatDelay("social")')
  })
})
