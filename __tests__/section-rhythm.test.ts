/**
 * Section vertical-rhythm guard — app/page.tsx should use a single shared
 * `LAZY_SECTION_TOP` spacing constant for every LazySection boundary, not a
 * patchwork of one-off `mb-*`/`mt-*` overrides per section.
 */

import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const pageSrc = fs.readFileSync(path.join(__dirname, "..", "app", "page.tsx"), "utf8")

describe("section vertical rhythm", () => {
  it("defines a single LAZY_SECTION_TOP rhythm constant", () => {
    const matches = pageSrc.match(/const LAZY_SECTION_TOP\s*=/g) || []
    expect(matches.length).toBe(1)
  })

  it("LazySection wrappers carry no ad-hoc margin overrides beyond the shared rhythm", () => {
    const tags = pageSrc.match(/<LazySection\b[\s\S]*?>/g) || []
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) {
      expect(tag, `ad-hoc margin utility found in: ${tag}`).not.toMatch(/\bm[tb]-\d/)
    }
  })
})
