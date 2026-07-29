"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SiteLogoMark } from "../site-logo-mark"
import { GlassBlobField } from "../glass-blob-field"
import { SOCIAL_LINKS } from "../social-icons"

const footerLinks = [
  { href: "/#about", label: "About" },
  { href: "/#consulting", label: "Consulting" },
  { href: "/#testimonials", label: "Clients" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
]

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="relative overflow-hidden bg-background px-3 pb-3 pt-5 sm:px-5 sm:pb-5 md:pt-8"
    >
      <AnimatedSection className="mx-auto max-w-6xl" enable3D={false}>
        <div className="footer-liquid-glass relative isolate overflow-hidden rounded-[1.75rem] px-5 py-6 sm:px-7 sm:py-7 lg:px-9">
          <div className="footer-aurora footer-aurora-left" aria-hidden="true" />
          <div className="footer-aurora footer-aurora-right" aria-hidden="true" />
          <GlassBlobField intensity={0.22} />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_1.45fr_auto] lg:items-start lg:gap-12">
            <div>
              <Link
                href="/#main-content"
                className="group inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                aria-label="Misha Lubich — back to top"
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center transition-transform duration-500 ease-fluid group-hover:-translate-y-0.5">
                  <SiteLogoMark width={48} height={48} sizes="48px" loading="lazy" />
                </span>
                <span>
                  <span className="block text-sm font-medium tracking-[-0.01em] text-white">
                    Misha Lubich
                  </span>
                  <span className="mt-0.5 block text-xs text-white/45">
                    AI Engineer &amp; Technical Leader
                  </span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-xs leading-5 text-white/40">
                Building thoughtful AI systems and the teams that bring them to life.
              </p>
            </div>

            <nav aria-label="Footer navigation">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                Explore
              </p>
              <ul className="grid grid-cols-2 gap-x-7 gap-y-1 sm:grid-cols-4 lg:grid-cols-3">
                {footerLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group/link inline-flex min-h-9 items-center gap-1.5 text-xs text-white/50 outline-none transition-colors hover:text-white focus-visible:text-white"
                    >
                      <span>{label}</span>
                      <span
                        aria-hidden="true"
                        className="h-px w-0 bg-white/70 transition-[width] duration-300 ease-fluid group-hover/link:w-3 group-focus-visible/link:w-3"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social links">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                Elsewhere
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`${label} (opens in a new tab)`}
                    title={label}
                    className="group/social flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.045] text-white/55 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08)] outline-none backdrop-blur-md transition-all duration-300 ease-fluid hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus-visible:border-white/30 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover/social:scale-105" />
                  </a>
                ))}
              </div>
            </nav>
          </div>

          <div className="relative z-10 mt-7 flex flex-col gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Misha Lubich. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/privacy" className="transition-colors hover:text-white/80 focus-visible:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white/80 focus-visible:text-white">
                Terms
              </Link>
              <a
                href="mailto:michaelle.lubich@gmail.com"
                className="group/mail inline-flex items-center gap-1.5 text-white/50 transition-colors hover:text-white focus-visible:text-white"
              >
                Start a conversation
                <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover/mail:-translate-y-0.5 group-hover/mail:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </footer>
  )
}
