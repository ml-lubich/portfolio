/**
 * Guardrails for the "A Day in My Life" live terminal.
 *
 * Root cause fixed: code lines use a `<pre><code>` pair instead of an inline
 * text container, so leading spaces survive typed and highlighted states.
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

const getSourceMatch = (pattern: RegExp): string => {
  const match = terminalSource.match(pattern)
  return match?.[0] ?? ""
}

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

  it("streaming inference fixture preserves multiline TypeScript indentation", () => {
    const streamingLines = sessions
      .find((s) => s.label === "Streaming Inference API")
      ?.lines.filter((l) => l.t === "code")
      .map((l) => l.s) ?? []
    expect(streamingLines.slice(0, 9)).toEqual([
      "export async function* streamInference(",
      "  prompt: string, model: ModelConfig",
      "): AsyncGenerator<Token> {",
      "  const sess = await gpu.allocate(model.vram);",
      "  for await (const tok of model.generate(prompt)) {",
      "    metrics.track('tps', sess.tokensPerSecond);",
      "    yield { text: tok.decode(), latency: tok.ms };",
      "  }",
      "  gpu.release(sess);",
    ])
  })

  it("code line renderer uses preformatted code so leading spaces are never collapsed", () => {
    const preEl = getSourceMatch(/<pre className="m-0[^"]*">/)
    expect(preEl).toMatch(/flex-1.*whitespace-pre-wrap.*font-mono/)
  })

  it("code line renderer keeps a semantic code child", () => {
    const codeEl = getSourceMatch(/<code className="font-mono">/)
    expect(codeEl).toBe('<code className="font-mono">')
  })

  it("output line renderer preserves whitespace", () => {
    const outDiv = getSourceMatch(/className=\{`pl-5[^`]*`\}/)
    expect(outDiv).toMatch(/whitespace-pre-wrap.*\[tab-size:4\]/)
  })

  it("command line renderer preserves whitespace", () => {
    const cmdSpan = getSourceMatch(/<span className="text-foreground\/90[^"]*">/)
    expect(cmdSpan).toMatch(/whitespace-pre-wrap.*\[tab-size:4\]/)
  })
})
