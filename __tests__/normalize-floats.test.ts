import { describe, it, expect } from "vitest"
import { normalizeFloats } from "./helpers/normalize-floats"

const base = '<line x2="76.6295824562643" stroke-width="0.33119999999999994" class="a"/>text'

describe("normalizeFloats", () => {
  it("rounds long floats to 3 decimals", () => {
    expect(normalizeFloats(base)).toBe('<line x2="76.630" stroke-width="0.331" class="a"/>text')
  })
  it("ignores 1e-10 float drift", () => {
    const drifted = base.replace("76.6295824562643", "76.6295824563643").replace("0.33119999999999994", "0.3312000000999999")
    expect(normalizeFloats(drifted)).toBe(normalizeFloats(base))
  })
  it("still detects class, attribute and text changes", () => {
    expect(normalizeFloats(base.replace('class="a"', 'class="b"'))).not.toBe(normalizeFloats(base))
    expect(normalizeFloats(base.replace("<line", '<line data-x="1"'))).not.toBe(normalizeFloats(base))
    expect(normalizeFloats(base.replace("text", "tex"))).not.toBe(normalizeFloats(base))
  })
  it("leaves short numbers and ids untouched", () => {
    expect(normalizeFloats('<svg viewBox="0 0 100 100" r="1.5" id="v1.2.3">')).toBe('<svg viewBox="0 0 100 100" r="1.5" id="v1.2.3">')
  })
})
