import { describe, it, expect } from "vitest"
import { ossDemos } from "@/data/oss-demos"
import { ossAgentTools, ossInstallFork } from "@/data/oss-agent-tools"

const INSTALL_COMMAND_RE =
  /^(brew install |pip install |pipx install |npm (?:i|install) -g |git clone )\S/

const DEMO_INSTALL: Record<string, string> = Object.fromEntries(
  ossDemos.map((d) => [d.id, d.install ?? ""]),
)

describe("ossAgentTools", () => {
  it("lists the GitHub-profile tools with short display names", () => {
    expect(ossAgentTools).toHaveLength(13)
    const names = ossAgentTools.map((t) => t.displayName)
    expect(names).toEqual([
      "imsg",
      "imail",
      "inotes",
      "wa",
      "bb",
      "confluence-cli",
      "pdfify-md",
      "jenkins-mcp",
      "twig",
      "like-fable",
      "ical",
      "vgate",
      "claude-tiers",
    ])
  })

  it("every install is copy-pasteable real package-manager syntax", () => {
    for (const tool of ossAgentTools) {
      expect(INSTALL_COMMAND_RE.test(tool.install), tool.displayName).toBe(true)
      expect(tool.install).not.toMatch(/^\$/)
      expect(tool.install).not.toContain("…")
    }
  })

  it("install strings match oss-demos.ts for the same tool", () => {
    for (const tool of ossAgentTools) {
      expect(tool.install).toBe(DEMO_INSTALL[tool.id])
    }
  })

  it("every tool links to GitHub", () => {
    for (const tool of ossAgentTools) {
      expect(tool.repoUrl).toMatch(/^https:\/\/github\.com\/ml-lubich\//)
    }
  })
})

describe("ossInstallFork", () => {
  it("starts with an explicit brew tap for USB-agent / fork checkouts", () => {
    const block = ossInstallFork()
    expect(block.split("\n")[0]).toBe("brew tap ml-lubich/tap")
  })

  it("is a copy-pasteable block with no placeholders or $ prefixes", () => {
    const block = ossInstallFork()
    for (const line of block.split("\n")) {
      expect(line.trim().length).toBeGreaterThan(0)
      expect(line).not.toMatch(/^\$/)
    }
    expect(block).toMatch(/brew install ml-lubich\/tap\/\{/)
    expect(block).toContain("jenkins-mcp-cli")
    expect(block).toContain("twig-cli")
    expect(block).toContain("pdfify-md")
    expect(block).toContain("git clone https://github.com/ml-lubich/like-fable")
  })
})
