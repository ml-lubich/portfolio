import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { typedChars } from "@/components/demos/typewriter"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

/* The demos claim an agent is driving a real app. A hard cut between steps
 * reads as a slideshow; the motion is what sells "something just happened".
 * These lock the moving parts down so a later tidy-up cannot quietly flatten
 * them back into static swaps. */

describe("typedChars", () => {
    it("shows nothing before the first character is due", () => {
        expect(typedChars(0, 20, 18)).toBe(0)
        expect(typedChars(17, 20, 18)).toBe(0)
    })

    it("reveals one character per interval, floored", () => {
        expect(typedChars(18, 20, 18)).toBe(1)
        expect(typedChars(35, 20, 18)).toBe(1)
        expect(typedChars(36, 20, 18)).toBe(2)
    })

    it("never runs past the end of the string", () => {
        expect(typedChars(100_000, 20, 18)).toBe(20)
    })

    it("never returns a negative count for a clock that runs backwards", () => {
        // rAF timestamps and performance.now() can disagree across a tab switch.
        expect(typedChars(-500, 20, 18)).toBe(0)
    })

    it("renders instantly when typing is disabled", () => {
        // Reduced motion and SSR both want the whole string, not an empty box.
        expect(typedChars(0, 20, 0)).toBe(20)
        expect(typedChars(0, 20, -1)).toBe(20)
    })

    it("handles an empty command without dividing by nothing", () => {
        expect(typedChars(500, 0, 18)).toBe(0)
    })
})

describe("mac demo motion", () => {
    const section = read("components/sections/mac-app-demos.tsx")
    const windowTsx = read("components/demos/mac-window.tsx")
    const css = read("app/globals.css")

    it("types the command out instead of swapping the text", () => {
        expect(section).toContain("useTypewriter")
    })

    it("keeps the full command available to screen readers while it types", () => {
        // A partially-typed string is decoration; assistive tech gets the real one.
        expect(section).toMatch(/className="sr-only">\{current\.command\}/)
        expect(section).toMatch(/aria-hidden>\{typed\.shown\}/)
    })

    it("remounts the window panes on each step so their entrance replays", () => {
        // Without a step-keyed remount the CSS entrance animation only ever
        // plays once and every later step hard-cuts.
        expect(windowTsx).toMatch(/key=\{`[^`]*\$\{step\.command\}/)
    })

    it("staggers the sidebar rows rather than popping them in together", () => {
        expect(windowTsx).toContain("--i")
        expect(css).toContain("@keyframes mac-row-in")
        expect(css).toMatch(/animation-delay:\s*calc\(var\(--i\)/)
    })

    it("animates the detail pane and the message bubbles", () => {
        expect(css).toContain("@keyframes mac-pane-in")
        expect(css).toContain("@keyframes mac-bubble-in")
        expect(windowTsx).toContain("mac-pane")
        expect(windowTsx).toContain("mac-bubble-in")
    })

    it("blinks a caret while the command is typing", () => {
        expect(css).toContain("@keyframes mac-caret")
        expect(section).toContain("mac-caret")
    })

    it("drives the step-progress bar from the same constant as the timer", () => {
        // Two hardcoded durations drift the moment either is tuned.
        expect(css).toContain("@keyframes mac-progress")
        expect(section).toMatch(/animationDuration:\s*`\$\{STEP_MS\}ms`/)
    })

    it("stops the progress bar when the carousel is not advancing", () => {
        // Off screen, or on a manually picked step, a running bar lies about
        // what the timer is doing.
        expect(section).toContain("data-playing")
    })

    it("drops every demo animation under reduced motion", () => {
        const block = css.slice(css.indexOf("/* ── macOS window chrome"))
        const reduced = block.slice(block.indexOf("@media (prefers-reduced-motion: reduce)"))
        expect(reduced).toBeTruthy()
        for (const name of ["mac-pane-in", "mac-row-in", "mac-bubble-in", "mac-caret", "mac-progress"]) {
            expect(block, `${name} has no reduced-motion escape`).toContain(name)
        }
        expect(reduced).toContain("animation: none")
    })
})
