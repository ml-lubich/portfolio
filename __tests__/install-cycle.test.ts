/**
 * Timing + branding guards for the cycling install line.
 * The line is the first thing the Open Source panel says, so a regression that
 * parks it on one tool (or blanks it) is a visible one.
 */

import { describe, it, expect } from "vitest"
import {
    DEFAULT_CYCLE,
    cycleDuration,
    installCycleFrame,
    splitBrand,
    stepDuration,
} from "@/lib/install-cycle"
import { ossAgentTools } from "@/data/oss-agent-tools"

const CMDS = ["brew install ml-lubich/tap/imsg", "pipx install twig-cli"]

describe("installCycleFrame", () => {
    it("starts empty and types one character at a time", () => {
        expect(installCycleFrame(CMDS, 0).shown).toBe("")
        expect(installCycleFrame(CMDS, DEFAULT_CYCLE.typeMs * 4).shown).toBe(CMDS[0].slice(0, 4))
    })

    it("holds the finished command long enough to read", () => {
        const typed = CMDS[0].length * DEFAULT_CYCLE.typeMs
        const f = installCycleFrame(CMDS, typed + DEFAULT_CYCLE.holdMs / 2)
        expect(f).toMatchObject({ index: 0, shown: CMDS[0], erasing: false })
    })

    it("erases back down before moving on", () => {
        const typed = CMDS[0].length * DEFAULT_CYCLE.typeMs
        const f = installCycleFrame(CMDS, typed + DEFAULT_CYCLE.holdMs + DEFAULT_CYCLE.eraseMs * 5)
        expect(f.erasing).toBe(true)
        expect(f.shown.length).toBe(CMDS[0].length - 5)
    })

    it("advances to the next tool and wraps forever", () => {
        const second = stepDuration(CMDS[0], DEFAULT_CYCLE) + DEFAULT_CYCLE.typeMs * 3
        expect(installCycleFrame(CMDS, second).index).toBe(1)

        const total = cycleDuration(CMDS)
        expect(installCycleFrame(CMDS, total + DEFAULT_CYCLE.typeMs * 4)).toEqual(
            installCycleFrame(CMDS, DEFAULT_CYCLE.typeMs * 4),
        )
    })

    it("reaches every tool in the grid within one cycle", () => {
        const cmds = ossAgentTools.map((t) => t.install)
        const seen = new Set<number>()
        const total = cycleDuration(cmds)
        for (let t = 0; t < total; t += 50) seen.add(installCycleFrame(cmds, t).index)
        expect(seen.size).toBe(cmds.length)
    })

    it("never throws on an empty list", () => {
        expect(installCycleFrame([], 1234)).toEqual({ index: 0, shown: "", erasing: false })
    })
})

describe("splitBrand", () => {
    it("isolates the handle so it can be accented", () => {
        expect(splitBrand("brew install ml-lubich/tap/imsg")).toEqual([
            { text: "brew install ", brand: false },
            { text: "ml-lubich", brand: true },
            { text: "/tap/imsg", brand: false },
        ])
    })

    it("accents a half-typed handle instead of flickering", () => {
        expect(splitBrand("brew install ml-lub")).toEqual([
            { text: "brew install ", brand: false },
            { text: "ml-lub", brand: true },
        ])
    })

    it("leaves commands without the handle alone", () => {
        expect(splitBrand("pipx install twig-cli")).toEqual([
            { text: "pipx install twig-cli", brand: false },
        ])
        expect(splitBrand("")).toEqual([])
    })
})
