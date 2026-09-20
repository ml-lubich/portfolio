import { describe, expect, it, vi } from "vitest"

import { renderMermaidInto } from "@/lib/ai/mermaid-diagram"

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: "<svg/>" }),
  },
}))

describe("renderMermaidInto", () => {
  it("writes svg into the host on success", async () => {
    const host = { innerHTML: "" } as HTMLElement
    await expect(renderMermaidInto(host, "mlbot-id", "graph TD\n  A --> B")).resolves.toBe(true)
    expect(host.innerHTML).toBe("<svg/>")
  })
})
