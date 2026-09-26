/* ── Navigation links config ───────────────────────────────────────── */

export interface NavLink {
  label: string
  href: string
  /** Shown inline in the desktop bar; the rest live under "More" so the row fits. */
  primary?: true
}

export interface LiveTool {
  href: string
  label: string
  description: string
  badge: string
}

export const navLinks: NavLink[] = [
  { label: "About", primary: true, href: "#about" },
  { label: "Journey", primary: true, href: "#journey" },
  { label: "Consulting", primary: true, href: "#consulting" },
  { label: "Clients", href: "#testimonials" },
  { label: "Writing", href: "#writing" },
  { label: "Follow", href: "#follow" },
  { label: "Projects", primary: true, href: "#projects" },
  { label: "OSS", href: "#open-source" },
  { label: "Skills", href: "#skills" },
  { label: "Stats", href: "#github" },
  { label: "Research", href: "#research" },
  { label: "Blog", primary: true, href: "/blog" },
  { label: "Contact", href: "#contact" },
]

export const liveTools: LiveTool[] = [
  {
    href: "/tools",
    label: "AI Tools",
    description: "Estimate AI project cost and lint system prompts",
    badge: "New",
  },
  {
    href: "/llm-prices",
    label: "LLM Pricing",
    description: "Real-time token pricing across all major AI providers",
    badge: "Live",
  },
]

export const liveGames: LiveTool[] = [
  {
    href: "/games/token-invaders",
    label: "Token Invaders",
    description: "Defend your context window against LLM agent overflow",
    badge: "Play",
  },
  {
    href: "/games/snake",
    label: "Snake",
    description: "Classic Snake — terminal edition",
    badge: "Play",
  },
]
