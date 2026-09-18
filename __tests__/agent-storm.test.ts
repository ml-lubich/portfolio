import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { AGENT_STORM_EVENT, STORM_AGENT_COUNT, STORM_TRIGGER, isAgentStormAsk, stormQueue } from "@/lib/agents-build"

const read = (p: string) => readFileSync(p, "utf8")

describe("agent storm", () => {
    it("recognises the MLBot ask and nothing else", () => {
        for (const ok of ["agent storm", "Agent Storm!", "  agent-storm  ", "unleash an agent storm", "run agent storm."]) {
            expect(isAgentStormAsk(ok), ok).toBe(true)
        }
        for (const no of ["agents", "storm", "what is an agent storm?", "tell me about agent storms", "agent storm please"]) {
            expect(isAgentStormAsk(no), no).toBe(false)
        }
    })

    it("builds a full fleet with unique ids inside the safe viewport band, deterministically", () => {
        const q = stormQueue(7)
        expect(q.length).toBe(STORM_AGENT_COUNT)
        expect(new Set(q.map((p) => p.id)).size).toBe(q.length)
        expect(q.every((p) => p.x >= 8 && p.x <= 92 && p.y >= 14 && p.y <= 84)).toBe(true)
        expect(stormQueue(7)).toEqual(q)
        expect(stormQueue(8)).not.toEqual(q)
    })

    it("is wired: MLBot dispatches the event, the egg listens, and the keyword typed anywhere works too", () => {
        const bot = read("components/ai-chat/mlbot.tsx")
        expect(bot).toContain("isAgentStormAsk(question)")
        expect(bot).toContain("new CustomEvent(AGENT_STORM_EVENT)")
        const egg = read("components/easter/agents-build.tsx")
        expect(egg).toContain("addEventListener(AGENT_STORM_EVENT")
        expect(egg).toContain('start("storm")')
        expect(STORM_TRIGGER).toBe("storm")
        expect(AGENT_STORM_EVENT).toMatch(/agent-storm/)
        expect(read("app/globals.css")).toContain(".agents-egg-cursor--storm")
    })
})
