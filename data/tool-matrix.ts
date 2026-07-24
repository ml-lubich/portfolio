/**
 * ─── Tool Comparison Matrix ────────────────────────────────────────────
 * Honest, non-exhaustive comparison across the open-source agent-family
 * CLIs/MCPs. Values are deliberately conservative: "partial" is used
 * wherever a capability is real but incomplete (e.g. relies on a
 * third-party MCP server, or requires a live cloud connection) rather
 * than rounding up to a clean yes/no.
 */

/** true = full capability · false = not present · "partial" = real but incomplete */
export type MatrixValue = boolean | "partial"

export interface ToolMatrixRow {
    id: string
    /** Display name of the CLI/tool (matches data/projects.ts id where applicable) */
    name: string
    /** Link to the project's GitHub repo */
    href: string
    localFirst: MatrixValue
    cli: MatrixValue
    mcp: MatrixValue
    /** Machine-readable command/tool contract exposed to agents (e.g. `agent schema`) */
    agentSchema: MatrixValue
    /** Short, honest note on test coverage \u2014 never a rounded-up number */
    tdd: string
    /** Where it ships: PyPI, Homebrew, npm, or local-only */
    distribution: string
    /** One-line honest comparison to the mainstream/market alternative */
    vsMarket: string
}

export const MATRIX_COLUMNS = [
    { key: "localFirst", label: "Local-first" },
    { key: "cli", label: "CLI" },
    { key: "mcp", label: "MCP" },
    { key: "agentSchema", label: "Agent schema" },
    { key: "tdd", label: "TDD" },
    { key: "distribution", label: "PyPI / Brew" },
] as const

export const toolMatrix: ToolMatrixRow[] = [
    {
        id: "imsg-mcp",
        name: "imsg-mcp",
        href: "https://github.com/ml-lubich/imsg",
        localFirst: true,
        cli: true,
        mcp: true,
        agentSchema: true,
        tdd: "\u2265 90% coverage",
        distribution: "PyPI: mac-imsg + Homebrew tap",
        vsMarket: "vs Messages.app: scriptable search/send + agent access to a GUI-only mailbox",
    },
    {
        id: "imail-mcp",
        name: "imail-mcp",
        href: "https://github.com/ml-lubich/imail",
        localFirst: true,
        cli: true,
        mcp: "partial",
        agentSchema: true,
        tdd: "\u2265 90% coverage",
        distribution: "PyPI: mac-imail + Homebrew tap",
        vsMarket: "vs Mail.app GUI: CLI + agent schema for triage that's point-and-click only today",
    },
    {
        id: "inotes-mcp",
        name: "inotes-mcp",
        href: "https://github.com/ml-lubich/inotes",
        localFirst: true,
        cli: true,
        mcp: "partial",
        agentSchema: true,
        tdd: "\u2265 90% coverage",
        distribution: "PyPI: mac-inotes + Homebrew tap",
        vsMarket: "vs Notes.app GUI: scriptable list/search/create Notes.app has no CLI for",
    },
    {
        id: "wa-mcp",
        name: "wa-mcp",
        href: "https://github.com/ml-lubich/whatsapp-mcp",
        localFirst: "partial",
        cli: true,
        mcp: true,
        agentSchema: true,
        tdd: "\u2265 90% coverage (wa-cli)",
        distribution: "PyPI: mac-wa + mac-wa-mcp; Homebrew tap",
        vsMarket: "vs WhatsApp Web/Desktop: local bridge + agent tools, no browser tab required",
    },
    {
        id: "bitbucket-cli",
        name: "bitbucket-cli",
        href: "https://github.com/ml-lubich/bitbucket-cli",
        localFirst: false,
        cli: true,
        mcp: true,
        agentSchema: false,
        tdd: "documented suite",
        distribution: "PyPI: bitbucket-client + Homebrew",
        vsMarket: "vs Atlassian web UI: gh-style terminal workflow + read-only MCP for agents",
    },
    {
        id: "twig",
        name: "twig",
        href: "https://github.com/ml-lubich/twig",
        localFirst: true,
        cli: true,
        mcp: false,
        agentSchema: true,
        tdd: "catalog + CLI tests",
        distribution: "PyPI: pipx install twig-cli",
        vsMarket: "vs raw `git worktree`: one-command create/jump/clean + JSON/agent schema on every call",
    },
    {
        id: "confluence-cli",
        name: "confluence-cli",
        href: "https://github.com/ml-lubich/confluence-cli",
        localFirst: false,
        cli: true,
        mcp: false,
        agentSchema: false,
        tdd: "documented suite",
        distribution: "npm / Homebrew tap",
        vsMarket: "vs Confluence web UI: idempotent bulk move/mirror an agent can safely re-run",
    },
]
