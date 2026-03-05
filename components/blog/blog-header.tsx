"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Menu, X } from "lucide-react"

const blogNavLinks = [
  { label: "All Posts", href: "/blog", category: "All" },
  { label: "AI Architecture", href: "/blog?category=AI+Architecture", category: "AI Architecture" },
  { label: "Engineering Culture", href: "/blog?category=Engineering+Culture", category: "Engineering Culture" },
  { label: "Hot Takes", href: "/blog?category=Hot+Takes", category: "Hot Takes" },
]

export function BlogHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") ?? "All"
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hideNav, setHideNav] = useState(false)
  const lastScrollY = useRef(0)

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, searchParams])

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        hideNav ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
        scrolled ? "bg-transparent py-2.5" : "bg-transparent py-5",
      ].join(" ")}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
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
            <img src="/logo.png" alt="ML" className="h-full w-full object-cover" />
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Blog navigation">
          {blogNavLinks.map((link) => {
            const isActive =
              (link.category === "All" && !searchParams.get("category") && pathname === "/blog") ||
              currentCategory === link.category
            return (
              <Link
                key={link.href}
                href={link.href}
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
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
          <Link
            href="/"
            className="group/link ml-2 xl:ml-3 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[13px] xl:px-4 xl:text-[14px] font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.97]"
          >
            ← Portfolio
          </Link>
        </nav>

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
            {blogNavLinks.map((link) => {
              const isActive =
                (link.category === "All" && !searchParams.get("category") && pathname === "/blog") ||
                currentCategory === link.category
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "group/link rounded-xl px-4 py-3 text-sm transition-all duration-300",
                    isActive
                      ? "text-foreground font-medium bg-white/[0.03] border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
