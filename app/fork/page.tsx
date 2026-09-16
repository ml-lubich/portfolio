import type { Metadata } from "next"
import { CopyCommand } from "@/components/ui/copy-command"
import { OssToolGrid } from "@/components/sections/oss-tool-grid"
import { ossInstallFork } from "@/data/oss-agent-tools"

export const metadata: Metadata = {
  title: "Agent tool fork — copy-paste installs",
  description:
    "USB-agent / fork checkout install block for the ml-lubich open-source CLI and MCP tool family.",
  robots: { index: false, follow: false },
}

export default function ForkInstallPage() {
  const block = ossInstallFork()
  const lines = block.split("\n")

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-10 md:px-8">
      <div
        className="pointer-events-none absolute left-1/4 top-10 h-[320px] w-[320px] rounded-full bg-primary/10 blur-[100px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            USB-agent · fork checkout
          </p>
          <h1 className="font-display text-3xl font-light text-foreground md:text-4xl">
            Copy-paste <span className="gradient-text">agent tool installs</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground/80">
            Fresh machine or isolated checkout: tap Homebrew first, then run the family block or
            copy one tool at a time below.
          </p>
        </header>

        <div className="oss-install-fork overflow-hidden rounded-2xl border border-primary/25 bg-black/45 shadow-[0_0_40px_-16px_hsl(var(--primary)/0.4)]">
          <div className="border-b border-white/[0.08] px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Full fork install block
            </p>
          </div>
          <div className="space-y-2 p-4">
            {lines.map((line) => (
              <CopyCommand key={line} command={line} />
            ))}
          </div>
        </div>

        <OssToolGrid />
      </div>
    </main>
  )
}
