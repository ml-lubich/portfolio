import type { CSSProperties } from 'react'

/**
 * Maps the lab's local --viz-* tokens onto the site's own design tokens so the
 * visuals follow dark/light (`.light`) without restyling anything. Accent
 * fills use --accent-glow (rules/glows/hairlines); accent TEXT is mixed toward
 * the foreground so it keeps AA contrast in both themes.
 */
export const VIZ_VARS = {
  '--viz-fg': 'hsl(var(--foreground))',
  '--viz-muted': 'hsl(var(--muted-foreground))',
  '--viz-surface': 'var(--surface-1)',
  '--viz-surface-2': 'var(--surface-2)',
  '--viz-border': 'var(--line-soft)',
  '--viz-accent': 'var(--accent-glow)',
  '--viz-accent-text': 'color-mix(in srgb, var(--accent-glow) 55%, hsl(var(--foreground)))',
  '--viz-accent-2': 'color-mix(in srgb, hsl(var(--chart-2)) 65%, hsl(var(--foreground)))',
} as CSSProperties

export const MONO = 'var(--font-jetbrains, ui-monospace, monospace)'
