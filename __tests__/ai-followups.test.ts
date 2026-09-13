import { describe, it, expect } from "vitest"
import { FollowupStream, parseFollowups, clampFollowup, FOLLOWUP_LIMITS } from "@/lib/ai/followups"

/** Feeds a full reply through the filter one chunk at a time, as SSE would. */
function stream(chunks: string[]) {
    const f = new FollowupStream()
    let visible = ""
    for (const c of chunks) visible += f.push(c)
    const { tail, followups } = f.finish()
    return { visible: visible + tail, followups }
}

describe("parseFollowups", () => {
    it("splits on pipes and trims", () => {
        expect(parseFollowups(" What next? | And then? ")).toEqual(["What next?", "And then?"])
    })

    it("caps the count regardless of what the model returns", () => {
        const raw = Array.from({ length: 10 }, (_, i) => `q${i}?`).join(" | ")
        expect(parseFollowups(raw)).toHaveLength(FOLLOWUP_LIMITS.max)
    })

    /* Tapping a pill sends the pill's value. Clamping the value here meant the
     * model's "How does the Case Triage Agent's evidence gates decide…" was
     * sent as the fragment "How does the Case Triage Agent's evidence gates…".
     * The value stays whole; only the LABEL is shortened (clampFollowup). */
    it("keeps a long follow-up whole so the full question is what gets sent", () => {
        const long = "How does the Case Triage Agent's evidence gates decide which findings are strong enough to escalate"
        const [only] = parseFollowups(long)
        expect(only).toBe(long)
        expect(only.endsWith("escalate")).toBe(true)
        expect(only).not.toContain("…")
    })

    it("survives the SSE round-trip un-truncated", () => {
        const long = "How does the Case Triage Agent's evidence gates decide which findings are strong enough to escalate"
        const { followups } = stream(["Answer.\n\nFOLLOW", "UPS: ", long, " | Short one?"])
        expect(followups[0]).toBe(long)
    })

    it("strips list numbering the model adds anyway", () => {
        expect(parseFollowups("1. First? | - Second? | * Third?")).toEqual(["First?", "Second?", "Third?"])
    })

    it("collapses newlines so a suggestion cannot break the chip layout", () => {
        expect(parseFollowups("multi\n\nline?  |  ok?")).toEqual(["multi line?", "ok?"])
    })

    it("returns nothing for empty or whitespace-only input", () => {
        expect(parseFollowups("")).toEqual([])
        expect(parseFollowups("   |  | ")).toEqual([])
    })
})

describe("clampFollowup (display only)", () => {
    it("shortens a label to maxChars on a word boundary with an ellipsis", () => {
        const label = clampFollowup("How does the Case Triage Agent's evidence gates decide which findings escalate")
        expect(label.length).toBeLessThanOrEqual(FOLLOWUP_LIMITS.maxChars + 1)
        expect(label).toMatch(/[a-z]…$/)
        expect(label).not.toMatch(/ …$/)
    })

    it("leaves a short label alone", () => {
        expect(clampFollowup("Where has he worked?")).toBe("Where has he worked?")
    })
})

describe("FollowupStream never leaks the marker", () => {
    it("hides the marker line from the visible answer", () => {
        const { visible, followups } = stream(["He shipped X. ", "FOLLOWUPS: A? | B?"])
        expect(visible).not.toContain("FOLLOWUPS")
        expect(visible.trim()).toBe("He shipped X.")
        expect(followups).toEqual(["A?", "B?"])
    })

    it("handles a marker split across delta boundaries", () => {
        const { visible, followups } = stream(["Answer. ", "FOLLOW", "UPS:", " A? | B?"])
        expect(visible).not.toContain("FOLLOW")
        expect(visible.trim()).toBe("Answer.")
        expect(followups).toEqual(["A?", "B?"])
    })

    it("handles the marker arriving one character at a time", () => {
        const { visible, followups } = stream([..."Hi. FOLLOWUPS: A? | B?"])
        expect(visible).not.toContain("FOLLOW")
        expect(visible.trim()).toBe("Hi.")
        expect(followups).toEqual(["A?", "B?"])
    })

    it("emits the whole answer when the model omits follow-ups entirely", () => {
        const { visible, followups } = stream(["All of it, ", "nothing withheld."])
        expect(visible).toBe("All of it, nothing withheld.")
        expect(followups).toEqual([])
    })

    it("does not truncate an answer that merely contains the word 'follow'", () => {
        const { visible } = stream(["You can follow up with him later."])
        expect(visible).toBe("You can follow up with him later.")
    })

    it("streams incrementally rather than buffering everything to the end", () => {
        const f = new FollowupStream()
        const first = f.push("This is a reasonably long sentence that should flush. ")
        expect(first.length).toBeGreaterThan(0)
    })

    it("never emits the same text twice", () => {
        const f = new FollowupStream()
        const a = f.push("alpha beta gamma ")
        const b = f.push("delta epsilon ")
        const { tail } = f.finish()
        expect(a + b + tail).toBe("alpha beta gamma delta epsilon ")
    })
})
