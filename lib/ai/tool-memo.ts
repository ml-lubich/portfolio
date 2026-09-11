/**
 * Remembers which tool calls a conversation has already made.
 *
 * MLBot answered "I looked that up a few different ways but couldn't land on a
 * clean answer" while the panel showed "Pulling up projects" nine times. The
 * round budget was never the problem: a single round may carry several tool
 * calls, and nothing told the model it already held the result, so it asked for
 * the same data again instead of answering from it and burned the budget.
 *
 * Handing the prior result straight back — with an instruction to answer from
 * it — breaks the loop without suppressing a genuine second lookup, because the
 * signature includes the arguments.
 */

/** Stable across key order: {a,b} and {b,a} are the same request. */
function stableStringify(value: unknown): string {
    if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null"
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
    const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`
}

export function toolSignature(name: string, args: unknown): string {
    return `${name}:${stableStringify(args)}`
}

export class ToolMemo {
    private readonly seen = new Map<string, string>()

    /** The serialized result if this exact call was already made, else null. */
    recall(name: string, args: unknown): string | null {
        return this.seen.get(toolSignature(name, args)) ?? null
    }

    remember(name: string, args: unknown, serializedResult: string): void {
        this.seen.set(toolSignature(name, args), serializedResult)
    }

    /** What to feed back for a repeat, so the model answers instead of asking. */
    repeatNotice(name: string, prior: string): string {
        return (
            `You already called ${name} with these arguments in this conversation. ` +
            `The result is below — answer the user from it instead of calling it again.\n${prior}`
        )
    }

    get size(): number {
        return this.seen.size
    }
}
