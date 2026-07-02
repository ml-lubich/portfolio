/* ── Navigation links config ───────────────────────────────────────── */

export interface NavLink {
  label: string
  href: string
}

export interface LiveTool {
  href: string
  label: string
  description: string
  badge: string
}

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Consulting", href: "#consulting" },
  { label: "Clients", href: "#testimonials" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Stats", href: "#github" },
  { label: "Research", href: "#research" },
  { label: "Blog", href: "/blog" },
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
