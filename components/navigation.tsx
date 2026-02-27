"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Menu, X, ChevronUp } from "lucide-react"
import { AnimatedName } from "./animated-name"

/* ── Navigation links ─────────────────────────────────────────── */
const navLinks = [
  { label: "AI Expertise", href: "#ai-expertise" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Research", href: "#research" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
]

/* ── Spring-physics "woosh" smooth scroll ─────────────────────── */
function wooshScrollTo(targetY: number) {
  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.4))
  let startTime: number | null = null
  let rafId: number

  // Custom spring-like easing — fast launch, gentle deceleration (the "woosh")
  function springEase(t: number): number {
    // overshoot-damped spring: quick ramp, smooth settle
    return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5)
  }

  function tick(now: number) {
    if (!startTime) startTime = now
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = springEase(progress)

    window.scrollTo(0, startY + distance * eased)

    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    }
  }

  // Disable native smooth-scroll temporarily so we have full control
  document.documentElement.style.scrollBehavior = "auto"
  rafId = requestAnimationFrame(tick)

  // Re-enable after animation
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = ""
    cancelAnimationFrame(rafId)
  }, duration + 50)
}

/** Scroll to an anchor href with the woosh effect */
function navigateTo(href: string, callback?: () => void) {
  if (href.startsWith("/")) {
    window.location.href = href
    return
  }
  const id = href.replace("#", "")
  const el = id ? document.getElementById(id) : null
  const targetY = el ? el.getBoundingClientRect().top + window.scrollY - 80 : 0

  wooshScrollTo(targetY)
  // Update URL hash without jumping
  if (id) history.pushState(null, "", `#${id}`)
  callback?.()
}

/* ── Active section tracker ───────────────────────────────────── */
function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const visibleRatios = new Map<string, number>()

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleRatios.set(id, entry.intersectionRatio)
          let best = ""
          let bestRatio = 0
          visibleRatios.forEach((ratio, sId) => {
            if (ratio > bestRatio) {
              bestRatio = ratio
              best = sId
            }
          })
          if (best) setActiveId(best)
        },
        { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1] },
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sectionIds])

  return activeId
}

/* ── Scroll progress (0→1) for the whole page ────────────────── */
function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docH > 0 ? Math.min(window.scrollY / docH, 1) : 0)
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

  return progress
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
  const scrollProgress = useScrollProgress()

  /* Hide navbar on scroll-down, reveal on scroll-up */
  useEffect(() => {
    let rafId: number
    function handleScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 50)
        // Hide when scrolling down past 300px, show when scrolling up
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

  /* Keyboard anchor navigation (ArrowDown/ArrowUp cycle sections) */
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
      {/* ── Progress bar at very top ────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ── Main nav bar ────────────────────────────────────── */}
      <nav
        ref={navRef}
        onKeyDown={handleKeyNav}
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hideNav ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
          scrolled
            ? "nav-glass py-2.5"
            : "bg-transparent py-5",
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
              {/* Subtle shimmer on the logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
            <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              <AnimatedName name="Misha Lubich" trigger="hover" duration={500} />
            </span>
          </a>

          {/* Desktop links with sliding pill indicator */}
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
                    "relative rounded-full px-3.5 py-1.5 text-[13px] tracking-wide transition-all duration-300",
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.06] animate-nav-pill-in"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              )
            })}
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, "#contact")}
              className="ml-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-[13px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              Get In Touch
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

        {/* Mobile menu — slides down with spring ease */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="nav-glass mx-4 mt-2 rounded-2xl p-3 border border-white/[0.06]">
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace("#", "")
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={[
                      "rounded-xl px-4 py-3 text-sm transition-all duration-300",
                      isActive
                        ? "text-foreground font-medium bg-white/[0.06] border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    {link.label}
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

      {/* ── Back to top FAB ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => wooshScrollTo(0)}
        aria-label="Back to top"
        className={[
          "fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full",
          "nav-glass border border-white/[0.08] text-muted-foreground hover:text-foreground",
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
