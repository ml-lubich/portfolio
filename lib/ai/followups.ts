/**
 * ─── Follow-up extraction ─────────────────────────────────────────────
 *
 * The model appends its suggested follow-up questions to the SAME reply,
 * on a final `FOLLOWUPS: a | b | c` line. Generating them with a second
 * model call would double both the cost per turn and the abuse surface,
 * so we take them for free out of the response we were already paying for.
 *
 * The catch is streaming: the marker must never reach the user's screen.
 * This filter holds back a tail just long enough to recognise a marker
 * that arrives split across delta boundaries ("FOLLOW" + "UPS:").
 */

export const FOLLOWUP_MARKER = "FOLLOWUPS:"

/** Hard caps, enforced here rather than trusted to the prompt. */
export const FOLLOWUP_LIMITS = {
    max: 3,
    maxChars: 52,
} as const

export class FollowupStream {
    private buf = ""
    private emitted = 0

    /** Returns the slice of text that is safe to show the user right now. */
    push(delta: string): string {
        this.buf += delta
        const idx = this.buf.indexOf(FOLLOWUP_MARKER)
        // Once the marker is seen, nothing after it is ever user-visible.
        // Until then, withhold the last few chars in case they begin one.
        const safeEnd = idx >= 0 ? idx : Math.max(0, this.buf.length - (FOLLOWUP_MARKER.length - 1))
        if (safeEnd <= this.emitted) return ""
        const out = this.buf.slice(this.emitted, safeEnd)
        this.emitted = safeEnd
        return out
    }

    /** Flushes any withheld text and parses the follow-ups. */
    finish(): { tail: string; followups: string[] } {
        const idx = this.buf.indexOf(FOLLOWUP_MARKER)

        if (idx < 0) {
            const tail = this.buf.slice(this.emitted)
            this.emitted = this.buf.length
            return { tail, followups: [] }
        }

        const tail = this.emitted < idx ? this.buf.slice(this.emitted, idx) : ""
        this.emitted = idx
        return { tail, followups: parseFollowups(this.buf.slice(idx + FOLLOWUP_MARKER.length)) }
    }
}

/** Splits, trims and clamps the raw follow-up line. Never trusts the model's count. */
/** Clamps to `maxChars` without splitting a word. A pill reading
 *  "…multi-agent pipeli…" looks broken; one that stops on a whole word does
 *  not. */
function clamp(s: string): string {
    if (s.length <= FOLLOWUP_LIMITS.maxChars) return s
    const cut = s.slice(0, FOLLOWUP_LIMITS.maxChars)
    const lastSpace = cut.lastIndexOf(" ")
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…"
}

export function parseFollowups(raw: string): string[] {
    const seen = new Set<string>()

    return raw
        .split("|")
        .map((s) => s.replace(/\s+/g, " ").trim())
        // Strip any list numbering the model adds despite the format instruction.
        .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
        .filter(Boolean)
        // Models repeat themselves; two identical pills read as a rendering bug.
        .filter((s) => {
            const key = s.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .slice(0, FOLLOWUP_LIMITS.max)
        .map(clamp)
}
