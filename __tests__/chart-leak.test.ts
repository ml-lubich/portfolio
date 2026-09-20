import { describe, expect, it } from "vitest"

import { isChartToolPayload, stripToolChartLeaks } from "@/lib/ai/chart-leak"

describe("isChartToolPayload", () => {
  it("recognises kind-based ChartSpec", () => {
    expect(isChartToolPayload({ kind: "bar", title: "Skills", data: [{ label: "Python", value: 97 }] })).toBe(true)
  })

  it("recognises wrapped tool results", () => {
    expect(isChartToolPayload({ chart: { kind: "bar", data: [] } })).toBe(true)
  })
})

describe("stripToolChartLeaks", () => {
  it("drops bare kind-based chart JSON", () => {
    const bar = '{"kind":"bar","title":"Skill proficiency","data":[{"label":"Python","value":97}]}'
    expect(stripToolChartLeaks(`Stats:\n\n${bar}`)).toBe("Stats:")
  })
})
