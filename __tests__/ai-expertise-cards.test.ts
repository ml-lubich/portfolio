/**
 * The AI domains render as a wide 3D arch, not a closed ring and not a stack
 * of cards. A 360° ring put neighbours edge-on at ±90°, so the section read as
 * one panel folding into itself; the arch fans them sideways past both edges
 * of the viewport over a vertex mesh matching the hero brain's wireframe.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

describe("AI Expertise domain arch", () => {
  const file = path.resolve(__dirname, "../components/sections/ai-expertise.tsx")
  const content = fs.readFileSync(file, "utf-8")

  it("fans the domain panels across a real 3D arch", () => {
    expect(content).toContain("DomainArch")
    expect(content).toMatch(/transformStyle:\s*"preserve-3d"/)
    expect(content).toMatch(/perspective:\s*"1800px"/)
    // Each slot slides sideways, yaws inward and drops back in Z
    expect(content).toMatch(/translateX\(calc\(-50% \+ \$\{off \* ARCH\.spread/)
    expect(content).toMatch(/translateZ\(\$\{-dist \* ARCH\.depth\}px\)/)
    expect(content).toMatch(/rotateY\(\$\{-off \* ARCH\.tilt\}deg\)/)
  })

  it("reads as a bird's-eye arch: centre nearest, sides receding into the page", () => {
    // Distance shows as height, shrink, defocus — not as panels turning away,
    // so every card keeps facing the viewer.
    expect(content).toMatch(/translateY\(\$\{-dist \* ARCH\.rise\}px\)/)
    expect(content).toMatch(/scale\(\$\{1 - dist \* ARCH\.shrink\}\)/)
    expect(content).toMatch(/blur\(\$\{dist \* ARCH\.blur\}px\)/)
    const arch = content.slice(content.indexOf("const ARCH"), content.indexOf("function archOffset"))
    expect(Number(arch.match(/tilt:\s*([\d.]+)/)?.[1])).toBeLessThanOrEqual(20)
    expect(Number(arch.match(/depth:\s*([\d.]+)/)?.[1])).toBeGreaterThanOrEqual(200)
  })

  it("never folds into itself — no closed ring geometry", () => {
    expect(content).not.toContain("RING_PADDING")
    expect(content).not.toMatch(/Math\.tan\(Math\.PI \/ count\)/)
  })

  it("bleeds edge to edge instead of sitting inside the content column", () => {
    expect(content).toMatch(/left-1\/2 w-screen -translate-x-1\/2/)
  })

  it("offsets wrap by the shortest signed distance from the active slot", () => {
    expect(content).toContain("function archOffset")
    expect(content).toMatch(/if \(off > count \/ 2\) off -= count/)
  })

  it("keeps off-axis panels out of the a11y tree and the tab order", () => {
    expect(content).toMatch(/aria-hidden=\{!isActive/)
    expect(content).toMatch(/inert/)
    expect(content).toMatch(/pointer-events-none/)
  })

  it("stops painting panels once they are past the arch's visible span", () => {
    expect(content).toMatch(/dist > ARCH\.visible/)
    expect(content).toMatch(/visibility: offstage \? "hidden" : "visible"/)
  })

  it("is navigable by prev/next and by direct position", () => {
    expect(content).toMatch(/aria-label="Previous AI domain"/)
    expect(content).toMatch(/aria-label="Next AI domain"/)
    expect(content).toMatch(/aria-current=\{i === activeSlot\}/)
    expect(content).toMatch(/onClick=\{\(\) => go\(i - activeSlot\)\}/)
  })

  it("advancing past the last panel keeps going instead of unwinding", () => {
    // index is unbounded; the active slot is derived modulo the panel count
    expect(content).toMatch(/const activeSlot = \(\(index % count\) \+ count\) % count/)
  })

  it("carries enough domains for the arch to read as an arch", () => {
    const block = content.slice(content.indexOf("const aiDomains"), content.indexOf("const metrics"))
    expect(block.match(/^ {2}\{$/gm)?.length ?? 0).toBeGreaterThanOrEqual(6)
  })

  it("floats the arch over an animated vertex mesh, deterministic for SSR", () => {
    expect(content).toContain("RingMesh")
    expect(content).toMatch(/<animate/)
    // Mesh geometry is derived arithmetically, never from Math.random()
    const mesh = content.slice(content.indexOf("function RingMesh"), content.indexOf("function DomainArch"))
    expect(mesh).not.toMatch(/Math\.random/)
  })

  it("keeps the high-contrast detail rows the cards introduced", () => {
    expect(content).toContain("bg-secondary/40")
    expect(content).toContain("border-primary/15")
    expect(content).toContain("text-primary")
  })
})
