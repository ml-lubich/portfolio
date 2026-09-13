/**
 * ─── Card link stripping ──────────────────────────────────────────────
 *
 * The hand-off cards — booking, resume, contact — already carry the real
 * calendar link, the real file and the real address. The prompt tells the
 * model not to repeat them; models repeat them anyway, and a pasted URL
 * renders as raw markdown directly under a card that says the same thing.
 *
 * So strip them on display. The prompt is guidance; this is the guarantee.
 */

import { BOOKING_URL, RESUME_URL, CONTACT_EMAIL } from "./profile-tools"

const TARGETS = [BOOKING_URL, RESUME_URL, `mailto:${CONTACT_EMAIL}`, CONTACT_EMAIL]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export function stripCardLinks(text: string): string {
    let out = text
    for (const target of TARGETS) {
        const t = escape(target)
        out = out
            // [label](target…) → label, so the sentence keeps its wording. An
            // email whose label is the address itself falls through to the
            // bare pass below and goes with it.
            .replace(new RegExp(`\\[([^\\]]*)\\]\\(\\s*${t}[^)]*\\)`, "gi"), "$1")
            // A lead-in separator goes with the thing it introduced, so
            // "reach him — <address>." does not become "reach him — .".
            .replace(new RegExp(`([ \\t]*[—–:-][ \\t]*)?<${t}[^>]*>`, "gi"), "")
            .replace(new RegExp(`([ \\t]*[—–:-][ \\t]*)?${t}`, "gi"), "")
    }

    return out
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+([.,!?])/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}
