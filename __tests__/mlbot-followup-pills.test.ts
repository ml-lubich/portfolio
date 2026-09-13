import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { splitFollowup, clampFollowup, parseFollowups } from "@/lib/ai/followups"

/* A follow-up is a PAIR: a short label for the pill, and the full, well-formed
 * question that is actually asked. The wire format keeps both in the one
 * string the server already sends — `Short label :: Full question?` — so an
 * older server that sends a bare question still works. */

const source = readFileSync(join(process.cwd(), "components/ai-chat/mlbot.tsx"), "utf8")

describe("splitFollowup", () => {
    it("splits `label :: question` into the pill label and the sent question", () => {
        expect(splitFollowup("MCP architecture :: How is AigisQuery's MCP server laid out?")).toEqual({
            label: "MCP architecture",
            question: "How is AigisQuery's MCP server laid out?",
        })
    })

    it("falls back to the same text for both when there is no separator", () => {
        expect(splitFollowup("Where has he worked?")).toEqual({
            label: "Where has he worked?",
            question: "Where has he worked?",
        })
    })

    it("keeps a question containing a colon intact", () => {
        expect(splitFollowup("Stack :: What runs where: edge or node?")).toEqual({
            label: "Stack",
            question: "What runs where: edge or node?",
        })
    })

    it("uses the surviving half when one side is empty", () => {
        expect(splitFollowup(":: Only the question?")).toEqual({
            label: "Only the question?",
            question: "Only the question?",
        })
        expect(splitFollowup("Only a label ::")).toEqual({
            label: "Only a label",
            question: "Only a label",
        })
    })

    it("survives the pipe-splitting the server already does", () => {
        const parsed = parseFollowups("Agents :: What agents has he shipped? | Papers :: What has he published?")
        expect(parsed.map(splitFollowup)).toEqual([
            { label: "Agents", question: "What agents has he shipped?" },
            { label: "Papers", question: "What has he published?" },
        ])
    })

    it("still clamps an over-long label without touching the question", () => {
        const raw = "A label that runs on well past the pill width budget for one line :: Q?"
        const { label, question } = splitFollowup(raw)
        expect(question).toBe("Q?")
        expect(clampFollowup(label).endsWith("…")).toBe(true)
    })
})

describe("MLBot follow-up pills send the full question", () => {
    const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 1400)

    it("sends the question, not the label", () => {
        expect(pills).toMatch(/send\(q\.question\)/)
    })

    it("shows the short label on the pill", () => {
        expect(pills).toMatch(/clampFollowup\(q\.label\)/)
    })

    it("keeps the pills mounted but disabled while a reply streams, rather than hiding them", () => {
        expect(pills).toMatch(/disabled=\{busy\}/)
    })
})
