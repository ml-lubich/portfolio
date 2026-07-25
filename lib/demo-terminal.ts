/**
 * Pure scheduler for `DemoTerminal`. No DOM — just Line[] + a "characters
 * revealed" counter in, a render-ready frame out. Mirrors the live-terminal
 * engine's rule: `cmd`/`code` type character-by-character, `out`/`hdr`/`gap`
 * render instantly the moment the sequence reaches them.
 */

import type { Line } from "@/components/terminal/types"

export interface DemoDisplayLine {
  index: number
  text: string
  done: boolean
}

export interface DemoTerminalFrame {
  displayLines: DemoDisplayLine[]
  done: boolean
}

const isTyped = (t: Line["t"]) => t === "cmd" || t === "code"

/** Total characters that must be revealed to finish all typed lines. */
export function getDemoTerminalTypedLength(lines: Line[]): number {
  return lines.reduce((sum, l) => sum + (isTyped(l.t) ? l.s.length : 0), 0)
}

/** The fully-revealed script, exactly as it will read once `done`. */
export function getDemoTerminalFullText(lines: Line[]): string {
  return lines.map((l) => l.s).join("\n")
}

/**
 * Walk `lines` in order, spending `revealCount` characters on typed lines.
 * Instant lines (out/hdr/gap) cost nothing and are always shown in full the
 * moment they're reached. Stops at the first typed line that isn't fully
 * revealed yet; overshoot beyond the script's total length is a no-op.
 */
export function computeDemoTerminalFrame(lines: Line[], revealCount: number): DemoTerminalFrame {
  const displayLines: DemoDisplayLine[] = []
  let remaining = revealCount

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (!isTyped(line.t)) {
      displayLines.push({ index, text: line.s, done: true })
      continue
    }

    if (remaining >= line.s.length) {
      displayLines.push({ index, text: line.s, done: true })
      remaining -= line.s.length
      continue
    }

    displayLines.push({ index, text: line.s.slice(0, Math.max(0, remaining)), done: false })
    return { displayLines, done: false }
  }

  return { displayLines, done: true }
}
