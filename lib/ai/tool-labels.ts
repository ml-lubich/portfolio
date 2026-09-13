/**
 * ─── Tool step display ────────────────────────────────────────────────
 *
 * What a visitor is shown while MLBot works. Kept out of the panel component
 * so the collapsing rule below is testable without a DOM.
 *
 * The server already refuses to re-run an identical name+args call
 * (`lib/ai/tool-memo`), so anything reaching here is a genuinely different
 * lookup. Two of them can still *read* identically — "Pulling up projects"
 * twice is `get_projects` with and without a tag — and two identical lines in
 * a row look like a stutter, not like work. Collapse the display, not the call.
 */

/** Human-readable labels for the tool names the model calls. */
export const TOOL_LABELS: Record<string, string> = {
    search_profile: "Searching the profile",
    get_experience: "Reading work history",
    get_projects: "Pulling up projects",
    get_skills: "Checking skills",
    get_publications: "Looking up publications",
    get_testimonials: "Fetching testimonials",
    chart_skills: "Charting skills",
    chart_tech_usage: "Charting tech usage",
    chart_publications_by_year: "Charting publications",
    request_consultation: "Opening the calendar",
    get_resume: "Fetching the resume",
    get_contact: "Looking up contact details",
}

export interface ToolStep {
    name: string
    done: boolean
}

/**
 * Merges runs of steps that render the same label into one row. A step is only
 * shown as finished once every call folded into it has come back, so the
 * spinner never settles while a lookup is still out.
 */
export function collapseToolSteps(steps: ToolStep[]): ToolStep[] {
    const out: ToolStep[] = []
    for (const step of steps) {
        const prev = out[out.length - 1]
        const sameLabel = prev && (TOOL_LABELS[prev.name] ?? prev.name) === (TOOL_LABELS[step.name] ?? step.name)
        if (sameLabel) out[out.length - 1] = { ...prev, done: prev.done && step.done }
        else out.push({ ...step })
    }
    return out
}
