/**
 * Grid data for the Open-Source Agent Tools panel — display names and copy
 * match the GitHub profile TOOLS array; install strings follow oss-demos.ts.
 */

import { ossDemos } from "@/data/oss-demos"

export interface OssAgentTool {
  /** oss-demos id — used for accent lookup and repo links */
  id: string
  /** Short label on the card (imsg, bb, …) */
  displayName: string
  description: string
  /** Environment / stack pill */
  tag: string
  install: string
  repoUrl: string
}

const DEMO_BY_ID = Object.fromEntries(ossDemos.map((d) => [d.id, d])) as Record<
  string,
  (typeof ossDemos)[number]
>

/** Card metadata keyed by oss-demos id */
const META: Record<string, { displayName: string; description: string; tag: string }> = {
  "imsg-mcp": {
    displayName: "imsg",
    description: "iMessage CLI + MCP · Rust-accelerated",
    tag: "macOS",
  },
  "imail-mcp": {
    displayName: "imail",
    description: "Apple Mail CLI + MCP · guarded LLM auto-reply agent",
    tag: "macOS",
  },
  "inotes-mcp": {
    displayName: "inotes",
    description: "Apple Notes CLI + MCP",
    tag: "macOS",
  },
  "wa-mcp": {
    displayName: "wa",
    description: "WhatsApp CLI + MCP · imsg pattern",
    tag: "Go · Py",
  },
  "bitbucket-cli": {
    displayName: "bb",
    description: "gh-style Bitbucket CLI + read-only MCP",
    tag: "Cloud · DC",
  },
  "confluence-cli": {
    displayName: "confluence-cli",
    description: "Confluence bulk ops, agent-safe",
    tag: "Node",
  },
  "pdfify-md": {
    displayName: "pdfify-md",
    description: "Markdown / Mermaid → clean PDF · CLI + library",
    tag: "TypeScript",
  },
  "jenkins-mcp": {
    displayName: "jenkins-mcp",
    description: "Jenkins CLI + MCP server",
    tag: "Py",
  },
  twig: {
    displayName: "twig",
    description: "git worktrees for humans & agent swarms",
    tag: "Py · Rust",
  },
  "like-fable": {
    displayName: "like-fable",
    description: "portable prompt library for any AI",
    tag: "prompts",
  },
  "ical-cli": {
    displayName: "ical",
    description: "Calendar.app CLI + MCP",
    tag: "macOS",
  },
  vgate: {
    displayName: "vgate",
    description: "Switch Vercel CLI logins · CLI + MCP",
    tag: "Py",
  },
  "claude-tiers": {
    displayName: "claude-tiers",
    description: "Model-tiered ruleset · Claude Code plugin marketplace",
    tag: "ruleset",
  },
}

const ORDER = [
  "imsg-mcp",
  "imail-mcp",
  "inotes-mcp",
  "wa-mcp",
  "bitbucket-cli",
  "confluence-cli",
  "pdfify-md",
  "jenkins-mcp",
  "twig",
  "like-fable",
  "ical-cli",
  "vgate",
  "claude-tiers",
] as const

export const ossAgentTools: OssAgentTool[] = ORDER.map((id) => {
  const demo = DEMO_BY_ID[id]
  const meta = META[id]
  if (!demo?.install || !meta) {
    throw new Error(`oss-agent-tools: missing demo or meta for ${id}`)
  }
  return {
    id,
    displayName: meta.displayName,
    description: meta.description,
    tag: meta.tag,
    install: demo.install,
    repoUrl: demo.repoUrl,
  }
})

/** USB-agent / fork checkout — explicit tap before any brew install. */
export function ossInstallFork(): string {
  const lines: string[] = ["brew tap ml-lubich/tap"]

  const brewPkgs = ossAgentTools
    .map((t) => t.install)
    .filter((cmd) => cmd.startsWith("brew install ml-lubich/tap/"))
    .map((cmd) => cmd.replace("brew install ml-lubich/tap/", ""))

  if (brewPkgs.length) {
    lines.push(
      brewPkgs.length === 1
        ? `brew install ml-lubich/tap/${brewPkgs[0]}`
        : `brew install ml-lubich/tap/{${brewPkgs.join(",")}}`,
    )
  }

  for (const tool of ossAgentTools) {
    if (tool.install.startsWith("pip install ")) lines.push(tool.install)
    if (tool.install.startsWith("pipx install ")) lines.push(tool.install)
    if (tool.install.startsWith("npm i -g ") || tool.install.startsWith("npm install -g ")) {
      lines.push(tool.install)
    }
    if (tool.install.startsWith("git clone ")) lines.push(tool.install)
  }

  return lines.join("\n")
}
