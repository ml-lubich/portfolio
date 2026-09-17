import { describe, it, expect } from "vitest"
import { isMermaidDsl } from "@/lib/ai/mermaid-dsl"

describe("isMermaidDsl", () => {
    it("accepts graph and flowchart headers", () => {
        expect(isMermaidDsl("graph TD\n  A --> B")).toBe(true)
        expect(isMermaidDsl("flowchart LR\n  A --> B")).toBe(true)
    })

    it("rejects BlogChart JSON", () => {
        expect(isMermaidDsl('{"type":"pipeline","steps":[]}')).toBe(false)
    })

    it("rejects empty bodies", () => {
        expect(isMermaidDsl("   ")).toBe(false)
    })
})
