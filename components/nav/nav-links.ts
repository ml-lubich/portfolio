/* ── Navigation links config ───────────────────────────────────────── */

export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Consulting", href: "#consulting" },
  { label: "Clients", href: "#testimonials" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Research", href: "#research" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
]
