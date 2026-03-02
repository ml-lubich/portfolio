"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatedName } from "@/components/animations/animated-name"
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, searchParams])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3" : "bg-background/80 backdrop-blur-md py-4"
      }`}
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <span className="text-sm font-bold text-primary-foreground">ML</span>
          </div>
          <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            <AnimatedName name="Misha Lubich" trigger="hover" duration={500} />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Blog navigation">
          {blogNavLinks.map((link) => {
            const isActive =
              (link.category === "All" && !searchParams.get("category") && pathname === "/blog") ||
              currentCategory === link.category
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
                  isActive
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
          <Link
            href="/"
            className="ml-3 rounded-lg border border-white/[0.06] bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
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
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass mx-4 mt-2 animate-fade-in rounded-xl p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {blogNavLinks.map((link) => {
              const isActive =
                (link.category === "All" && !searchParams.get("category") && pathname === "/blog") ||
                currentCategory === link.category
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "text-primary font-medium bg-primary/10 border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg border border-white/[0.06] bg-secondary/50 px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
