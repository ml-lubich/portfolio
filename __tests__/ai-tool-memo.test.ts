import { describe, expect, it } from "vitest"
import { ToolMemo, toolSignature } from "@/lib/ai/tool-memo"

/**
 * Regression: asked "What has Misha built with agents?", the panel printed
 * "Pulling up projects" nine times and then gave up with
 * "I looked that up a few different ways but couldn't land on a clean answer."
 *
 * maxToolRounds caps rounds, not calls — one round can carry several — so the
 * model re-requested the same data until the budget was gone.
 */
describe("toolSignature", () => {
    it("ignores key order, so the same request has one identity", () => {
        expect(toolSignature("get_projects", { a: 1, b: 2 })).toBe(
            toolSignature("get_projects", { b: 2, a: 1 }),
        )
    })

    it("separates different arguments", () => {
        expect(toolSignature("get_projects", { tag: "agents" })).not.toBe(
            toolSignature("get_projects", { tag: "web" }),
        )
    })

    it("separates different tools with identical arguments", () => {
        expect(toolSignature("get_projects", {})).not.toBe(toolSignature("get_experience", {}))
    })

    it("treats an absent argument and an explicit undefined as the same call", () => {
        expect(toolSignature("t", { a: 1, b: undefined })).toBe(toolSignature("t", { a: 1 }))
    })

    it("handles nested objects and arrays", () => {
        expect(toolSignature("t", { x: [{ b: 1, a: 2 }] })).toBe(
            toolSignature("t", { x: [{ a: 2, b: 1 }] }),
        )
    })
})

describe("ToolMemo", () => {
    it("recalls nothing before the first call", () => {
        expect(new ToolMemo().recall("get_projects", {})).toBeNull()
    })

    it("recalls the stored result for a repeat of the same call", () => {
        const memo = new ToolMemo()
        memo.remember("get_projects", {}, '{"projects":[]}')
        expect(memo.recall("get_projects", {})).toBe('{"projects":[]}')
    })

    it("does not recall across different arguments — a real second lookup still runs", () => {
        const memo = new ToolMemo()
        memo.remember("get_projects", { tag: "agents" }, "A")
        expect(memo.recall("get_projects", { tag: "web" })).toBeNull()
    })

    it("breaks the nine-call loop: the repeat is served from memory", () => {
        const memo = new ToolMemo()
        let executions = 0
        const run = () => {
            executions++
            return '{"projects":["imsg","brain"]}'
        }

        for (let i = 0; i < 9; i++) {
            const prior = memo.recall("get_projects", {})
            if (prior === null) memo.remember("get_projects", {}, run())
        }

        expect(executions, "the tool must run once, not once per model request").toBe(1)
        expect(memo.size).toBe(1)
    })

    it("tells the model to answer rather than call again, and includes the data", () => {
        const memo = new ToolMemo()
        const notice = memo.repeatNotice("get_projects", '{"projects":[]}')
        expect(notice).toMatch(/already called get_projects/)
        expect(notice).toMatch(/instead of calling it again/)
        expect(notice, "the result must still reach the model").toContain('{"projects":[]}')
    })
})
