import { Github, GraduationCap, Linkedin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

function OrcidIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.306v7.428h2.244c2.531 0 3.822-1.444 3.822-3.712 0-2.016-1.169-3.716-3.8-3.716h-2.266z" />
    </svg>
  )
}

/* ── Shared social link data (single source of truth) ────────────────── */

export interface SocialLink {
  href: string
  label: string
  icon: LucideIcon | ComponentType<{ className?: string }>
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://github.com/ml-lubich", label: "GitHub", icon: Github },
  { href: "https://www.linkedin.com/in/misha-lubich/", label: "LinkedIn", icon: Linkedin },
  {
    href: "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ",
    label: "Google Scholar",
    icon: GraduationCap,
  },
  {
    href: "https://orcid.org/0000-0003-2329-4454",
    label: "ORCID",
    icon: OrcidIcon,
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
