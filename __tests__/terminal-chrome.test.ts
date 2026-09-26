/**
 * Terminal chrome guards.
 *
 * Tailwind only generates classes it can read literally in source. A class
 * built by interpolation — `bg-[${terminalChrome.dotClose}]` — is never
 * generated, so the element silently renders with no colour. That is how the
 * About terminal's traffic lights went blank. Colours from `lib/theme` go in
 * `style`, never inside an arbitrary-value class.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { terminalChrome } from "@/lib/theme"

const ROOT = path.resolve(__dirname, "..")

function sourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) return sourceFiles(p)
        return /\.(tsx|ts)$/.test(e.name) ? [p] : []
    })
}

describe("no interpolated arbitrary-value classes", () => {
    it("components/ and app/ never build a Tailwind `-[${…}]` class (Tailwind can't see it, so it never exists)", () => {
        const offenders: string[] = []
        for (const file of ["components", "app"].flatMap((d) => sourceFiles(path.join(ROOT, d)))) {
            fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
                if (/-\[\$\{/.test(line)) offenders.push(`${path.relative(ROOT, file)}:${i + 1}`)
            })
        }
        expect(offenders, `interpolated arbitrary classes:\n${offenders.join("\n")}`).toEqual([])
    })
})

describe("TerminalReveal chrome", () => {
    it("paints the traffic lights and the panel with real colours", async () => {
        const { TerminalReveal } = await import("@/components/terminal/terminal-reveal")
        const html = renderToStaticMarkup(createElement(TerminalReveal, { lines: ["hello"], title: "~/t" }))
        for (const c of [terminalChrome.dotClose, terminalChrome.dotMinimize, terminalChrome.dotExpand, terminalChrome.revealBg]) {
            expect(html).toContain(`background-color:${c}`)
        }
    })
})

describe("copy buttons have distinct accessible names", () => {
    it("the cycling install marquee never shares a label with a card's copy button", () => {
        const marquee = fs.readFileSync(path.join(ROOT, "components/ui/cycling-install.tsx"), "utf8")
        const card = fs.readFileSync(path.join(ROOT, "components/ui/copy-command.tsx"), "utf8")
        const label = (src: string) => src.match(/aria-label=\{`([^`$]*)\$\{/)?.[1]
        expect(label(marquee)).toBeTruthy()
        expect(label(card)).toBeTruthy()
        expect(label(marquee)).not.toBe(label(card))
    })
})
