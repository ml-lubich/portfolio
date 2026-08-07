/**
 * The consulting clients rail is a drag-scrollable, self-drifting carousel of
 * flip cards. These guards cover the pieces that have regressed before: the
 * fixed card width inside the track, the pause/drag controls, the cover-image
 * fallback, and the engagement detail on each card's back face.
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

  it("clients render inside a continuously drifting carousel track", () => {
    expect(src).toContain("client-carousel")
    expect(src).toContain("client-carousel-track")
    // The rail repeats the card set so the wrap point is never on screen; the
    // copies are hidden from assistive tech and from keyboard focus.
    expect(src).toMatch(/RAIL_COPIES/)
    expect(src).toMatch(/aria-hidden=\{copy > 0/)
    expect(src).toMatch(/inert/)
  })

  it("cards are fixed-width and never shrink inside the track", () => {
    expect(src).toMatch(/w-\[320px\][^"]*shrink-0/)
  })

  it("the rail is drag-scrollable, and a drag never fires the card underneath", () => {
    expect(src).toMatch(/onPointerDown=\{onPointerDown\}/)
    expect(src).toMatch(/onPointerMove=\{onPointerMove\}/)
    expect(src).toMatch(/onClickCapture=\{onClickCapture\}/)
    expect(src).toMatch(/DRAG_SLOP/)
    expect(src).toMatch(/dragDistRef\.current > DRAG_SLOP/)
  })

  it("carousel has a play/pause toggle and reports its drift state", () => {
    expect(src).toContain("carouselPaused")
    expect(src).toMatch(/aria-pressed=\{carouselPaused\}/)
    expect(src).toMatch(/data-paused=\{drifting/)
  })

  it("drift stops for reduced motion and while a card is flipped open", () => {
    expect(src).toMatch(/prefers-reduced-motion: reduce/)
    expect(src).toMatch(
      /const drifting = !carouselPaused && flippedId === null && !reducedMotion/,
    )
  })

  it("the rail is full-bleed — it is not nested inside the section's max-w container", () => {
    // The header block closes before the rail opens, so the cards run edge to edge.
    const railIndex = src.indexOf('className="client-carousel')
    const containerIndex = src.indexOf('className="relative mx-auto max-w-6xl')
    expect(containerIndex).toBeGreaterThan(-1)
    expect(railIndex).toBeGreaterThan(containerIndex)
    expect(src.slice(containerIndex, railIndex)).toContain("Full-bleed rail")
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

  it("each card flips to an engagement brief listing what was built", () => {
    expect(src).toMatch(/flippedId/)
    expect(src).toMatch(/rotateY\(180deg\)/)
    expect(src).toMatch(/backface-visibility/)
    expect(src).toMatch(/client\.deliverables\.map/)
    expect(src).toContain("What I built")
  })
})

describe("ConsultingClients data", () => {
  it("every client carries a sector, deliverables, and impact highlights", async () => {
    const { consultingClients } = await import("@/data/consulting-clients")
    expect(consultingClients.length).toBeGreaterThan(0)
    for (const client of consultingClients) {
      expect(client.sector, `${client.id} missing sector`).toBeTruthy()
      expect(client.deliverables.length, `${client.id} missing deliverables`).toBeGreaterThan(0)
      expect((client.impact ?? []).length, `${client.id} missing impact`).toBeGreaterThan(0)
    }
  })

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
