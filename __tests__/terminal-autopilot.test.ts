import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createShellState, runCommand } from "@/lib/shell-interpreter"
import { AUTOPILOT_COMMANDS, AUTOPILOT_IDLE_MS } from "@/lib/terminal-autopilot"

describe("terminal autopilot", () => {
    it("every scripted command runs clean, in order, against the virtual fs", () => {
        let state = createShellState()
        for (const command of AUTOPILOT_COMMANDS) {
            const res = runCommand(state, command)
            state = res.state
            expect(res.action, command).toBeUndefined()
            const errors = res.lines.filter((l) => l.kind === "error").map((l) => l.text)
            expect(errors, `${command} → ${errors.join(" | ")}`).toEqual([])
            // cd prints nothing on success; everything else must show output.
            if (command !== "cd" && !command.startsWith("cd ")) expect(res.lines.length, command).toBeGreaterThan(1)
        }
    })

    it("waits a few seconds of silence and yields to the visitor", () => {
        expect(AUTOPILOT_IDLE_MS).toBeGreaterThanOrEqual(4_000)
        const src = readFileSync("components/terminal/interactive-terminal.tsx", "utf8")
        expect(src).toContain("AUTOPILOT_COMMANDS")
        expect(src).toMatch(/lastUserRef\.current = Date\.now\(\)/)
        expect(src).toContain("document.hidden")
    })
})
