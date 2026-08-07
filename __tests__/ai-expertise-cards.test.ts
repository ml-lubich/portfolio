/**
 * The four AI domains render as a rotating 3D ring, not a stack of cards.
 * Four full-height cards cost four screens of scroll and read as a flat list;
 * the ring shows one panel at a time over a vertex mesh matching the hero
 * brain's wireframe.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

describe("AI Expertise domain ring", () => {
  const file = path.resolve(__dirname, "../components/sections/ai-expertise.tsx")
  const content = fs.readFileSync(file, "utf-8")

  it("suspends the domain panels on a real 3D ring", () => {
    expect(content).toContain("DomainRing")
    expect(content).toMatch(/transformStyle:\s*"preserve-3d"/)
    expect(content).toMatch(/perspective:\s*"1800px"/)
    // One rotateY step per panel, pushed out along Z by the ring radius
    expect(content).toMatch(/rotateY\(\$\{i \* step\}deg\) translateZ\(\$\{radius\}px\)/)
  })

  it("sizes the ring radius from the panel width so neighbours never clip through", () => {
    expect(content).toMatch(/Math\.tan\(Math\.PI \/ count\)/)
    expect(content).toContain("ResizeObserver")
    expect(content).toContain("RING_PADDING")
  })

  it("keeps off-axis panels out of the a11y tree and the tab order", () => {
    expect(content).toMatch(/aria-hidden=\{!isActive/)
    expect(content).toMatch(/inert/)
    expect(content).toMatch(/pointer-events-none/)
  })

  it("is navigable by prev/next and by direct position", () => {
    expect(content).toMatch(/aria-label="Previous AI domain"/)
    expect(content).toMatch(/aria-label="Next AI domain"/)
    expect(content).toMatch(/aria-current=\{i === activeSlot\}/)
    expect(content).toMatch(/onClick=\{\(\) => go\(i - activeSlot\)\}/)
  })

  it("advancing past the last panel keeps spinning forward instead of unwinding", () => {
    // index is unbounded; the active slot is derived modulo the panel count
    expect(content).toMatch(/const activeSlot = \(\(index % count\) \+ count\) % count/)
  })

  it("floats the ring over an animated vertex mesh, deterministic for SSR", () => {
    expect(content).toContain("RingMesh")
    expect(content).toMatch(/<animate/)
    // Mesh geometry is derived arithmetically, never from Math.random()
    const mesh = content.slice(content.indexOf("function RingMesh"), content.indexOf("function DomainRing"))
    expect(mesh).not.toMatch(/Math\.random/)
  })

  it("keeps the high-contrast detail rows the cards introduced", () => {
    expect(content).toContain("bg-secondary/40")
    expect(content).toContain("border-primary/15")
    expect(content).toContain("text-primary")
  })
})
