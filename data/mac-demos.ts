/**
 * ─── macOS app demos ──────────────────────────────────────────────────
 * Scripted walkthroughs of public agent tools driving the apps they target.
 *
 * A terminal transcript shows the command; it does not show the thing the
 * command touched. These pair each command with the app state it produced,
 * which is the actual claim these tools make.
 *
 * One window component renders the remaining demonstrations from this data.
 *
 * The content is illustrative, not a capture of anyone's real mailbox or
 * message history — fictional correspondents throughout.
 */

/** Visual skin for the mini app window — each maps to authentic app chrome in CSS. */
export type MacDemoSkin = "whatsapp" | "bitbucket" | "jenkins"

export interface MacRow {
    title: string
    preview: string
    meta?: string
    /** Renders the unread dot. */
    unread?: boolean
    /** Coloured tag chip. */
    tag?: string
    /** Jenkins job status orb. */
    status?: "success" | "failure" | "idle" | "running"
}

export interface MacBubble {
    from: "me" | "them"
    text: string
}

export interface MacDetail {
    title: string
    subtitle?: string
    /** Chat transcript. */
    bubbles?: MacBubble[]
    /** Detail body copy. */
    body?: string[]
}

export interface MacDemoStep {
    /** The command that produced this state. */
    command: string
    /** One line on what the tool just did. */
    caption: string
    /** Index into `rows` that is selected. */
    activeRow: number
    rows: MacRow[]
    detail: MacDetail
}

export interface MacDemo {
    id: string
    /** macOS app being driven. */
    app: string
    /** CLI that drives it. */
    tool: string
    /** Mini-demo chrome for the app being demonstrated. */
    skin: MacDemoSkin
    repoUrl: string
    tagline: string
    /** Sidebar heading inside the window. */
    sidebarTitle: string
    steps: MacDemoStep[]
}

export const macDemos: MacDemo[] = [
    {
        id: "wa-mcp",
        app: "WhatsApp",
        tool: "wa",
        skin: "whatsapp",
        repoUrl: "https://github.com/ml-lubich/whatsapp-mcp",
        tagline: "Ops CLI for the open-source WhatsApp MCP bridge — Go/whatsmeow under it.",
        sidebarTitle: "Chats",
        steps: [
            {
                command: "wa doctor",
                caption: "Preflight on both daemons before an agent is allowed anywhere near a thread.",
                activeRow: 0,
                rows: [
                    { title: "Priya Raman", preview: "can you send the invoice today?", meta: "09:12", unread: true },
                    { title: "Site crew", preview: "materials landed", meta: "08:40" },
                    { title: "Marco Silva", preview: "call at 4?", meta: "Tue" },
                ],
                detail: {
                    title: "Diagnostics",
                    subtitle: "wa doctor",
                    body: [
                        "bridge (Go/whatsmeow) — running",
                        "WhatsApp session — authenticated",
                        "MCP server — running",
                        "local SQLite store — reachable",
                    ],
                },
            },
            {
                command: 'wa send "Priya Raman" "invoice is in your inbox"',
                caption: "The reply goes out over the bridge, so it lands as a real WhatsApp message.",
                activeRow: 0,
                rows: [
                    { title: "Priya Raman", preview: "invoice is in your inbox", meta: "09:15" },
                    { title: "Site crew", preview: "materials landed", meta: "08:40" },
                    { title: "Marco Silva", preview: "call at 4?", meta: "Tue" },
                ],
                detail: {
                    title: "Priya Raman",
                    bubbles: [
                        { from: "them", text: "can you send the invoice today?" },
                        { from: "me", text: "invoice is in your inbox" },
                    ],
                },
            },
        ],
    },
    {
        id: "bitbucket-cli",
        app: "Bitbucket",
        tool: "bb",
        skin: "bitbucket",
        repoUrl: "https://github.com/ml-lubich/bitbucket-cli",
        tagline: "gh-style Bitbucket CLI with a built-in read-only MCP server for agents.",
        sidebarTitle: "Pull requests",
        steps: [
            {
                command: "bb pr list --json",
                caption: "Structured output first — an agent reads JSON, not a scraped web page.",
                activeRow: 0,
                rows: [
                    { title: "#142 retry token refresh", preview: "fix · 2 approvals", meta: "OPEN", unread: true },
                    { title: "#139 split ingest worker", preview: "feat · 1 approval", meta: "OPEN" },
                    { title: "#137 bump pinned deps", preview: "chore · merged", meta: "DONE" },
                ],
                detail: {
                    title: "#142 fix: retry token refresh",
                    subtitle: "bb pr list --json",
                    body: [
                        '[{ "id": 142, "title": "fix: retry token refresh", "state": "OPEN" }]',
                        "2 approvals · pipeline green · no merge conflicts",
                    ],
                },
            },
            {
                command: "bb mcp serve",
                caption: "The same surface, exposed read-only over MCP — agents can look, not touch.",
                activeRow: 0,
                rows: [
                    { title: "#142 retry token refresh", preview: "fix · 2 approvals", meta: "OPEN" },
                    { title: "#139 split ingest worker", preview: "feat · 1 approval", meta: "OPEN" },
                    { title: "#137 bump pinned deps", preview: "chore · merged", meta: "DONE" },
                ],
                detail: {
                    title: "MCP server",
                    subtitle: "read-only, stdio transport",
                    body: [
                        "listening on stdio",
                        "tools: whoami · repo · pr · issue · pipeline",
                        "no write verbs registered — by design",
                    ],
                },
            },
        ],
    },
    {
        id: "jenkins-mcp",
        app: "Jenkins",
        tool: "jenkins-mcp",
        skin: "jenkins",
        repoUrl: "https://github.com/ml-lubich/jenkins-mcp",
        tagline: "Drive Jenkins from an agent: trigger builds, tail logs, manage nodes.",
        sidebarTitle: "Jobs",
        steps: [
            {
                command: "jenkins-mcp jenkins_list_jobs",
                caption: "Job inventory in one call, so the agent picks a target instead of guessing.",
                activeRow: 1,
                rows: [
                    { title: "api-service", preview: "last build #418", meta: "12m", status: "success" },
                    { title: "ingest-worker", preview: "last build #96", meta: "4m", unread: true, status: "failure" },
                    { title: "nightly-e2e", preview: "scheduled 02:00", meta: "8h", status: "idle" },
                ],
                detail: {
                    title: "ingest-worker",
                    subtitle: "3 jobs discovered",
                    body: [
                        "api-service — #418 SUCCESS",
                        "ingest-worker — #96 FAILURE",
                        "nightly-e2e — idle, next run 02:00",
                    ],
                },
            },
            {
                command: "jenkins-mcp jenkins_build_log_tail --job ingest-worker",
                caption: "Tails the failing build so the failure text lands in context, not a browser tab.",
                activeRow: 1,
                rows: [
                    { title: "api-service", preview: "last build #418", meta: "12m", status: "success" },
                    { title: "ingest-worker", preview: "last build #96", meta: "4m", status: "failure" },
                    { title: "nightly-e2e", preview: "scheduled 02:00", meta: "8h", status: "idle" },
                ],
                detail: {
                    title: "ingest-worker #96",
                    subtitle: "tail -n 40",
                    body: [
                        "pytest tests/test_backfill.py::test_resume — FAILED",
                        "AssertionError: cursor advanced past the last acked offset",
                        "Build step 'Execute shell' marked build as failure",
                    ],
                },
            },
        ],
    },
]
