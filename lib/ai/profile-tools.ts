/**
 * ─── MLBot tool layer ─────────────────────────────────────────────────
 *
 * Tools the chat model can call to answer questions about Misha's profile.
 *
 * Deliberately NOT a RAG pipeline. The whole profile is a few thousand
 * tokens of already-structured data in `data/*.ts`, and the models we run
 * on have 200K–1M context. Embeddings + a vector store would add a
 * database, an ingestion job and a similarity-search failure mode to
 * retrieve records we can simply look up by key. Structured tools over
 * structured data are both cheaper and exact.
 *
 * Chart tools return a spec, not a picture — the client renders it with
 * recharts, which the site already depends on.
 */

import { experiences } from "@/data/experiences"
import { projects } from "@/data/projects"
import { skillCategories, proficiencyBars } from "@/data/skills"
import { papers } from "@/data/publications"
import { clientTestimonials } from "@/data/client-testimonials"

export interface ChartSpec {
    kind: "bar" | "line" | "radar"
    title: string
    /** Axis/series label for the value dimension. */
    unit?: string
    data: { label: string; value: number }[]
}

export type ToolResult = Record<string, unknown> | { chart: ChartSpec }

/* ── Tool schemas (OpenAI/OpenRouter function-calling format) ─────────── */

export const TOOL_SCHEMAS = [
    {
        type: "function",
        function: {
            name: "search_profile",
            description:
                "Full-text search across every part of Misha's profile: jobs, projects, skills, publications and client testimonials. Use this first for open-ended questions.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Keywords, e.g. 'kafka' or 'agentic RAG'" },
                },
                required: ["query"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_experience",
            description: "Misha's work history: roles, companies, dates, locations and what he built.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_projects",
            description: "Portfolio projects with headline metrics. Optionally filter by a technology tag.",
            parameters: {
                type: "object",
                properties: { tag: { type: "string", description: "Optional tech filter, e.g. 'Python'" } },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_skills",
            description: "Skill categories and proficiency levels.",
            parameters: {
                type: "object",
                properties: { category: { type: "string", description: "Optional category, e.g. 'AI/ML Engineering'" } },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_publications",
            description: "Peer-reviewed papers and conference abstracts, with venue and year.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_testimonials",
            description: "Direct feedback from consulting and build engagements.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "chart_skills",
            description:
                "Render a bar chart of Misha's strongest skills by proficiency. Use when the user asks to see, compare or visualise skill strength.",
            parameters: {
                type: "object",
                properties: { top: { type: "number", description: "How many skills to show (default 8)" } },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "chart_tech_usage",
            description:
                "Render a bar chart of the technologies appearing most across Misha's roles and projects. Use for 'what does he use most' style questions.",
            parameters: {
                type: "object",
                properties: { top: { type: "number", description: "How many technologies to show (default 10)" } },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "chart_publications_by_year",
            description: "Render a line chart of publication count per year.",
            parameters: { type: "object", properties: {} },
        },
    },
] as const

/* ── Executors ───────────────────────────────────────────────────────── */

/** Compact projections — the model gets facts, not the UI's gradient/accent fields. */
const slimExperience = () =>
    experiences.map((e) => ({
        role: e.title,
        company: e.company,
        period: e.period,
        location: e.location,
        summary: e.summary,
        tech: e.tags,
    }))

const slimProjects = () =>
    projects.map((p) => ({ name: p.name, metric: p.metric, summary: p.summary, tech: p.tags }))

const slimPapers = () =>
    papers.map((p) => ({ title: p.title, type: p.type, year: p.year, venue: p.venue, summary: p.summary, href: p.href }))

const slimTestimonials = () =>
    clientTestimonials.map((t) => ({
        quote: t.quote,
        name: t.name,
        title: t.title,
        organization: t.organization,
        rating: t.rating,
    }))

function searchProfile(query: string): ToolResult {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return { matches: [] }

    const hit = (haystack: string) => {
        const h = haystack.toLowerCase()
        return terms.filter((t) => h.includes(t)).length
    }

    type Scored = { score: number; kind: string; item: unknown }
    const scored: Scored[] = []

    for (const e of slimExperience()) {
        const s = hit(`${e.role} ${e.company} ${e.summary} ${e.tech.join(" ")}`)
        if (s) scored.push({ score: s, kind: "experience", item: e })
    }
    for (const p of slimProjects()) {
        const s = hit(`${p.name} ${p.summary} ${p.metric} ${p.tech.join(" ")}`)
        if (s) scored.push({ score: s, kind: "project", item: p })
    }
    for (const c of skillCategories) {
        const s = hit(`${c.category} ${c.items.join(" ")} ${c.backDetails.join(" ")}`)
        if (s) scored.push({ score: s, kind: "skill", item: { category: c.category, items: c.items } })
    }
    for (const p of slimPapers()) {
        const s = hit(`${p.title} ${p.venue} ${p.summary}`)
        if (s) scored.push({ score: s, kind: "publication", item: p })
    }
    for (const t of slimTestimonials()) {
        const s = hit(`${t.quote} ${t.name} ${t.organization}`)
        if (s) scored.push({ score: s, kind: "testimonial", item: t })
    }

    scored.sort((a, b) => b.score - a.score)
    return { matches: scored.slice(0, 8).map(({ kind, item }) => ({ kind, ...(item as object) })) }
}

function getProjects(tag?: string): ToolResult {
    const all = slimProjects()
    if (!tag) return { projects: all }
    const t = tag.toLowerCase()
    return { projects: all.filter((p) => p.tech.some((x) => x.toLowerCase().includes(t))) }
}

function getSkills(category?: string): ToolResult {
    if (!category) {
        return {
            categories: skillCategories.map((c) => ({ category: c.category, items: c.items })),
            proficiency: proficiencyBars.map((b) => ({ skill: b.label, level: b.display, score: b.value })),
        }
    }
    const c = category.toLowerCase()
    const match = skillCategories.filter((x) => x.category.toLowerCase().includes(c))
    return { categories: match.map((x) => ({ category: x.category, items: x.items, detail: x.backDetails })) }
}

function chartSkills(top = 8): ToolResult {
    const data = [...proficiencyBars]
        .sort((a, b) => b.value - a.value)
        .slice(0, Math.max(1, Math.min(top, proficiencyBars.length)))
        .map((b) => ({ label: b.label, value: b.value }))
    return { chart: { kind: "bar", title: "Skill proficiency", unit: "%", data } }
}

function chartTechUsage(top = 10): ToolResult {
    const counts = new Map<string, number>()
    for (const tag of [...experiences.flatMap((e) => e.tags), ...projects.flatMap((p) => p.tags)]) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    const data = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, Math.max(1, top))
        .map(([label, value]) => ({ label, value }))
    return { chart: { kind: "bar", title: "Most-used technologies", unit: "mentions", data } }
}

function chartPublicationsByYear(): ToolResult {
    const counts = new Map<string, number>()
    for (const p of papers) counts.set(p.year, (counts.get(p.year) ?? 0) + 1)
    const data = [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, value]) => ({ label, value }))
    return { chart: { kind: "line", title: "Publications per year", unit: "papers", data } }
}

/** Dispatches a model tool call. Unknown names return an error the model can recover from. */
export function runTool(name: string, args: Record<string, unknown>): ToolResult {
    switch (name) {
        case "search_profile":
            return searchProfile(String(args.query ?? ""))
        case "get_experience":
            return { experience: slimExperience() }
        case "get_projects":
            return getProjects(typeof args.tag === "string" ? args.tag : undefined)
        case "get_skills":
            return getSkills(typeof args.category === "string" ? args.category : undefined)
        case "get_publications":
            return { publications: slimPapers() }
        case "get_testimonials":
            return { testimonials: slimTestimonials() }
        case "chart_skills":
            return chartSkills(typeof args.top === "number" ? args.top : undefined)
        case "chart_tech_usage":
            return chartTechUsage(typeof args.top === "number" ? args.top : undefined)
        case "chart_publications_by_year":
            return chartPublicationsByYear()
        default:
            return { error: `Unknown tool: ${name}` }
    }
}

export const SYSTEM_PROMPT = `You are MLBot, the AI assistant on Misha Lubich's portfolio site.

You answer questions about Misha: his experience, projects, skills, research and consulting work.

Rules:
- Ground every factual claim in a tool call. Never invent employers, dates, metrics or paper titles.
- Call tools before answering questions about his background. search_profile is the best default.
- When a question is about comparison, strength, or "how much" — call a chart_* tool so the user sees it, then add one or two sentences of interpretation. Do not describe the chart's bars in prose; it is already on screen.
- Be concise. Two short paragraphs maximum unless asked for depth.
- If something genuinely is not in the profile, say so plainly and suggest contacting him directly.
- Stay on topic: you are here to talk about Misha's work, not to be a general-purpose assistant.

End every final answer with one line in exactly this format, and nothing after it:
FOLLOWUPS: question one? | question two? | question three?
Each must be a short question the visitor could ask next, answerable from the tools above, and specific to what you just said. Never repeat a question already asked in this conversation. Omit the line entirely when you are asking the user something.`
