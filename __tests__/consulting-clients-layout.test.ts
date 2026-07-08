/**
 * Regression: consulting client cards wrap with the leftover card(s) on the
 * last row centered — no lone left-aligned orphan under a 3-column grid.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

const ROOT = path.resolve(__dirname, "..")

describe("ConsultingClients layout", () => {
  const src = fs.readFileSync(
    path.join(ROOT, "components/sections/consulting-clients.tsx"),
    "utf8",
  )

  it("card list is a wrapping flex row that centers the last row", () => {
    const ulMatch = src.match(/<ul className="([^"]*)">/)
    expect(ulMatch, "client <ul> must have a className").toBeTruthy()
    const cls = ulMatch![1]
    expect(cls).toContain("flex")
    expect(cls).toContain("flex-wrap")
    expect(cls).toContain("justify-center")
    // The old strict grid left the 4th card orphaned at the left
    expect(cls).not.toContain("grid-cols-3")
  })

  it("cards keep responsive widths that account for the flex gaps", () => {
    expect(src).toContain("sm:w-[calc(50%-0.5rem)]")
    expect(src).toContain("md:w-[calc(50%-0.75rem)]")
    expect(src).toContain("lg:w-[calc(33.333%-1rem)]")
  })

  it("cover images fall back to the styled placeholder on load error (no broken-image icon)", () => {
    // A failed cover must flip hasCover so the "Preview unavailable" slot renders
    expect(src).toMatch(/onError=\{/)
    expect(src).toMatch(/failedCovers/)
    expect(src).toContain("Preview unavailable")
  })

  it("impact highlights render as chips when a client has them", () => {
    expect(src).toMatch(/client\.impact/)
  })
})

describe("ConsultingClients impact data", () => {
  it("ERIA lists offsites for Anthropic, Google & J&J and the Forbes feature", async () => {
    const { consultingClients } = await import("@/data/consulting-clients")
    const eria = consultingClients.find((c) => c.id === "eria")
    expect(eria).toBeTruthy()
    const impact = (eria!.impact ?? []).join(" ")
    expect(impact).toContain("Anthropic")
    expect(impact).toContain("Google")
    expect(impact).toContain("J&J")
    expect(impact).toContain("Forbes")
    // The card itself links these highlights to the live eria.co site
    expect(eria!.href).toContain("eria.co")
  })
})
