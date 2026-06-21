"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react"
import { SiteLogoMark } from "@/components/site-logo-mark"
import { Menu, X, ChevronUp, ArrowRight, Zap, ChevronDown, ExternalLink, Gamepad2 } from "lucide-react"
import { navLinks, liveTools, liveGames } from "./nav-links"
import { wooshScrollTo, navigateTo } from "./woosh-scroll"
import { useActiveSection } from "./use-nav-hooks"
import { ExpandingText } from "./expanding-text"
import { computeNavPastHero } from "@/lib/nav-hero-surface"

/* ── Isolated scroll-driven micro-components ─────────────────────────
   Each manages its own scroll listener and state, so the parent
   Navigation never re-renders due to scroll position changes.
   All render the same HTML on server and client to avoid hydration mismatch.
   ──────────────────────────────────────────────────────────────────── */

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
        "transition-all duration-300 ease-fluid",
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-90 pointer-events-none",
      ].join(" ")}
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  )
}

/* ── Tools dropdown (desktop) ────────────────────────────────────── */

function ToolsDropdown() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          "group/link relative isolate flex items-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-3 py-2 text-[13px] tracking-[0.01em] transition-all duration-300 xl:px-3.5 xl:text-[14px]",
          open
            ? "border-white/[0.12] bg-white/[0.10] font-medium text-foreground shadow-[0_10px_30px_-18px_rgba(255,255,255,0.8)]"
            : "border-transparent text-muted-foreground hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground",
        ].join(" ")}
      >
        Tools
        <ChevronDown
          className={[
            "h-3 w-3 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={[
          "absolute left-1/2 top-full z-[300] min-w-[220px] pt-2 -translate-x-1/2 transition-all duration-200 ease-fluid",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-[hsl(220_20%_5%/0.96)] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Header */}
          <div className="border-b border-white/[0.06] px-3.5 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              Live on this site
            </p>
          </div>
          {/* Tool entries */}
          {liveTools.map(tool => (
            <a
              key={tool.href}
              href={tool.href}
              className="group/tool flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground/90 group-hover/tool:text-foreground transition-colors">
                    {tool.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    {tool.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/60">
                  {tool.description}
                </p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover/tool:text-muted-foreground/70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Games dropdown (desktop) ────────────────────────────────────── */

function GamesDropdown() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          "group/link relative isolate flex items-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-3 py-2 text-[13px] tracking-[0.01em] transition-all duration-300 xl:px-3.5 xl:text-[14px]",
          open
            ? "border-white/[0.12] bg-white/[0.10] font-medium text-foreground shadow-[0_10px_30px_-18px_rgba(255,255,255,0.8)]"
            : "border-transparent text-muted-foreground hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground",
        ].join(" ")}
      >
        Games
        <ChevronDown
          className={[
            "h-3 w-3 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={[
          "absolute left-1/2 top-full z-[300] min-w-[220px] pt-2 -translate-x-1/2 transition-all duration-200 ease-fluid",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.10] bg-[hsl(220_20%_5%/0.96)] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Header */}
          <div className="border-b border-white/[0.06] px-3.5 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
              Live on this site
            </p>
          </div>
          {/* Game entries */}
          {liveGames.map(game => (
            <a
              key={game.href}
              href={game.href}
              className="group/game flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
                <Gamepad2 className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground/90 group-hover/game:text-foreground transition-colors">
                    {game.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-400">
                    <span className="h-1 w-1 rounded-full bg-violet-400" />
                    {game.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/60">
                  {game.description}
                </p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover/game:text-muted-foreground/70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Navigation Component
   ══════════════════════════════════════════════════════════════════ */

/** Stable SSR/first-paint class string; scroll/hide state is applied via ref + layout effect / scroll handler so React never patches a divergent className. */
const NAV_FIXED_BASE =
  "fixed left-0 right-0 top-3 pointer-events-none transition-all duration-300 ease-fluid md:top-4"
const NAV_VISIBLE = "translate-y-0 opacity-100"
/** Over hero: fully transparent — no blur (avoids cutting off the brain graphic). */
const NAV_SURFACE_HERO =
  "border-b border-transparent bg-transparent py-0 shadow-none backdrop-blur-none backdrop-saturate-100"
/** Scrolled: outer bar stays transparent + unblurred; the floating `.nav-shell`
 * capsule carries the frosted look (via `data-nav-scrolled`), so there is no
 * full-width blur band and no double backdrop-filter stacking. */
const NAV_SURFACE_SCROLLED =
  "border-b border-transparent bg-transparent py-0 shadow-none backdrop-blur-none backdrop-saturate-100"

const NAV_SSR_CLASS = [NAV_FIXED_BASE, "z-50", NAV_VISIBLE, NAV_SURFACE_HERO].join(" ")

/**
 * Frosted bar only after `#hero` has fully left the viewport.
 * `previous` enables hysteresis around the boundary so iOS Safari URL-bar
 * resize / scroll jitter does not flip the surface every frame.
 */
function isPastHero(previous: boolean): boolean {
  if (typeof document === "undefined") return false
  const hero = document.getElementById("hero")
  return computeNavPastHero(hero, window.scrollY, previous)
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileOpenRef = useRef(false)
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  // hideNav removed: auto-hide on scroll-down caused visible flicker on mobile
  // (iOS URL-bar resize jitters scrollY) and was the user-reported flicker on
  // mishalubich.com. Nav now stays visible always.
  const navSurfaceRef = useRef({ scrolled: false })

  const sectionIds = useMemo(
    () => navLinks.filter((l) => !l.href.startsWith("/")).map((l) => l.href.replace("#", "")),
    [],
  )
  const mobileNavLinks = useMemo(
    () => navLinks.filter((link) => link.href !== "#contact"),
    [],
  )
  const activeSection = useActiveSection(sectionIds)
  const scrolledPastHeroRef = useRef(false)

  const applyNavSurface = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    const { scrolled } = navSurfaceRef.current
    const z = mobileOpenRef.current ? "z-[200]" : "z-50"
    nav.className = [
      NAV_FIXED_BASE,
      z,
      NAV_VISIBLE,
      scrolled ? NAV_SURFACE_SCROLLED : NAV_SURFACE_HERO,
    ].join(" ")
    // Capsule frost (heavy blur) is gated to scrolled state so it never
    // re-blurs the animated hero every frame. Ref-driven: no React re-render.
    nav.dataset.navScrolled = scrolled ? "true" : "false"
  }, [])

  /* After paint: align with restored scroll + re-apply when React resets className on re-render. */
  /* Re-apply surface after React commits (resets className to NAV_SSR_CLASS); do not touch lastScrollY here. */
  useLayoutEffect(() => {
    applyNavSurface()
  }, [applyNavSurface, mobileOpen, activeSection])

  /* Once: align scrolled flag with restored scroll. */
  useLayoutEffect(() => {
    const nextScrolled = isPastHero(scrolledPastHeroRef.current)
    scrolledPastHeroRef.current = nextScrolled
    navSurfaceRef.current.scrolled = nextScrolled
    applyNavSurface()
  }, [applyNavSurface])

  /* Update only the hero/scrolled surface on scroll. Auto-hide removed. */
  useEffect(() => {
    let rafId: number
    function handleScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const nextScrolled = isPastHero(scrolledPastHeroRef.current)
        if (nextScrolled !== scrolledPastHeroRef.current) {
          scrolledPastHeroRef.current = nextScrolled
          navSurfaceRef.current.scrolled = nextScrolled
          applyNavSurface()
        }
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [applyNavSurface])

  useEffect(() => {
    function onResize() {
      const next = isPastHero(scrolledPastHeroRef.current)
      scrolledPastHeroRef.current = next
      navSurfaceRef.current.scrolled = next
      applyNavSurface()
    }
    window.addEventListener("resize", onResize, { passive: true })
    onResize()
    return () => window.removeEventListener("resize", onResize)
  }, [applyNavSurface])

  useEffect(() => {
    mobileOpenRef.current = mobileOpen
    applyNavSurface()
  }, [mobileOpen, applyNavSurface])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mobileOpen])

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
    (_e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      _e.preventDefault()
      // Close overlay immediately: navigateTo may defer work (lazy sections) or skip callback (/blog).
      setMobileOpen(false)
      navigateTo(href)
    },
    [],
  )

  return (
    <>
      {/* Main nav bar */}
      <nav
        ref={navRef}
        onKeyDown={handleKeyNav}
        className={NAV_SSR_CLASS}
        suppressHydrationWarning
      >
        <div
          className={[
            "nav-shell pointer-events-auto mx-auto flex w-[calc(100%_-_1rem)] max-w-6xl items-center justify-between px-3 py-2 sm:w-[calc(100%_-_2rem)] sm:px-4",
            mobileOpen ? "relative z-[110]" : "",
          ].join(" ")}
        >
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              wooshScrollTo(0)
              history.replaceState(null, "", window.location.pathname)
              setMobileOpen(false)
            }}
            className="group flex items-center gap-2"
            aria-label="Back to top"
            title="Back to top"
          >
            <div
              className="logo-flip-hover relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-white/[0.08] sm:h-11 sm:w-11"
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
              <SiteLogoMark
                width={48}
                height={48}
                sizes="44px"
                alt="Misha Lubich logo"
                suppressHydrationWarning
              />
            </div>
          </a>

          {/* Desktop links */}
          <div className="relative hidden items-center gap-1 rounded-full border border-white/[0.06] bg-black/[0.12] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:flex">
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
                  title={link.label}
                  className={[
                    "group/link relative isolate overflow-hidden whitespace-nowrap rounded-full border px-3 py-2 text-[13px] tracking-[0.01em] transition-all duration-300 xl:px-3.5 xl:text-[14px]",
                    isActive
                      ? "border-white/[0.12] bg-white/[0.10] font-medium text-foreground shadow-[0_10px_30px_-18px_rgba(255,255,255,0.8)]"
                      : "border-transparent text-muted-foreground hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-foreground",
                  ].join(" ")}
                >
                  <ExpandingText text={link.label} />
                </a>
              )
            })}
            <ToolsDropdown />
            <GamesDropdown />
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, "#contact")}
              aria-label="Get In Touch"
              title="Get In Touch"
              className="group/link relative isolate ml-2 overflow-hidden whitespace-nowrap rounded-full border border-white/[0.16] bg-foreground px-4 py-2 text-[13px] font-semibold text-background shadow-[0_14px_34px_-18px_rgba(255,255,255,0.8)] transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.95),rgba(255,255,255,0.72))] hover:scale-[1.03] hover:shadow-[0_18px_46px_-18px_rgba(255,255,255,0.9)] active:scale-[0.98] xl:ml-3 xl:px-4 xl:text-[14px]"
            >
              <ExpandingText text="Get In Touch" />
            </a>
          </div>

          {/* Mobile toggle — min 48px touch target for accessibility */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.09] hover:text-foreground lg:hidden"
            aria-expanded={mobileOpen ? "true" : "false"}
            aria-controls="mobile-nav-overlay"
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
      </nav>

      {/* Sibling of <nav>: fixed overlay must NOT sit under a transformed ancestor (nav uses translate for hide/show),
          or inset-0 only covers the header box and hero/WebGL paint on top. */}
      {mobileOpen ? (
        <div
          id="mobile-nav-overlay"
          className="fixed inset-0 z-[180] flex flex-col lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* Backdrop: deep black with a subtle radial glow accent (matches hero spectrum vibe). */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/80"
            onClick={() => setMobileOpen(false)}
            style={{
              backgroundImage:
                "radial-gradient(60% 50% at 80% 0%, hsl(280 65% 58% / 0.10), transparent 70%), radial-gradient(50% 40% at 0% 100%, hsl(220 70% 55% / 0.10), transparent 70%)",
            }}
          />
          <div className="relative z-[1] flex min-h-dvh flex-col overflow-y-auto overscroll-contain px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,calc(env(safe-area-inset-top,0px)+5rem))]">
            <nav aria-label="Primary" className="mobile-nav-list flex flex-col">
              {mobileNavLinks.map((link, i) => {
                const isInternalSection = !link.href.startsWith("/")
                const isActive = isInternalSection && activeSection === link.href.replace("#", "")
                const num = String(i + 1).padStart(2, "0")
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    aria-label={link.label}
                    aria-current={isActive ? "page" : undefined}
                    title={link.label}
                    className={[
                      "mobile-nav-item group/link relative flex items-baseline gap-4 py-4",
                      "border-b border-white/[0.06] last:border-b-0",
                      "transition-colors duration-300",
                    ].join(" ")}
                    style={{ animationDelay: `${60 + i * 45}ms` }}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "font-mono text-[11px] tracking-[0.18em] tabular-nums transition-colors duration-300",
                        isActive ? "text-foreground/70" : "text-muted-foreground/45 group-hover/link:text-foreground/60",
                      ].join(" ")}
                    >
                      {num}
                    </span>
                    <span
                      className={[
                        "font-display text-[2rem] font-light leading-[1.05] tracking-tight transition-all duration-300",
                        isActive
                          ? "gradient-text"
                          : "text-foreground/85 group-hover/link:text-foreground group-hover/link:translate-x-1",
                      ].join(" ")}
                    >
                      {link.label}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className={[
                        "ml-auto h-4 w-4 self-center transition-all duration-300",
                        isActive
                          ? "translate-x-0 text-foreground/80 opacity-100"
                          : "-translate-x-2 text-foreground/0 opacity-0 group-hover/link:translate-x-0 group-hover/link:text-foreground/70 group-hover/link:opacity-100",
                      ].join(" ")}
                    />
                  </a>
                )
              })}
            </nav>

            {/* Live tools section */}
            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                Live on this site
              </p>
              {liveTools.map(tool => (
                <a
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileOpen(false)}
                  className="group/tool flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground/85">{tool.label}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">{tool.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover/tool:translate-x-0.5 group-hover/tool:text-muted-foreground/70" />
                </a>
              ))}
            </div>

            {/* Live games section */}
            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                Live Games
              </p>
              {liveGames.map(game => (
                <a
                  key={game.href}
                  href={game.href}
                  onClick={() => setMobileOpen(false)}
                  className="group/game flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
                    <Gamepad2 className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground/85">{game.label}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-400">
                        <span className="h-1 w-1 rounded-full bg-violet-400" />
                        {game.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">{game.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover/game:translate-x-0.5 group-hover/game:text-muted-foreground/70" />
                </a>
              ))}
            </div>

            <div className="mobile-nav-cta mt-6 flex flex-col gap-3">
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, "#contact")}
                aria-label="Get In Touch"
                title="Get In Touch"
                className="group/cta relative flex min-h-[54px] items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 text-[14px] font-medium tracking-wide text-primary-foreground transition-all duration-300 hover:shadow-[0_18px_46px_-18px_hsl(var(--primary)/0.6)] active:scale-[0.99]"
              >
                <span>Get In Touch</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" aria-hidden="true" />
              </a>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/55">
                Misha Lubich · AI Engineer
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <BackToTopButton />
    </>
  )
}
