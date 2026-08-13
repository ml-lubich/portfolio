"use client"

/**
 * Light/dark switch. Renders a stable placeholder until mounted — reading
 * the resolved theme during SSR would emit the wrong icon and hydrate-mismatch.
 */

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isLight = mounted && resolvedTheme === "light"

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] text-muted-foreground transition-colors hover:border-[var(--line-strong)] hover:text-foreground ${className}`}
    >
      {/* suppressHydrationWarning: the icon depends on the persisted theme,
          which is only known on the client. */}
      <span suppressHydrationWarning>
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  )
}
