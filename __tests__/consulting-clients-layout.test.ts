/**
 * Regression: consulting clients render as a continuously scrolling marquee
 * carousel with a play/pause toggle, keyboard-safe pausing, and a graceful
 * cover-image fallback. Impact highlights surface as chips (ERIA press/logos).
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
    expect(css).toMatch(/\.client-carousel\[data-paused="true"\][\s\S]{0,120}animation-play-state:\s*paused/)
    expect(css).toMatch(/\.client-carousel:focus-within[\s\S]{0,120}animation-play-state:\s*paused/)
  })

  it("cover images retry unoptimized then fall back to the styled placeholder", () => {
    // A failed cover retries once unoptimized (raw file URL, dodges a poisoned
    // optimizer cache entry), then flips hasCover so "Preview unavailable" renders
    expect(src).toMatch(/onError=\{/)
    expect(src).toMatch(/coverErrorCounts/)
    expect(src).toMatch(/unoptimized=\{coverErrors > 0\}/)
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
