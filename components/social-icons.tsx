import { Github, GraduationCap, Linkedin } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/* ── Shared social link data (single source of truth) ────────────────── */

export interface SocialLink {
  href: string
  label: string
  icon: LucideIcon
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://github.com/ml-lubich", label: "GitHub", icon: Github },
  { href: "https://www.linkedin.com/in/misha-lubich/", label: "LinkedIn", icon: Linkedin },
  {
    href: "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ",
    label: "Google Scholar",
    icon: GraduationCap,
  },
]

/* ── Glass icon buttons ───────────────────────────────────────────────── */

const SIZE_CLASSES = {
  md: "h-12 w-12 min-h-[48px] min-w-[48px]",
  sm: "h-10 w-10 min-h-[40px] min-w-[40px]",
} as const

const ICON_SIZE_CLASSES = {
  md: "h-5 w-5",
  sm: "h-4 w-4",
} as const

interface SocialIconsProps {
  size?: "md" | "sm"
  className?: string
}

export function SocialIcons({ size = "md", className }: SocialIconsProps) {
  return (
    <>
      {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer me"
          className={`group flex ${SIZE_CLASSES[size]} items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/[0.1] hover:text-white magnetic${className ? ` ${className}` : ""}`}
          aria-label={label}
        >
          <Icon className={`${ICON_SIZE_CLASSES[size]} transition-transform group-hover:scale-110`} />
        </a>
      ))}
    </>
  )
}
