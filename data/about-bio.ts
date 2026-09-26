import type { CycleTimings } from "@/lib/install-cycle"

/**
 * The About terminal rewrites itself from this bank: type a bio, hold it,
 * erase it, type the next — forever. Every fact here already appears
 * elsewhere on the site (About tiles, hero stats, projects); nothing new is
 * claimed in the terminal alone. Lines stay ≤ 70 chars so each fits one row
 * beside the portrait. The first bio leads with the current role.
 */
export const BIO_SCRIPTS: string[][] = [
    [
        "EchoStar — Staff AI in under 3 years · consumer telecom.",
        "Before: Polaris Wireless, Apple, Walmart, LBNL, Honda Innovations.",
        "300M+ customers reached · $100M+ Walmart ad-tech revenue · 6 papers.",
        "Co-founded Equiverse.ml — tools for 5,000+ underrepresented students.",
    ],
    [
        "Staff AI Engineer @ EchoStar — agents + RAG at telecom scale.",
        "5+ years shipping production ML and large-scale systems.",
        "Apple: ML inference serving 100M+ users.",
        "Walmart: cloud-native microservices · $100M+ ad-tech revenue.",
    ],
    [
        "UC Berkeley — B.A. Computer Science.",
        "6 peer-reviewed papers: ML for hydrology + environmental science.",
        "ML pipelines at Lawrence Berkeley National Lab.",
        "Also: Honda Innovations, Polaris Wireless.",
    ],
    [
        "Off-hours: local-first CLIs that double as MCP servers.",
        "imsg · imail · inotes · wa-mcp · jenkins-mcp · ical · vgate.",
        "Rust hot path via PyO3 — imsg search 3.4x faster.",
        "Built for Claude, Cursor, and VS Code. No cloud, no login.",
    ],
    [
        "Led cross-functional ML, backend, and infra teams.",
        "Mentor — code review standards, Agile delivery.",
        "Models in production reaching 100M+ users.",
        "99.9% uptime SLAs held.",
    ],
    [
        "Now: Staff AI Engineer, EchoStar · SF Bay Area.",
        "Reached staff level in under 3 years.",
        "Co-founded Equiverse.ml for 5,000+ underrepresented students.",
        "Want to talk? Book a call at mishalubich.com.",
    ],
]

/** Slower hold than the install marquee — a bio is four lines to read, not one command. */
export const BIO_CYCLE: CycleTimings = {
    typeMs: 22,
    holdMs: 4200,
    eraseMs: 5,
    gapMs: 450,
}
