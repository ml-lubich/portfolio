/**
 * Guardrails for the "A Day in My Life" live terminal: typed-out code must keep
 * its indentation. HTML collapses leading/repeated whitespace by default, so the
 * cmd/out/code renderers must opt into `whitespace-pre-wrap`. Session data is the
 * fixture proving indentation actually exists to preserve.
 */

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it, expect } from "vitest"
import { sessions } from "@/components/terminal/session-data"

const __dirname = dirname(fileURLToPath(import.meta.url))
const terminalSource = readFileSync(
  join(__dirname, "..", "components", "terminal", "index.tsx"),
  "utf8",
)

describe("terminal indentation regression guards", () => {
  it("session data contains indented code lines worth preserving", () => {
    const indented = sessions
      .flatMap((s) => s.lines)
      .filter((l) => l.t === "code" && /^\s{2,}/.test(l.s))
    expect(indented.length).toBeGreaterThan(0)
  })

  it("session data contains output lines with aligned multi-space columns", () => {
    const aligned = sessions
      .flatMap((s) => s.lines)
      .filter((l) => l.t === "out" && /\S\s{2,}\S/.test(l.s))
    expect(aligned.length).toBeGreaterThan(0)
  })

  it("code line renderer preserves whitespace", () => {
    const codeSpan = terminalSource.match(
      /<span className="text-foreground\/80[^"]*">/,
    )?.[0]
    expect(codeSpan).toContain("whitespace-pre-wrap")
    expect(codeSpan).toContain("[tab-size:4]")
    expect(codeSpan).toContain("break-all")
  })

  it("output line renderer preserves whitespace", () => {
    const outDiv = terminalSource.match(/className=\{`pl-5[^`]*`\}/)?.[0]
    expect(outDiv).toContain("whitespace-pre-wrap")
    expect(outDiv).toContain("[tab-size:4]")
  })

  it("command line renderer preserves whitespace", () => {
    const cmdSpan = terminalSource.match(
      /<span className="text-foreground\/90[^"]*">/,
    )?.[0]
    expect(cmdSpan).toContain("whitespace-pre-wrap")
    expect(cmdSpan).toContain("[tab-size:4]")
  })
})
