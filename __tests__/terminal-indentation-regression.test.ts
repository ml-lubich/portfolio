/**
 * Guardrails for the "A Day in My Life" live terminal.
 *
 * Root cause fixed: code lines use a `<code>` flex-item (not an inline `<span>`)
 * so the browser never collapses leading spaces during the typing animation.
 * `font-mono` ensures monospace space-width; `whitespace-pre-wrap` preserves
 * the indentation at every character burst.
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

  it("code line renderer uses <code> flex-item so leading spaces are never collapsed", () => {
    // <code> as a flex child becomes a block-level box; whitespace-pre-wrap then
    // guarantees leading spaces in dl.text survive the typing animation.
    const codeEl = terminalSource.match(/<code className="text-foreground\/80[^"]*">/)?.[0]
    expect(codeEl).toContain("whitespace-pre-wrap")
    expect(codeEl).toContain("font-mono")
    expect(codeEl).toContain("flex-1")
    expect(codeEl).toContain("[tab-size:4]")
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
