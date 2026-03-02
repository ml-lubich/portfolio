/* ── Terminal session types ────────────────────────────────────────── */

export interface Line {
  t: "cmd" | "out" | "code" | "hdr" | "gap"
  s: string
  d?: number   // delay ms BEFORE line
  c?: string   // tailwind color override
}

export interface Session {
  time: string
  label: string
  icon: string
  lines: Line[]
}

/** Displayed line state */
export interface DisplayLine {
  si: number
  li: number
  text: string
  done: boolean
}
