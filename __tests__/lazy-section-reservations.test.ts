/**
 * Every LazySection in app/page.tsx must reserve close to its real height,
 * per viewport, before it mounts.
 *
 * Bug: the wrapper used one `min(38dvh, 320px)` floor for every section while
 * the real sections run 660–3500px. Each mount grew the document by the
 * difference (+16k px desktop, +24k px mobile in total). Chrome's scroll
 * anchoring hides most of that; Safari has none, so on an iPhone the page
 * visibly walks down under the reader ("we keep getting scrolled down").
 */

import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (p: string) => fs.readFileSync(path.join(__dirname, "..", p), "utf8")
const pageSrc = read("app/page.tsx")
const tags = pageSrc.match(/<LazySection\b[\s\S]*?>/g) || []

describe("lazy section height reservations", () => {
  it("finds the lazy sections", () => {
    expect(tags.length).toBeGreaterThanOrEqual(10)
  })

  it.each(tags)("%s reserves an explicit mobile and desktop floor", (tag) => {
    // Literal utilities, not template strings: Tailwind's content scanner
    // only emits an arbitrary value it can see verbatim in the source.
    const mobile = /(?:^|[\s"'`])min-h-\[(\d+)px\]/.exec(tag)
    const desktop = /\bmd:min-h-\[(\d+)px\]/.exec(tag)
    expect(mobile, "mobile floor `min-h-[Npx]`").not.toBeNull()
    expect(desktop, "desktop floor `md:min-h-[Npx]`").not.toBeNull()
    // Every real section is far taller than the old 320px catch-all.
    expect(Number(mobile![1])).toBeGreaterThanOrEqual(500)
    expect(Number(desktop![1])).toBeGreaterThanOrEqual(500)
    // An inline minHeight would override the responsive classes.
    expect(tag).not.toMatch(/\bminHeight=/)
  })

  it("LazySection has no one-size-fits-all floor of its own", () => {
    const src = read("components/layout/lazy-section.tsx")
    expect(src).not.toMatch(/38dvh|minHeight/)
  })
})
