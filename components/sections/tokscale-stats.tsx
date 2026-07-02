import { ArrowUpRight, ExternalLink, Flame, Trophy } from "lucide-react"

/* ── tokscale — live AI token usage (single source of truth) ──────── */

export const TOKSCALE_PROFILE_URL = "https://tokscale.ai/u/ml-lubich"
export const TOKSCALE_LEADERBOARD_URL = "https://tokscale.ai/leaderboard"
const TOKSCALE_EMBED_URL = "https://tokscale.ai/api/embed/ml-lubich/svg?sort=cost&compact=1"

/** Pulsing "live" dot shared by the hero pill and the stats card chip. */
function LiveDot({ size = "h-2 w-2" }: { size?: string }) {
  return (
    <span className={`relative flex ${size}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className={`relative inline-flex ${size} rounded-full bg-emerald-400`} />
    </span>
  )
}

/** Compact hero pill — glass chip with a live pulse, links to the tokscale profile.
 *  Hidden at xl+ where {@link TokscaleHeroPanel} takes over as the docked hero ornament. */
export function TokscaleHeroBadge() {
  return (
    <div
      className="mt-5 flex animate-fade-in-up justify-center pointer-events-auto xl:hidden"
      style={{ animationDelay: "0.62s", opacity: 0 }}
    >
      <a
        href={TOKSCALE_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Live AI token usage tracked by tokscale"
        className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs text-white/80 backdrop-blur-sm transition-all hover:border-emerald-400/40 hover:bg-white/[0.09] hover:text-white"
      >
        <LiveDot />
        <span className="font-medium">Live AI token usage</span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80 sm:inline">
          tokscale
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300" />
      </a>
    </div>
  )
}

/** Docked hero panel — compact glass card pinned to the hero's right edge on wide screens.
 *  Same live embed as {@link TokscaleCard}, scaled down as a floating ornament. */
export function TokscaleHeroPanel() {
  return (
    <a
      href={TOKSCALE_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Live AI token usage tracked by tokscale"
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/40"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mb-2 flex items-center gap-2">
        <LiveDot size="h-1.5 w-1.5" />
        <span className="text-xs font-semibold text-white/90">AI Token Usage</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          tokscale
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TOKSCALE_EMBED_URL}
        alt="Misha Lubich — AI token usage tracked by tokscale"
        width={310}
        height={109}
        loading="lazy"
        className="h-auto w-full max-w-[310px] rounded-lg border border-white/[0.06] transition-transform duration-500 group-hover:scale-[1.01]"
      />
    </a>
  )
}

/** Full glass card for the GitHub-stats section: live tokscale embed + links. */
export function TokscaleCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 backdrop-blur-2xl transition-all duration-500 hover:border-emerald-400/25 hover:bg-white/[0.025] glass-card-3d sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400/50 via-primary/40 to-accent/40 opacity-60" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl opacity-0 transition-all duration-700 group-hover:scale-150 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-foreground">AI Token Usage</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-400">
              <LiveDot size="h-1.5 w-1.5" />
              Live
            </span>
          </div>
          <p className="mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tokens burned shipping AI in production — auto-tracked across Claude Code, Codex,
            Gemini &amp; more via tokscale.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={TOKSCALE_LEADERBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-emerald-400/30 hover:bg-white/[0.08] hover:text-foreground"
            >
              <Trophy className="h-3.5 w-3.5 text-emerald-400/80" />
              Global leaderboard
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </a>
            <a
              href={TOKSCALE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-emerald-400/30 hover:bg-white/[0.08] hover:text-foreground"
            >
              Full stats
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </a>
          </div>
        </div>

        <a
          href={TOKSCALE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Full tokscale stats for ml-lubich"
          className="shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TOKSCALE_EMBED_URL}
            alt="Misha Lubich — AI token usage tracked by tokscale"
            width={460}
            height={162}
            loading="lazy"
            className="h-auto w-full max-w-[460px] rounded-xl border border-white/[0.06] transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </a>
      </div>
    </div>
  )
}
