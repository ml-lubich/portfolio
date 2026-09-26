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

/** A consultation hand-off. Not a confirmed booking: the visitor still picks a
 *  slot on the real calendar. Claiming otherwise would be a fabricated record. */
export interface BookingSpec {
    topic: string
    durationMin: number
    /** Misha's real Google Calendar booking page. */
    url: string
    /** What the visitor said they wanted, echoed back for confirmation. */
    summary: string
}

/** The resume hand-off. A file, not a claim — the card links the PDF that
 *  ships in `public/`, so the model never has to recite its contents. */
export interface ResumeSpec {
    role: string
    /** Served from the repo; hotlinking a file outside it would 404 in prod. */
    url: string
    filename: string
    summary: string
}

/** A way to reach Misha. The site hands the visitor an action; it never sends
 *  mail on their behalf, so nothing here can be forged into an outbound email. */
export interface ContactSpec {
    email: string
    mailto: string
    linkedin: string
    github: string
    x: string
    summary: string
}

export type ToolResult =
    | Record<string, unknown>
    | { chart: ChartSpec }
    | { booking: BookingSpec }
    | { resume: ResumeSpec }
    | { contact: ContactSpec }

/** Single source of truth — same link as the hero "Schedule Call" CTA. */
export const BOOKING_URL = "https://calendar.app.google/T2VGkBsBAUzGABRB7"

/** The SWE cut, copied into `public/` from ~/dev/resumes — role: Software
 *  Engineer, and the only SWE variant that carries the EchoStar role. */
export const RESUME_URL = "/resume_mlubich_swe.pdf"

/** The address already published in the contact section and the footer. */
export const CONTACT_EMAIL = "michaelle.lubich@gmail.com"
export const LINKEDIN_URL = "https://www.linkedin.com/in/misha-lubich/"
export const GITHUB_URL = "https://github.com/ml-lubich"
export const X_URL = "https://x.com/Machine_Lubich"

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
            name: "request_consultation",
            description:
                "Open Misha's booking calendar for the visitor. Call this the moment someone wants to book a call, hire him, discuss consulting, ask about availability, rates, or working together. Do not ask for their email — the calendar collects it.",
            parameters: {
                type: "object",
                properties: {
                    topic: {
                        type: "string",
                        description: "Short subject line, e.g. 'RAG pipeline for internal docs'",
                    },
                    durationMin: {
                        type: "number",
                        description: "15 for a quick intro, 30 for a scoping call. Default 30.",
                    },
                    summary: {
                        type: "string",
                        description: "One sentence restating what the visitor is looking for.",
                    },
                },
                required: ["topic"],
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
    {
        type: "function",
        function: {
            name: "get_resume",
            description:
                "Hand the visitor Misha's resume as a downloadable PDF. Call this whenever someone asks for a resume, CV, one-pager, or 'can I get your background as a file'.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "get_contact",
            description:
                "Hand the visitor Misha's real contact details — email, LinkedIn, GitHub. Call this when someone asks how to get in touch, reach out, email him, or send something over. For booking a call use request_consultation instead.",
            parameters: {
                type: "object",
                properties: {
                    reason: {
                        type: "string",
                        description: "One short phrase for what they want to discuss, used to prefill the email subject.",
                    },
                },
            },
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

/** Question words and the visitor's name drown the one useful term.
 *  "What has Misha built with agents?" must search like "agents". */
const SEARCH_STOPWORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "from",
    "with",
    "about",
    "what",
    "whats",
    "which",
    "who",
    "where",
    "when",
    "why",
    "how",
    "has",
    "have",
    "had",
    "does",
    "did",
    "do",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "misha",
    "lubich",
    "his",
    "he",
    "him",
    "this",
    "that",
    "these",
    "those",
    "built",
    "build",
    "made",
    "make",
    "using",
    "use",
    "used",
    "can",
    "could",
    "would",
    "should",
    "your",
    "my",
    "me",
    "you",
    "we",
])

/** Tokens a visitor question actually means. "agents" also yields "agent"
 *  so Case Triage Agent / agentic work rank; stopwords are dropped. */
export function searchTerms(query: string): string[] {
    const raw = query.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean)
    const terms = new Set<string>()
    for (const token of raw) {
        if (SEARCH_STOPWORDS.has(token) || token.length < 2) continue
        terms.add(token)
        if (token.endsWith("s") && token.length > 4) {
            const stem = token.slice(0, -1)
            if (!SEARCH_STOPWORDS.has(stem) && stem.length >= 2) terms.add(stem)
        }
    }
    return [...terms]
}

function searchProfile(query: string): ToolResult {
    const terms = searchTerms(query)
    if (terms.length === 0) return { matches: [] }

    const hit = (haystack: string) => {
        const h = haystack.toLowerCase()
        return terms.filter((t) => h.includes(t)).length
    }
    /* A name hit beats a mention in the body. "agents" in Case Triage Agent
     * outranks a role whose summary merely says "agent orchestration". */
    const score = (title: string, body: string) => {
        const s = hit(title) * 2 + hit(body)
        return s
    }

    type Scored = { score: number; kind: string; item: unknown }
    const scored: Scored[] = []

    for (const e of slimExperience()) {
        const s = score(e.role, `${e.company} ${e.summary} ${e.tech.join(" ")}`)
        if (s) scored.push({ score: s, kind: "experience", item: e })
    }
    for (const p of slimProjects()) {
        const s = score(p.name, `${p.summary} ${p.metric} ${p.tech.join(" ")}`)
        if (s) scored.push({ score: s, kind: "project", item: p })
    }
    for (const c of skillCategories) {
        const s = score(c.category, `${c.items.join(" ")} ${c.backDetails.join(" ")}`)
        if (s) scored.push({ score: s, kind: "skill", item: { category: c.category, items: c.items } })
    }
    for (const p of slimPapers()) {
        const s = score(p.title, `${p.venue} ${p.summary}`)
        if (s) scored.push({ score: s, kind: "publication", item: p })
    }
    for (const t of slimTestimonials()) {
        const s = score(t.name, `${t.quote} ${t.organization}`)
        if (s) scored.push({ score: s, kind: "testimonial", item: t })
    }

    scored.sort((a, b) => b.score - a.score)
    return { matches: scored.slice(0, 8).map(({ kind, item }) => ({ kind, ...(item as object) })) }
}

function getProjects(tag?: string): ToolResult {
    const all = slimProjects()
    if (!tag) return { projects: all }
    const terms = searchTerms(tag)
    if (!terms.length) return { projects: all }
    return {
        projects: all.filter((p) => {
            const hay = `${p.name} ${p.summary} ${p.tech.join(" ")}`.toLowerCase()
            return terms.some((t) => hay.includes(t))
        }),
    }
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

function requestConsultation(args: Record<string, unknown>): ToolResult {
    const topic = typeof args.topic === "string" && args.topic.trim() ? args.topic.trim() : "Consulting enquiry"
    const raw = typeof args.durationMin === "number" ? args.durationMin : 30
    // Only the two slot lengths the calendar actually offers.
    const durationMin = raw <= 20 ? 15 : 30
    const summary =
        typeof args.summary === "string" && args.summary.trim()
            ? args.summary.trim().slice(0, 200)
            : "Wants to talk through a project with Misha."
    return { booking: { topic: topic.slice(0, 90), durationMin, url: BOOKING_URL, summary } }
}

function getResume(): ToolResult {
    return {
        resume: {
            role: "Software Engineer",
            url: RESUME_URL,
            filename: "Misha-Lubich-Resume.pdf",
            summary: "Backend and AI engineering — EchoStar, ex-Apple, ex-Walmart. One page, PDF.",
        },
    }
}

function getContact(args: Record<string, unknown>): ToolResult {
    const reason = typeof args.reason === "string" ? args.reason.trim().slice(0, 80) : ""
    const subject = reason ? `${reason} — via mishalubich.com` : "Hello from mishalubich.com"
    return {
        contact: {
            email: CONTACT_EMAIL,
            mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`,
            linkedin: LINKEDIN_URL,
            github: GITHUB_URL,
            x: X_URL,
            summary: "Email reaches him directly — the site does not send anything on your behalf.",
        },
    }
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
        case "request_consultation":
            return requestConsultation(args)
        case "get_resume":
            return getResume()
        case "get_contact":
            return getContact(args)
        default:
            return { error: `Unknown tool: ${name}` }
    }
}

export const SYSTEM_PROMPT = `You are MLBot, the AI assistant on Misha Lubich's portfolio site.

You answer questions about Misha: his experience, projects, skills, research and consulting work.

Rules:
- Ground every factual claim in a tool call. Never invent employers, dates, metrics or paper titles.
- Call tools before answering questions about his background. search_profile is the best default.
- After a tool returns, write the answer immediately in prose. Do not call the same tool twice. One or two lookups, then a real answer. An empty reply after tools is a failure.
- Draw first, write second. If the answer is a list of three or more things, a comparison, a breakdown, a timeline, or how something is put together — show it as a chart or a diagram and keep the prose to two or three sentences around it. Do this without being asked: "visualise it" is not a precondition, it is what the visitor should not have to say. A list of four projects is a pie or a pipeline, not four paragraphs.
- When a question is about comparison, strength, or "how much" — call a chart_* tool so the user sees it, then add one or two sentences of interpretation. Do not describe the chart's bars in prose; it is already on screen.
- For a process, architecture or before/after — anything with steps rather than numbers — draw it in a \`\`\`chart fence holding one JSON object, the same renderer the blog posts use. No prose describing the boxes; the diagram is on screen. Four shapes:
  {"type":"pipeline","title":"…","steps":[{"label":"Ingest","annotation":"S3"},{"label":"Embed"}]}
  {"type":"comparison","title":"…","left":{"title":"Before","steps":["…"]},"right":{"title":"After","steps":["…"]}}
  {"type":"tree","title":"…","steps":["Request",{"label":"Cache hit?","branches":[{"condition":"hit","steps":["Serve"]},{"condition":"miss","steps":["Fetch","Store"]}]}]} for branching flows
  {"type":"pie","title":"…","data":[{"label":"…","value":40}]}
  Keep it to 6 steps or fewer — it renders in a phone-width panel.
- Charts only ever come from the chart_* tools and the \`\`\`chart fence above — those are the only two things this panel can draw. Never draw a chart any other way: never a markdown image, never a raw HTML image tag, never Mermaid DSL types this panel does not support (e.g. xychart-beta's title/x-axis/bar lines). If a chart was already shown earlier in this conversation, do not try to re-draw it — refer back to it in words ("as the skills chart above shows, ...").
- Be concise. Two short paragraphs maximum unless asked for depth. Always finish your thoughts and complete all sentences cleanly without trailing off or getting cut off.
- If something genuinely is not in the profile, say so plainly and suggest contacting him directly.
- If the visitor wants to book a call, hire him, discuss consulting, rates or availability — call request_consultation immediately. Then write ONE sentence, and nothing else, saying Misha would be glad to talk it through. A booking card with his real calendar is already on screen, so: never write a URL or a markdown link, and never say a slot has been opened, held, reserved or booked. Nothing is reserved until the visitor picks a time themselves.
- If the visitor asks for a resume, CV or one-pager — call get_resume, then write ONE sentence and nothing else: Misha's resume is on screen and ready to download. The card carries the file, so never write the path or a markdown link yourself.
- If the visitor asks how to reach him, email him, or send something over — call get_contact, then write ONE sentence and nothing else: email is the most direct way to reach him, and LinkedIn, GitHub, and X are on the card too. The card carries the real address, so do not type it out yourself.
- If asked about his writing, blog, essays, or opinions on AI/engineering — he publishes on Substack at https://mlubich.substack.com. Latest post: "The Craft Did Not Die, It Got Repriced" (https://mlubich.substack.com/p/the-craft-did-not-die-it-got-repriced), on how AI code generation commoditized syntax work while craft moved to state design and architecture. Point to it and to the Writing section on this page (#writing). Never invent other post titles or topics.
- Stay on topic: you are here to talk about Misha's work, not to be a general-purpose assistant.
- Never write, debug, or explain code. If asked for a program, a function, a script, a bugfix, or this site's source code, refuse in one sentence and offer to talk about Misha's work instead.

End every final answer with one line in exactly this format, and nothing after it:
FOLLOWUPS: question one? | question two? | question three?
Each must be a question the visitor could ask next, answerable from the tools above, and specific to what you just said — name the actual project, role or paper rather than saying "this" or "that area".
Write each as a fragment of **eight words or fewer**, no lead-in: "AigisQuery's Rust internals?" not "Would you like to know more about the Rust components specifically?". Drop "Want to", "Curious about", "Would you like to".
Never repeat a question already asked in this conversation. Omit the line entirely when you are asking the user something.`
