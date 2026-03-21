"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import { Menu, X, ChevronUp } from "lucide-react"
import { navLinks } from "./nav-links"
import { wooshScrollTo, navigateTo, isProgrammaticScroll } from "./woosh-scroll"
import { useActiveSection } from "./use-nav-hooks"
import { ExpandingText } from "./expanding-text"

/* ── Isolated scroll-driven micro-components ─────────────────────────
   Each manages its own scroll listener and state, so the parent
   Navigation never re-renders due to scroll position changes.
   All render the same HTML on server and client to avoid hydration mismatch.
   ──────────────────────────────────────────────────────────────────── */

const PROGRESS_BAR_GRADIENT =
  "linear-gradient(90deg, hsl(330 70% 60%), hsl(280 65% 58%), hsl(220 70% 55%), hsl(180 65% 48%), hsl(140 60% 48%), hsl(50 75% 55%), hsl(330 70% 60%))"

/** Progress bar — updates DOM via ref only (no state), same markup on server and client. */
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      return
    }
    let rafId: number
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const progress = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0
      if (barRef.current) barRef.current.style.width = `${progress * 100}%`
    }
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] hidden h-[2px] md:block" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full transition-[width] duration-75 ease-out"
        style={{ width: "0%", background: PROGRESS_BAR_GRADIENT }}
      />
    </div>
  )
}

/** Back-to-top FAB — only re-renders when visibility toggles (not every scroll frame). */
function BackToTopButton() {
  const [visible, setVisible] = useState(false)
  const wasVisible = useRef(false)

  useEffect(() => {
    let rafId: number
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      const progress = docH > 0 ? Math.min(window.scrollY / docH, 1) : 0
      const show = progress > 0.1
      if (show !== wasVisible.current) {
        wasVisible.current = show
        setVisible(show)
      }
    }
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => wooshScrollTo(0)}
      aria-label="Back to top"
      className={[
        "fixed bottom-6 right-6 z-50 flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full",
        "nav-glass border border-white/[0.04] text-muted-foreground hover:text-foreground",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-90 pointer-events-none",
      ].join(" ")}
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  )
}

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
  const scrolledPastHeroRef = useRef(false)

  /* Hide navbar on scroll-down, reveal on scroll-up */
  useEffect(() => {
    let rafId: number
    function handleScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        const nextScrolled = y > 50
        if (nextScrolled !== scrolledPastHeroRef.current) {
          scrolledPastHeroRef.current = nextScrolled
          setScrolled(nextScrolled)
        }
        // Skip hide/show logic during programmatic (navbar-initiated) scrolls
        // to prevent the nav from flickering away mid-animation
        if (!isProgrammaticScroll) {
          if (y > 300 && y > lastScrollY.current + 8) {
            setHideNav(true)
          } else if (y < lastScrollY.current - 4) {
            setHideNav(false)
          }
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
      // Ensure navbar stays visible during the scroll animation
      setHideNav(false)
      navigateTo(href, () => setMobileOpen(false))
    },
    [],
  )

  return (
    <>
      <ScrollProgressBar />
      {/* Main nav bar */}
      <nav
        ref={navRef}
        onKeyDown={handleKeyNav}
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hideNav ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
          scrolled ? "bg-transparent py-2.5" : "bg-transparent py-5",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setHideNav(false)
              wooshScrollTo(0)
              history.replaceState(null, "", window.location.pathname)
              setMobileOpen(false)
            }}
            className="group flex items-center gap-2"
          >
            <div
              className="logo-flip-hover relative flex h-16 w-16 items-center justify-center rounded-[9px] overflow-hidden"
              onMouseEnter={(e) => {
                const el = e.currentTarget
                if (!el.classList.contains('is-flipping')) {
                  el.classList.add('is-flipping')
                }
              }}
              onAnimationEnd={(e) => {
                e.currentTarget.classList.remove('is-flipping')
              }}
            >
              <Image src="/logo.png" alt="ML" width={64} height={64} sizes="64px" className="h-full w-full object-cover" />
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 lg:flex relative">
            {navLinks.filter((l) => l.href !== "#contact").map((link) => {
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
                    "group/link relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] xl:px-3.5 xl:text-[14px] tracking-wide transition-all duration-300",
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
              className="group/link ml-2 xl:ml-3 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[13px] xl:px-4 xl:text-[14px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              <ExpandingText text="Get In Touch" />
            </a>
          </div>

          {/* Mobile toggle — min 48px touch target for accessibility */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground lg:hidden"
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
            "lg:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
                className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </nav>

      <BackToTopButton />
    </>
  )
}
