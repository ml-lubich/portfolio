/**
 * LogoScroll is a hand-rolled drag scroller: every gesture starts as a
 * potential drag, and `isDragGesture` is the single place that decides
 * whether accumulated pointer travel makes it one. `onPointerMove` uses it to
 * decide when to acquire pointer capture, and `onClickCapture` uses the same
 * check to swallow the click that ends a real drag. One function, two
 * callers — keeping it pure and exported lets both be tested without a DOM.
 */

import { describe, it, expect } from "vitest"
import { DRAG_SLOP, isDragGesture } from "@/components/sections/logo-scroll"

describe("LogoScroll isDragGesture", () => {
  it("does not count a stationary tap as a drag", () => {
    expect(isDragGesture(0)).toBe(false)
  })

  it("does not count jitter under the slop threshold as a drag", () => {
    expect(isDragGesture(DRAG_SLOP - 1)).toBe(false)
  })

  it("does not count travel exactly at the slop threshold as a drag", () => {
    expect(isDragGesture(DRAG_SLOP)).toBe(false)
  })

  it("counts travel past the slop threshold as a drag", () => {
    expect(isDragGesture(DRAG_SLOP + 1)).toBe(true)
  })
})
