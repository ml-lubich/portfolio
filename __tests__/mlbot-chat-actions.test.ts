import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

/* Briopedia's chat is the reference: per-message copy + retry, edit-and-resend
 * on your own messages, a stop control while streaming, a new-chat control,
 * and one roomy panel rather than a phone-sized box. Source assertions, like
 * the visuals gate — the widget is a client component with no DOM harness. */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")
const source = read("components/ai-chat/mlbot.tsx")
const noComments = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")

describe("MLBot assistant actions", () => {
    it("offers a copy control on assistant answers that confirms with Copied", () => {
        expect(source).toMatch(/(aria-)?label=["'`]Copy (answer|response)/)
        expect(source).toContain("navigator.clipboard.writeText")
        expect(source).toMatch(/>\s*Copied\s*</)
    })

    it("offers a retry control that re-runs the last user turn", () => {
        expect(source).toMatch(/aria-label=\{?["'`]?Retry/)
        // Retry must resend the last user question, not append a duplicate.
        expect(noComments).toMatch(/role === "user"[\s\S]{0,200}findLast|findLast\([\s\S]{0,80}role === "user"/)
    })

    it("uses text-background on any solid foreground button, never text-black", () => {
        expect(source).not.toMatch(/text-black|bg-white(?![/[])/)
    })
})

describe("MLBot edit and resend", () => {
    it("lets the reader edit their own message and resend it", () => {
        expect(source).toMatch(/aria-label=\{?["'`]?Edit message/)
        // An inline editor with an explicit save + cancel pair.
        expect(source).toMatch(/aria-label=\{?["'`]?(Save|Resend)/)
        expect(source).toMatch(/aria-label=\{?["'`]?Cancel edit/)
    })

    it("replaces the old answer instead of appending after it", () => {
        // send() takes a truncation index so history stops before the edited turn.
        expect(noComments).toMatch(/send\s*=\s*useCallback\(\s*async\s*\(\s*text: string,\s*\w+\??: number/)
        expect(noComments).toMatch(/turns\.slice\(0,\s*\w+/)
    })
})

describe("MLBot stop generation", () => {
    it("wires an AbortController into the stream fetch", () => {
        expect(source).toContain("new AbortController()")
        expect(noComments).toMatch(/fetch\("\/api\/chat",\s*\{[\s\S]{0,300}signal:/)
    })

    it("shows a stop control while streaming that aborts the request", () => {
        expect(source).toMatch(/aria-label=\{?["'`]?Stop/)
        expect(noComments).toMatch(/\.abort\(\)/)
    })

    it("keeps the partial answer on abort rather than replacing it with an error", () => {
        expect(noComments).toMatch(/AbortError/)
    })
})

describe("MLBot new chat", () => {
    it("offers a new-chat control that clears the transcript", () => {
        expect(source).toMatch(/aria-label=\{?["'`]?New chat/)
        expect(noComments).toContain("setTurns([])")
    })
})

describe("MLBot panel proportions", () => {
    const sizes = source.slice(source.indexOf("const PANEL_SIZES"), source.indexOf("] as const"))
    const rungs = [...sizes.matchAll(/"([^"]+)"/g)].map((m) => m[1])

    it("defaults to the generous size, not a small one", () => {
        expect(source).toMatch(/useState\(0\)/)
        expect(rungs.length).toBeLessThanOrEqual(2)
    })

    it("is briopedia-sized by default: ~30rem wide, ~85dvh tall", () => {
        const [base] = rungs
        const w = base.match(/sm:w-\[min\((\d+(?:\.\d+)?)rem/)
        const h = base.match(/sm:h-\[min\((\d+(?:\.\d+)?)rem/)
        expect(w, base).not.toBeNull()
        expect(h, base).not.toBeNull()
        expect(Number(w![1])).toBeGreaterThanOrEqual(30)
        expect(Number(h![1])).toBeGreaterThanOrEqual(44)
        expect(base).toMatch(/dvh/)
    })
})

/* A follow-up is now a pair — a short pill label and the full question it
 * asks. The pill wears `q.label`; `q.question` is what gets sent and what the
 * transcript shows. See e2e/mlbot-chat.spec.ts for the behavioural proof. */
describe("MLBot follow-up pills send the whole question", () => {
    const pills = source.slice(source.indexOf("turn.followups?.length"), source.indexOf("turn.followups?.length") + 1600)

    it("sends the model's full question on click, and only shortens the label", () => {
        expect(pills).toMatch(/onClick=\{\(\) => send\(q\.question\)\}/)
        expect(pills).toMatch(/\{clampFollowup\(q\.label\)\}/)
        expect(pills).toContain("title={q.question}")
        expect(pills).toContain("aria-label={q.question}")
    })
})

describe("MLBot on a phone", () => {
    it("sets body text to 16px below sm so nothing needs a pinch", () => {
        for (const line of source.split("\n").filter((l) => /mlbot-md|rounded-br-sm bg-white/.test(l))) {
            expect(line).toMatch(/text-\[16px\]/)
        }
    })

    it("gives every control a 44px hit target below sm", () => {
        const controls = source.split("\n").filter((l) => /aria-label="(Send|Stop generating|New chat|Close MLBot)"/.test(l))
        expect(controls.length).toBeGreaterThanOrEqual(4)
        for (const l of controls) {
            const idx = source.indexOf(l)
            expect(source.slice(idx, idx + 400)).toMatch(/h-11 w-11/)
        }
        expect(source).toMatch(/const ACTION =[^"]*"[^"]*h-11/)
    })
})
