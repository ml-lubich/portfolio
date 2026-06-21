import type { Metadata } from "next"
import Link from "next/link"
import { Gamepad2, ArrowRight, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Games | Misha Lubich",
  description: "Interactive browser games — LLM-themed playables built into the portfolio.",
}

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Back link */}
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portfolio
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-4xl px-6 pt-4 pb-16">
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5">
            <Gamepad2 className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400">Games</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-foreground mb-3">
            Playable Experiments
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Browser games built into the portfolio. Each one is a playable riff on AI/LLM concepts.
          </p>
        </div>

        {/* Game cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Token Invaders card */}
          <Link
            href="/games/token-invaders"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
          >
            {/* Glow on hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
              style={{ background: "radial-gradient(60% 50% at 50% 0%, hsl(270 65% 58% / 0.08), transparent)" }} />

            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
                <Gamepad2 className="h-5 w-5 text-violet-400" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-400">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                Play
              </span>
            </div>

            <h2 className="text-lg font-medium text-foreground mb-1.5 group-hover:text-white transition-colors">
              Token Invaders
            </h2>
            <p className="text-sm text-muted-foreground flex-1 mb-4">
              You are an LLM inference engine. Defend your context window against descending AI failures — hallucinations, prompt injections, jailbreaks.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <span className="rounded-full border border-white/[0.08] px-2 py-0.5">Space Invaders</span>
              <span className="rounded-full border border-white/[0.08] px-2 py-0.5">LLM Theme</span>
              <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 text-muted-foreground/40 group-hover:text-violet-400" />
            </div>
          </Link>

          {/* Snake easter egg card */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 opacity-60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
                <span className="text-xl">🐍</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] font-medium text-muted-foreground/50">
                Easter Egg
              </span>
            </div>
            <h2 className="text-lg font-medium text-foreground/60 mb-1.5">Snake</h2>
            <p className="text-sm text-muted-foreground/50 flex-1">
              Hidden in the terminal. Click the snake icon in the live terminal section on the homepage.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
