"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Menu, X, ChevronUp } from "lucide-react"
import { AnimatedName } from "../animations/animated-name"
import { navLinks } from "./nav-links"
import { wooshScrollTo, navigateTo } from "./woosh-scroll"
import { useActiveSection, useScrollProgress } from "./use-nav-hooks"
import { ExpandingText } from "./expanding-text"

/* ══════════════════════════════════════════════════════════════════
   Navigation Component
   ══════════════════════════════════════════════════════════════════ */

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hideNav, setHideNav] = useState(false)
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

  const sectionIds = useMemo(
    () => navLinks.filter((l) => !l.href.startsWith("/")).map((l) => l.href.replace("#", "")),
    [],
  )
  const activeSection = useActiveSection(sectionIds)
  const scrollProgress = useScrollProgress()

  /* Hide navbar on scroll-down, reveal on scroll-up */
  useEffect(() => {
    let rafId: number
    function handleScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 50)
        if (y > 300 && y > lastScrollY.current + 8) {
          setHideNav(true)
        } else if (y < lastScrollY.current - 4) {
          setHideNav(false)
        }
        lastScrollY.current = y
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  /* Keyboard anchor navigation */
  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return
      e.preventDefault()
      const idx = sectionIds.indexOf(activeSection)
      const next =
        e.key === "ArrowDown"
          ? Math.min(idx + 1, sectionIds.length - 1)
          : Math.max(idx - 1, 0)
      navigateTo(`#${sectionIds[next]}`)
    },
    [activeSection, sectionIds],
  )

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      navigateTo(href, () => setMobileOpen(false))
    },
    [],
  )

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Main nav bar */}
      <nav
        ref={navRef}
        onKeyDown={handleKeyNav}
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hideNav ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
          scrolled ? "nav-glass py-2.5" : "bg-transparent py-5",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, "#")}
            className="group flex items-center gap-2"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent overflow-hidden">
              <span className="text-sm font-bold text-primary-foreground relative z-10">ML</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
            <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              <AnimatedName name="Misha Lubich" trigger="hover" duration={500} />
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 md:flex relative">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("/")
              const isActive = !isExternal && activeSection === link.href.replace("#", "")

              return (
                <a
                  key={link.href}
                  ref={(el) => {
                    if (el) linkRefs.current.set(link.href, el)
                  }}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={[
                    "group/link relative rounded-full px-3.5 py-1.5 text-[13px] tracking-wide transition-all duration-300",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/[0.03] animate-nav-pill-in" />
                  )}
                  <span className="relative z-10">
                    <ExpandingText text={link.label} />
                  </span>
                </a>
              )
            })}
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, "#contact")}
              aria-label="Get In Touch"
              className="group/link ml-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-[13px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              <ExpandingText text="Get In Touch" />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            <div className="relative h-5 w-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileOpen ? "rotate-90 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"}`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="nav-glass mx-4 mt-2 rounded-2xl p-3 border border-white/[0.03]">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace("#", "")
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    aria-label={link.label}
                    className={[
                      "group/link rounded-xl px-4 py-3 text-sm transition-all duration-300",
                      isActive
                        ? "text-foreground font-medium bg-white/[0.03] border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]",
                    ].join(" ")}
                  >
                    <ExpandingText text={link.label} />
                  </a>
                )
              })}
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, "#contact")}
                className="mt-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-center text-sm font-medium text-primary-foreground"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Back to top FAB */}
      <button
        type="button"
        onClick={() => wooshScrollTo(0)}
        aria-label="Back to top"
        className={[
          "fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full",
          "nav-glass border border-white/[0.04] text-muted-foreground hover:text-foreground",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrollProgress > 0.1
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-90 pointer-events-none",
        ].join(" ")}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
    </>
  )
}
