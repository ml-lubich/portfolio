/**
 * Pure scheduler for the cycling install line (components/ui/cycling-install.tsx).
 *
 * The line types a command, holds it long enough to read and copy, erases it,
 * then moves to the next tool — forever. Keeping the frame a pure function of
 * elapsed time means the component is one rAF loop with no state machine, and
 * the timing is testable without a DOM.
 */

export interface CycleTimings {
    /** ms per character while typing */
    typeMs: number
    /** ms the finished command stays on screen */
    holdMs: number
    /** ms per character while erasing — faster than typing, the way a backspace feels */
    eraseMs: number
    /** ms of empty prompt between two tools */
    gapMs: number
}

export const DEFAULT_CYCLE: CycleTimings = {
    typeMs: 48,
    holdMs: 1900,
    eraseMs: 16,
    gapMs: 320,
}

export interface CycleFrame {
    /** Index into `commands` of the tool currently on the line. */
    index: number
    /** The characters visible right now. */
    shown: string
    /** True while the line is deleting itself — the cursor stops blinking then. */
    erasing: boolean
}

export function stepDuration(command: string, t: CycleTimings): number {
    return command.length * t.typeMs + t.holdMs + command.length * t.eraseMs + t.gapMs
}

export function cycleDuration(commands: string[], t: CycleTimings = DEFAULT_CYCLE): number {
    return commands.reduce((sum, c) => sum + stepDuration(c, t), 0)
}

export function installCycleFrame(
    commands: string[],
    elapsedMs: number,
    t: CycleTimings = DEFAULT_CYCLE,
): CycleFrame {
    if (commands.length === 0) return { index: 0, shown: "", erasing: false }

    const total = cycleDuration(commands, t)
    if (total <= 0) return { index: 0, shown: commands[0], erasing: false }

    let p = ((elapsedMs % total) + total) % total

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]
        const step = stepDuration(cmd, t)
        if (p >= step) {
            p -= step
            continue
        }

        const typing = cmd.length * t.typeMs
        if (p < typing) {
            return { index: i, shown: cmd.slice(0, Math.floor(p / t.typeMs)), erasing: false }
        }
        if (p < typing + t.holdMs) {
            return { index: i, shown: cmd, erasing: false }
        }
        const erasing = p - typing - t.holdMs
        if (erasing < cmd.length * t.eraseMs) {
            const gone = Math.floor(erasing / t.eraseMs)
            return { index: i, shown: cmd.slice(0, cmd.length - gone), erasing: true }
        }
        return { index: i, shown: "", erasing: true }
    }

    // Unreachable while `p < total`, but a rounding edge shouldn't blank the line.
    return { index: commands.length - 1, shown: "", erasing: false }
}

export interface BrandPart {
    text: string
    /** True for the segments that spell the owner's handle — the page paints these. */
    brand: boolean
}

/** Splits a (possibly half-typed) command so the `ml-lubich` handle can be accented. */
export function splitBrand(text: string, brand = "ml-lubich"): BrandPart[] {
    if (!brand) return text ? [{ text, brand: false }] : []

    const parts: BrandPart[] = []
    let rest = text

    while (rest.length > 0) {
        const at = rest.indexOf(brand)
        if (at === -1) break
        if (at > 0) parts.push({ text: rest.slice(0, at), brand: false })
        parts.push({ text: brand, brand: true })
        rest = rest.slice(at + brand.length)
    }

    // A command caught mid-type can end inside the handle — accent that prefix too,
    // or the name would flicker plain-then-coloured as the last letters land.
    if (rest.length > 0) {
        for (let n = Math.min(rest.length, brand.length - 1); n > 0; n--) {
            if (rest.endsWith(brand.slice(0, n))) {
                const head = rest.slice(0, rest.length - n)
                if (head) parts.push({ text: head, brand: false })
                parts.push({ text: rest.slice(rest.length - n), brand: true })
                rest = ""
                break
            }
        }
        if (rest) parts.push({ text: rest, brand: false })
    }

    return parts
}
