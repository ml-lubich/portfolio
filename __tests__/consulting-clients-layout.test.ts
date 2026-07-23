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

  it("clients render inside a continuously scrolling carousel track", () => {
    expect(src).toContain("client-carousel")
    expect(src).toContain("client-carousel-track")
    // Marquee needs the card set duplicated for a seamless loop; the copy is
    // hidden from assistive tech and keyboard focus
    expect(src).toMatch(/aria-hidden[\s\S]{0,40}inert/)
  })

  it("cards are fixed-width and never shrink inside the track", () => {
    expect(src).toMatch(/w-\[320px\][^"]*shrink-0/)
  })

  it("carousel has a play/pause toggle", () => {
    expect(src).toContain("carouselPaused")
    expect(src).toMatch(/aria-pressed=\{carouselPaused\}/)
    expect(src).toMatch(/data-paused=\{carouselPaused/)
  })

  it("marquee animation is infinite, pausable, and keyboard-safe (CSS)", () => {
    const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
    expect(css).toContain("@keyframes client-carousel-scroll")
    const track = css.match(/\.client-carousel-track \{[\s\S]*?\n\}/)?.[0] ?? ""
    expect(track).toMatch(/animation:[^;]*linear infinite/)
    // Pause when toggled off and while keyboard focus is inside the carousel
    // (the two selectors share one rule, so allow for the grouped-selector gap)
    expect(css).toMatch(/\.client-carousel\[data-paused="true"\][\s\S]{0,160}animation-play-state:\s*paused/)
    expect(css).toMatch(/\.client-carousel:focus-within[\s\S]{0,160}animation-play-state:\s*paused/)
  })

  it("cover images fall back to the styled placeholder on load error (no broken-image icon)", () => {
    // A failed cover remounts once (changing key) to refetch a transient error,
    // then flips hasCover so the "Preview unavailable" slot renders
    expect(src).toMatch(/onError=\{/)
    expect(src).toMatch(/coverErrorCounts/)
    expect(src).toMatch(/key=\{`\$\{client\.id\}-cover-\$\{coverErrors\}`\}/)
    expect(src).toMatch(/coverErrors < 2/)
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

describe("ClientTestimonials continuous proof rail", () => {
  const src = fs.readFileSync(
    path.join(ROOT, "components/sections/client-testimonials.tsx"),
    "utf8",
  )

  it("uses the shared continuous marquee with a pause control and hidden duplicate", () => {
    expect(src).toContain("client-carousel")
    expect(src).toContain("client-carousel-track")
    expect(src).toMatch(/data-paused=\{paused/)
    expect(src).toMatch(/aria-hidden="true"[\s\S]{0,80}inert/)
  })
})
