/**
 * Terminal-demo data for the Open Source showcase.
 * Public `ml-lubich` projects only. Gradient/accent/diagramType are NOT
 * duplicated here — the card looks them up on `projects` by `id`.
 */

import type { Line } from "@/components/terminal/types"

export interface OssDemo {
    id: string
    repoUrl: string
    packageUrl?: string
    install?: string
    tagline: string
    badge?: string
    demo: Line[]
    stats: { label: string; value: string }[]
}

export const ossDemos: OssDemo[] = [
    {
        id: "imsg-mcp",
        repoUrl: "https://github.com/ml-lubich/imsg",
        install: "pip install mac-imsg",
        tagline: "Local iMessage CLI + MCP server, Rust-accelerated search",
        badge: "Rust core",
        demo: [
            { t: "cmd", s: "imsg search \"dinner tonight\" --limit 3" },
            { t: "out", s: "[2026-07-18 19:42] Sam: dinner tonight? thinking the new ramen spot" },
            { t: "out", s: "[2026-07-18 19:44] Sam: 7pm work for you?" },
            { t: "out", s: "3.4x faster than the pure-Python fallback (50k-message benchmark)" },
            { t: "gap", s: "" },
            { t: "cmd", s: "imsg doctor" },
            { t: "out", s: "chat.db: readable  |  Full Disk Access: granted  |  Rust core: loaded" },
        ],
        stats: [
            { label: "Search speedup", value: "3.4x" },
            { label: "Test coverage", value: "≥ 90%" },
        ],
    },
    {
        id: "imail-mcp",
        repoUrl: "https://github.com/ml-lubich/imail",
        install: "PyPI: mac-imail",
        tagline: "Local Apple Mail CLI with hard work/personal account walls",
        demo: [
            { t: "cmd", s: "imail accounts" },
            { t: "out", s: "google      michaelle.lubich@gmail.com   [PERSONAL]" },
            { t: "out", s: "exchange    mlubich@work.example.com     [WORK]" },
            { t: "gap", s: "" },
            { t: "cmd", s: "imail agent schema | jq '.commands | length'" },
            { t: "out", s: "14" },
        ],
        stats: [
            { label: "Account walls", value: "2" },
            { label: "Distribution", value: "PyPI" },
        ],
    },
    {
        id: "inotes-mcp",
        repoUrl: "https://github.com/ml-lubich/inotes",
        install: "PyPI: mac-inotes",
        tagline: "Local Apple Notes CLI with an agent-schema command surface",
        demo: [
            { t: "cmd", s: "inotes search \"grocery list\"" },
            { t: "out", s: "1. Grocery List          Shopping        edited 2h ago" },
            { t: "out", s: "2. Grocery List (Costco)  Shopping        edited 3d ago" },
            { t: "gap", s: "" },
            { t: "cmd", s: "inotes agent guide --format md | head -1" },
            { t: "out", s: "# inotes agent guide — command contract for LLM tool-calling" },
        ],
        stats: [
            { label: "Type", value: "CLI + agent schema" },
            { label: "Distribution", value: "PyPI" },
        ],
    },
    {
        id: "wa-mcp",
        repoUrl: "https://github.com/ml-lubich/whatsapp-mcp",
        tagline: "Ops CLI for the open-source WhatsApp MCP bridge",
        demo: [
            { t: "cmd", s: "wa doctor" },
            { t: "out", s: "bridge (Go/whatsmeow): running   |  WhatsApp session: authenticated" },
            { t: "out", s: "MCP server: running   |  local SQLite store: reachable" },
            { t: "gap", s: "" },
            { t: "cmd", s: "wa status" },
            { t: "out", s: "up 2 daemons — bridge:8080  mcp-server:stdio" },
        ],
        stats: [
            { label: "Daemons managed", value: "2" },
            { label: "Type", value: "Ops CLI" },
        ],
    },
    {
        id: "bitbucket-cli",
        repoUrl: "https://github.com/ml-lubich/bitbucket-cli",
        install: "PyPI: bitbucket-client",
        tagline: "gh-style Bitbucket CLI with a built-in read-only MCP server",
        demo: [
            { t: "cmd", s: "bb pr list --json" },
            { t: "code", s: "[{\"id\": 142, \"title\": \"fix: retry token refresh\", \"state\": \"OPEN\"}]" },
            { t: "gap", s: "" },
            { t: "cmd", s: "bb mcp serve" },
            { t: "out", s: "read-only MCP server listening on stdio (whoami, repo, pr, issue, pipeline)" },
        ],
        stats: [
            { label: "Surfaces", value: "CLI + MCP" },
            { label: "Distribution", value: "PyPI" },
        ],
    },
    {
        id: "twig",
        repoUrl: "https://github.com/ml-lubich/twig",
        install: "pipx install twig-cli",
        tagline: "Agent-first Git worktree CLI with a Rust hot path",
        badge: "Rust core",
        demo: [
            { t: "cmd", s: "twig create feature-x" },
            { t: "out", s: "created worktree ../repo.feature-x on branch feature-x" },
            { t: "gap", s: "" },
            { t: "cmd", s: "twig ls --json | jq length" },
            { t: "out", s: "4" },
        ],
        stats: [
            { label: "Install", value: "pipx" },
            { label: "Type", value: "CLI" },
        ],
    },
    {
        id: "confluence-cli",
        repoUrl: "https://github.com/ml-lubich/confluence-cli",
        tagline: "Bulk Confluence move/delete and idempotent mirror, safe for AI agents",
        demo: [
            { t: "cmd", s: "confluence-cli move --page-id 4021 --to-parent 3100" },
            { t: "out", s: "moved page 4021 under parent 3100" },
            { t: "gap", s: "" },
            { t: "cmd", s: "confluence-cli mirror --space KB --dry-run" },
            { t: "out", s: "would sync 214 pages, 0 conflicts (idempotent re-run)" },
        ],
        stats: [
            { label: "Pages mirrored", value: "214" },
            { label: "Type", value: "CLI" },
        ],
    },
    {
        id: "like-fable",
        repoUrl: "https://github.com/ml-lubich/like-fable",
        tagline: "Portable, model-agnostic prompt library for agent operating behavior",
        demo: [
            { t: "hdr", s: "modules/" },
            { t: "out", s: "communication.md  judgment.md  honesty.md" },
            { t: "out", s: "collaboration.md  craft.md      defaults.md" },
            { t: "gap", s: "" },
            { t: "cmd", s: "cat prompt.md | pbcopy" },
            { t: "out", s: "copied prompt.md to clipboard — paste into any model's instructions slot" },
        ],
        stats: [
            { label: "Modules", value: "6" },
            { label: "Models supported", value: "Any" },
        ],
    },
]
