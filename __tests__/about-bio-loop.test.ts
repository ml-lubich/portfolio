import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { BIO_SCRIPTS, BIO_CYCLE } from "@/data/about-bio"
import { cycleDuration, linesCycleFrame } from "@/lib/install-cycle"

const joined = BIO_SCRIPTS.map((s) => s.join("\n"))

describe("BIO_SCRIPTS — the bank the About terminal rewrites itself from", () => {
    it("has enough different bios that the loop doesn't feel like a repeat", () => {
        expect(BIO_SCRIPTS.length).toBeGreaterThanOrEqual(5)
        expect(new Set(joined).size).toBe(BIO_SCRIPTS.length)
    })

    it("opens on EchoStar, the current role", () => {
        expect(BIO_SCRIPTS[0][0]).toMatch(/EchoStar/)
    })

    it("every bio is 3–4 short lines that each fit one terminal row", () => {
        for (const script of BIO_SCRIPTS) {
            expect(script.length).toBeGreaterThanOrEqual(3)
            expect(script.length).toBeLessThanOrEqual(4)
            for (const line of script) {
                expect(line.trim().length).toBeGreaterThan(0)
                expect(line.length).toBeLessThanOrEqual(70)
                expect(line).not.toMatch(/\n/)
            }
        }
    })

    it("never uses retired titles or the chosen-over framing", () => {
        const all = joined.join("\n")
        expect(all).not.toMatch(/Senior Software Engineer|Vibe Coder/i)
        expect(all).not.toMatch(/Anduril|Mach Industries|chosen over/i)
    })
})

describe("linesCycleFrame — multi-line type / hold / erase / next", () => {
    const scripts = [["ab", "cd"], ["xyz"]]
    const t = { typeMs: 10, holdMs: 100, eraseMs: 5, gapMs: 50 }
    // "ab\ncd" is 5 chars: type 50ms, hold 100ms, erase 25ms, gap 50ms = 225ms
    const first = 5 * 10 + 100 + 5 * 5 + 50

    it("starts on the first script with nothing typed", () => {
        expect(linesCycleFrame(scripts, 0, t)).toEqual({ index: 0, lines: [""], erasing: false })
    })

    it("types across the line break, keeping finished lines whole", () => {
        expect(linesCycleFrame(scripts, 20, t).lines).toEqual(["ab"])
        expect(linesCycleFrame(scripts, 40, t).lines).toEqual(["ab", "c"])
    })

    it("holds the whole bio long enough to read", () => {
        const f = linesCycleFrame(scripts, 60, t)
        expect(f.lines).toEqual(["ab", "cd"])
        expect(f.erasing).toBe(false)
    })

    it("erases itself back up through the lines", () => {
        const f = linesCycleFrame(scripts, 150 + 7, t)
        expect(f.erasing).toBe(true)
        expect(f.lines).toEqual(["ab", "c"])
    })

    it("moves on to a different bio, then loops forever", () => {
        expect(linesCycleFrame(scripts, first + 20, t)).toMatchObject({ index: 1, lines: ["xy"] })
        const whole = cycleDuration(scripts.map((s) => s.join("\n")), t)
        expect(linesCycleFrame(scripts, whole * 3 + 20, t)).toMatchObject({ index: 0, lines: ["ab"] })
    })

    it("the real bank takes a readable amount of time per bio", () => {
        const perBio = cycleDuration(joined, BIO_CYCLE) / BIO_SCRIPTS.length
        expect(BIO_CYCLE.holdMs).toBeGreaterThanOrEqual(3000)
        expect(perBio).toBeGreaterThan(5000)
        expect(perBio).toBeLessThan(20000)
    })
})

describe("About section uses the looping terminal", () => {
    const about = readFileSync(join(process.cwd(), "components/sections/about.tsx"), "utf8")

    it("feeds the bank to a looping terminal, not a one-shot reveal", () => {
        expect(about).toMatch(/BIO_SCRIPTS/)
        expect(about).toMatch(/<TerminalLoop/)
        expect(about).not.toMatch(/<TerminalReveal/)
    })
})
