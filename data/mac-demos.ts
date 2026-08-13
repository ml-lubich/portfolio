/**
 * ─── macOS app demos ──────────────────────────────────────────────────
 * Scripted walkthroughs of the local-first Mac tools driving the real apps
 * they target: Messages via `imsg`, Mail via `imail`, Notes via `inotes`.
 *
 * A terminal transcript shows the command; it does not show the thing the
 * command touched. These pair each command with the app state it produced,
 * which is the actual claim these tools make.
 *
 * All three apps are list/detail, so one window component renders all of
 * them from this data rather than three bespoke mockups.
 *
 * The content is illustrative, not a capture of anyone's real mailbox or
 * message history — fictional correspondents throughout.
 */

export interface MacRow {
    title: string
    preview: string
    meta?: string
    /** Renders the unread dot. */
    unread?: boolean
    /** Coloured tag chip, used by the Mail triage demo. */
    tag?: string
}

export interface MacBubble {
    from: "me" | "them"
    text: string
}

export interface MacDetail {
    title: string
    subtitle?: string
    /** Messages-style transcript. */
    bubbles?: MacBubble[]
    /** Mail / Notes body copy. */
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
    repoUrl: string
    tagline: string
    /** Sidebar heading inside the window. */
    sidebarTitle: string
    steps: MacDemoStep[]
}

export const macDemos: MacDemo[] = [
    {
        id: "imsg-mcp",
        app: "Messages",
        tool: "imsg",
        repoUrl: "https://github.com/ml-lubich/imsg",
        tagline: "Search and send iMessage from the terminal — local chat.db, no cloud relay.",
        sidebarTitle: "Conversations",
        steps: [
            {
                command: 'imsg search "ramen" --limit 3',
                caption: "Full-text search across the local chat.db — Rust core, no network call.",
                activeRow: 0,
                rows: [
                    { title: "Sam Ortiz", preview: "7pm work for you?", meta: "19:44", unread: true },
                    { title: "Dana Reyes", preview: "sent the deck over", meta: "18:02" },
                    { title: "Standup", preview: "moved to 9:30", meta: "Mon" },
                ],
                detail: {
                    title: "Sam Ortiz",
                    subtitle: "3 matches for “ramen”",
                    bubbles: [
                        { from: "them", text: "dinner tonight? thinking the new ramen spot" },
                        { from: "them", text: "7pm work for you?" },
                    ],
                },
            },
            {
                command: 'imsg send "Sam Ortiz" "7pm works — booking it"',
                caption: "Sends through Messages.app itself, so it lands as a real iMessage.",
                activeRow: 0,
                rows: [
                    { title: "Sam Ortiz", preview: "7pm works — booking it", meta: "19:46" },
                    { title: "Dana Reyes", preview: "sent the deck over", meta: "18:02" },
                    { title: "Standup", preview: "moved to 9:30", meta: "Mon" },
                ],
                detail: {
                    title: "Sam Ortiz",
                    bubbles: [
                        { from: "them", text: "dinner tonight? thinking the new ramen spot" },
                        { from: "them", text: "7pm work for you?" },
                        { from: "me", text: "7pm works — booking it" },
                    ],
                },
            },
            {
                command: "imsg doctor",
                caption: "Preflight check: database readable, Full Disk Access granted, Rust core loaded.",
                activeRow: 0,
                rows: [
                    { title: "Sam Ortiz", preview: "7pm works — booking it", meta: "19:46" },
                    { title: "Dana Reyes", preview: "sent the deck over", meta: "18:02" },
                    { title: "Standup", preview: "moved to 9:30", meta: "Mon" },
                ],
                detail: {
                    title: "Diagnostics",
                    subtitle: "imsg doctor",
                    body: [
                        "chat.db — readable",
                        "Full Disk Access — granted",
                        "Rust search core — loaded",
                        "3.4× faster than the pure-Python fallback (50k-message benchmark)",
                    ],
                },
            },
        ],
    },
    {
        id: "imail-mcp",
        app: "Mail",
        tool: "imail",
        repoUrl: "https://github.com/ml-lubich/imail",
        tagline: "Triage Apple Mail from the CLI, with hard walls between accounts.",
        sidebarTitle: "Inbox",
        steps: [
            {
                command: "imail accounts",
                caption: "Every account is tagged. Cross-account operations are refused, not merely discouraged.",
                activeRow: 0,
                rows: [
                    { title: "Recruiting — Northwind", preview: "Senior AI Engineer role", meta: "09:12", unread: true, tag: "PERSONAL" },
                    { title: "CI: build #4821", preview: "All checks passed", meta: "08:40", tag: "WORK" },
                    { title: "Invoice 2291", preview: "Payment received", meta: "Tue", tag: "PERSONAL" },
                ],
                detail: {
                    title: "Configured accounts",
                    subtitle: "imail accounts",
                    body: [
                        "google      michaelle.lubich@gmail.com     [PERSONAL]",
                        "exchange    mlubich@work.example.com       [WORK]",
                        "",
                        "Sends require --from. A WORK thread can never be replied to from a PERSONAL address.",
                    ],
                },
            },
            {
                command: "imail organize --account google --limit 400",
                caption: "Classifies and files the backlog, surfacing only what needs a human.",
                activeRow: 0,
                rows: [
                    { title: "Recruiting — Northwind", preview: "Senior AI Engineer role", meta: "09:12", unread: true, tag: "ACTION" },
                    { title: "CI: build #4821", preview: "All checks passed", meta: "08:40", tag: "ARCHIVED" },
                    { title: "Invoice 2291", preview: "Payment received", meta: "Tue", tag: "ARCHIVED" },
                ],
                detail: {
                    title: "Recruiting — Northwind",
                    subtitle: "flagged: needs a reply",
                    body: [
                        "400 messages scanned · 372 filed · 28 left in the inbox",
                        "",
                        "Kept: 24 needing a reply, 4 with a meeting to confirm.",
                        "Everything else was routed to a folder by rule, not deleted.",
                    ],
                },
            },
            {
                command: "imail agent schema | jq '.commands | length'",
                caption: "Ships a machine-readable contract, so an agent can drive it without scraping --help.",
                activeRow: 0,
                rows: [
                    { title: "Recruiting — Northwind", preview: "Senior AI Engineer role", meta: "09:12", tag: "ACTION" },
                    { title: "CI: build #4821", preview: "All checks passed", meta: "08:40", tag: "ARCHIVED" },
                    { title: "Invoice 2291", preview: "Payment received", meta: "Tue", tag: "ARCHIVED" },
                ],
                detail: {
                    title: "Agent schema",
                    subtitle: "14 commands",
                    body: [
                        "14",
                        "",
                        "Each command declares its arguments, account scope and side effects,",
                        "so the MCP server exposes them as typed tools with no glue code.",
                    ],
                },
            },
        ],
    },
    {
        id: "inotes-mcp",
        app: "Notes",
        tool: "inotes",
        repoUrl: "https://github.com/ml-lubich/inotes",
        tagline: "Read and write Apple Notes as Markdown, straight from the shell.",
        sidebarTitle: "Folders",
        steps: [
            {
                command: 'inotes search "portfolio"',
                caption: "Searches note bodies, not just titles, across every folder.",
                activeRow: 1,
                rows: [
                    { title: "Quick Notes", preview: "12 notes", meta: "" },
                    { title: "Engineering", preview: "31 notes", meta: "" },
                    { title: "Reading", preview: "8 notes", meta: "" },
                ],
                detail: {
                    title: "Portfolio — rebuild plan",
                    subtitle: "Engineering · edited 2 days ago",
                    body: [
                        "2 matches in Engineering",
                        "",
                        "• Portfolio — rebuild plan",
                        "• Portfolio — copy pass",
                    ],
                },
            },
            {
                command: 'inotes create "Release checklist" --folder Engineering --markdown',
                caption: "Creates a real Notes item; Markdown is converted to native rich text.",
                activeRow: 1,
                rows: [
                    { title: "Quick Notes", preview: "12 notes", meta: "" },
                    { title: "Engineering", preview: "32 notes", meta: "" },
                    { title: "Reading", preview: "8 notes", meta: "" },
                ],
                detail: {
                    title: "Release checklist",
                    subtitle: "Engineering · just now",
                    body: [
                        "Pre-flight",
                        "  ☐ Tests green on main",
                        "  ☐ Env vars set in production",
                        "  ☐ Rotate any key that touched a transcript",
                        "",
                        "Checklists round-trip: ☐/☑ map to native Notes checkboxes.",
                    ],
                },
            },
            {
                command: 'inotes get-note-markdown "Release checklist"',
                caption: "Reads it back out as Markdown, so notes stay diffable and scriptable.",
                activeRow: 1,
                rows: [
                    { title: "Quick Notes", preview: "12 notes", meta: "" },
                    { title: "Engineering", preview: "32 notes", meta: "" },
                    { title: "Reading", preview: "8 notes", meta: "" },
                ],
                detail: {
                    title: "Release checklist.md",
                    subtitle: "round-tripped",
                    body: [
                        "## Pre-flight",
                        "- [ ] Tests green on main",
                        "- [ ] Env vars set in production",
                        "- [ ] Rotate any key that touched a transcript",
                    ],
                },
            },
        ],
    },
]
