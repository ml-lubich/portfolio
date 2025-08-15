"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X, Download } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Image from "next/image"
import { animations } from "@/lib/animations"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { theme, setTheme } = useTheme()

  // Memoized download handler
  const handleDownloadResume = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/lubich_michaelle_swe.pdf'
    link.download = 'Misha_Lubich_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Memoized scroll handler for better performance
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
    
    // Improved scroll spy functionality
    const sections = ["about", "experience", "projects", "skills", "publications", "contact"]
    let currentSection = ""
    
    // Check each section to find which one is currently in view
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionId = sections[i]
      const element = document.getElementById(sectionId)
      
      if (element) {
        const rect = element.getBoundingClientRect()
        const elementTop = window.scrollY + rect.top
        
        // Consider a section active if we've scrolled past its midpoint
        if (window.scrollY >= elementTop - window.innerHeight / 3) {
          currentSection = sectionId
          break
        }
      }
    }
    
    // Set hero as active when at top
    if (window.scrollY < 200) {
      currentSection = ""
    }
    
    setActiveSection(currentSection)
  }, [])

  useEffect(() => {
    const throttledHandleScroll = () => {
      requestAnimationFrame(handleScroll)
    }
    
    handleScroll() // Initial check
    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    return () => window.removeEventListener("scroll", throttledHandleScroll)
  }, [handleScroll])

  // Memoized navigation items to prevent recreation
  const navItems = useMemo(() => [
    { href: "#about", label: "About", id: "about" },
    { href: "#experience", label: "Experience", id: "experience" },
    { href: "#projects", label: "Projects", id: "projects" },
    { href: "#skills", label: "Skills", id: "skills" },
    { href: "#publications", label: "Publications", id: "publications" },
    { href: "#contact", label: "Contact", id: "contact" },
  ], [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-100 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="#"
            className="flex items-center hover:scale-105 transition-transform duration-100"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ML
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                  className={`relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-100 font-medium py-2 ${
                  activeSection === item.id
                    ? "text-blue-600 dark:text-blue-400"
                    : ""
                }`}
              >
                {item.label}
                {/* Active indicator bar */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-100 ${
                    activeSection === item.id ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadResume}
              className={`hidden sm:flex border-2 border-blue-600/30 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white ${animations.allTransition}`}
            >
              <Download className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative block px-3 py-2 rounded-md transition-all duration-100 ${
                    activeSection === item.id
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                  {/* Active indicator */}
                  {activeSection === item.id && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r" />
                  )}
                </Link>
              ))}
              {/* Mobile Resume Button */}
              <button
                type="button"
                onClick={() => {
                  handleDownloadResume()
                  setIsMobileMenuOpen(false)
                }}
                className={`relative flex items-center px-3 py-2 rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 ${animations.allTransition} font-medium w-full text-left`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Resume
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
