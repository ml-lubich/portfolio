/**
 * ─── Centralized Theme Configuration ──────────────────────────────────
 *
 * Single source of truth for ALL colors, gradients, and visual tokens.
 * Every component should import from here instead of hardcoding HSL/hex values.
 *
 * To switch the entire palette (e.g. black-and-white), change values here
 * and update the matching CSS variables in globals.css :root block.
 */

/* ── Raw HSL values (no hsl() wrapper) ────────────────────────────────
 * These correspond 1:1 with the CSS custom properties in globals.css.
 * Keeping them here lets TS files build hsla()/hsl() strings easily. */

export const hsl = {
    primary: "217 91% 60%",
    accent: "265 80% 65%",
    cyan: "180 70% 50%",
    magenta: "280 75% 60%",
    rose: "340 75% 55%",
    amber: "45 90% 55%",
    sky: "200 80% 55%",
    background: "220 20% 4%",
    foreground: "210 20% 95%",
    card: "220 20% 6%",
    border: "220 15% 9%",
    muted: "215 15% 55%",
    /** Slightly lighter border for overlays */
    borderLight: "220 15% 14%",
} as const

/* ── HSL helpers (for inline styles that need hsl()/hsla() strings) ── */

export function toHsl(raw: string): string {
    return `hsl(${raw})`
}

export function toHsla(raw: string, alpha: number): string {
    return `hsl(${raw} / ${alpha})`
}

/* ── Hex colors (for Three.js / WebGL / Canvas) ──────────────────── */

export const hex = {
    primary: "#3b82f6",
    primaryLight: "#60a5fa",
    primaryPale: "#93c5fd",
    accent: "#8b5cf6",
    accentLight: "#a78bfa",
    accentPale: "#c4b5fd",
    cyan: "#06b6d4",
    cyanLight: "#22d3ee",
    background: "#0a0c14",
    /** brain wireframe base */
    wireBase: "#3baaff",
    /** brain wireframe glow / points */
    wireGlow: "#6dcfff",
} as const

/* ── Three.js numeric hex colors ────────────────────────────────── */

export const hexNum = {
    wireBase: 0x3baaff,
    wireGlow: 0x6dcfff,
    neuralBlue: 0x2a6fbf,
    background: 0x080810,
} as const

/* ── GLSL color vectors ─────────────────────────────────────────── */

export const glsl = {
    /** Primary glow color used in brain/orb shaders */
    glowColor: "vec3(0.2, 0.45, 0.9)",
} as const

/* ── Tailwind gradient class strings ─────────────────────────────
 * Reusable gradient stops for Tailwind's bg-gradient-to-* utilities.
 * Components reference these by index or name instead of inlining
 * raw hsl() values in every data array. */

export const gradients = {
    /** Blue → Purple (primary → accent) */
    primaryToAccent: "from-primary to-accent",
    /** Purple → Cyan */
    accentToCyan: `from-accent to-[hsl(${hsl.cyan})]`,
    /** Cyan → Blue */
    cyanToPrimary: `from-[hsl(${hsl.cyan})] to-primary`,
    /** Blue → Magenta */
    primaryToMagenta: `from-primary to-[hsl(${hsl.magenta})]`,
    /** Magenta → Purple */
    magentaToAccent: `from-[hsl(${hsl.magenta})] to-accent`,
    /** Purple → Blue */
    accentToPrimary: "from-accent to-primary",
    /** Blue → Rose */
    primaryToRose: `from-primary to-[hsl(${hsl.rose})]`,
    /** Blue → Cyan */
    primaryToCyan: `from-primary to-[hsl(${hsl.cyan})]`,
    /** Three-stop: primary via accent to cyan */
    primaryViaAccentToCyan: `from-primary via-accent to-[hsl(${hsl.cyan})]`,
    /** Three-stop: accent via magenta to primary */
    accentViaMagentaToPrimary: `from-accent via-[hsl(${hsl.magenta})] to-primary`,
    /** Three-stop: cyan via primary to accent */
    cyanViaPrimaryToAccent: `from-[hsl(${hsl.cyan})] via-primary to-accent`,
    /** Three-stop: primary via sky to accent */
    primaryViaSkyToAccent: `from-primary via-[hsl(${hsl.sky})] to-accent`,
} as const

/* ── Light (10% opacity) gradient variants for card overlays ──── */

export const lightGradients = {
  primaryToAccent: "from-primary/10 to-accent/10",
  accentToCyan: `from-accent/10 to-[hsl(${hsl.cyan})]/10`,
  cyanToPrimary: `from-[hsl(${hsl.cyan})]/10 to-primary/10`,
  primaryToMagenta: `from-primary/10 to-[hsl(${hsl.magenta})]/10`,
  magentaToAccent: `from-[hsl(${hsl.magenta})]/10 to-accent/10`,
  accentToPrimary: "from-accent/10 to-primary/10",
} as const

/* ── Ordered gradient/accent arrays ──────────────────────────────
 * Used by sections that iterate over items and assign rotating colors
 * (publications, journey, projects, github-stats, etc.) */

export const gradientCycle = [
    gradients.primaryToAccent,
    gradients.accentToCyan,
    gradients.cyanToPrimary,
    gradients.primaryToMagenta,
    gradients.magentaToAccent,
    gradients.accentToPrimary,
] as const

export const accentCycle = [
    toHsl(hsl.primary),
    toHsl(hsl.accent),
    toHsl(hsl.cyan),
    toHsl(hsl.magenta),
    toHsl(hsl.accent),
    toHsl(hsl.primary),
] as const

/* ── Semantic text color classes ─────────────────────────────────── */

export const textColors = {
    primary: "text-primary",
    accent: "text-accent",
    cyan: `text-[hsl(${hsl.cyan})]`,
    magenta: `text-[hsl(${hsl.magenta})]`,
} as const

/* ── Terminal / syntax colors ────────────────────────────────────── */

export const terminal = {
    success: "text-emerald-400",
    keyword: "text-purple-400",
    string: "text-emerald-400",
    number: "text-orange-400",
    warning: "text-yellow-400/60",
    cursor: "bg-emerald-400",
    prompt: "text-emerald-400",
    promptDim: "text-emerald-400/80",
    successBg: "bg-emerald-400",
    successBgDim: "bg-emerald-500/5",
    statusDot: "bg-emerald-400",
} as const

/* ── Canvas / 2D context colors ──────────────────────────────────── */

export function particleFill(opacity: number): string {
    return `hsla(${hsl.primary.replace(/ /g, ", ")}, ${opacity})`
}

export function particleStroke(opacity: number): string {
    return `hsla(${hsl.primary.replace(/ /g, ", ")}, ${opacity})`
}

/* ── Card overlay inline-style colors ────────────────────────────── */

const hslComma = (raw: string) => raw.replace(/ /g, ",")

export const overlays = {
    glowRadial: `radial-gradient(circle at 50% 50%, hsla(${hslComma(hsl.primary)},0.2), transparent 60%)`,
    scanLines: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(${hslComma(hsl.primary)},0.03) 2px, hsla(${hslComma(hsl.primary)},0.03) 4px)`,
    /** Dynamic mouse-following glow for cards */
    cardGlow: (xPct: number, yPct: number) =>
        `radial-gradient(circle at ${xPct}% ${yPct}%, hsla(${hslComma(hsl.primary)},0.25), transparent 60%)`,
    /** Blog card glare (dynamic opacity) */
    blogGlare: (xPct: number, yPct: number, opacity: number) =>
        `radial-gradient(circle at ${xPct}% ${yPct}%, hsla(${hslComma(hsl.primary.replace("60%", "80%"))},${opacity}), transparent 60%)`,
} as const

/* ── Box-shadow tokens ──────────────────────────────────────────── */

export const shadows = {
    cardHover: `0 30px 80px -12px rgba(0,0,0,0.4), 0 0 50px -8px hsla(${hslComma(hsl.primary)},0.12)`,
    cardDrag: (dy: number) =>
        `0 ${30 + Math.abs(dy) * 0.2}px 80px -12px rgba(0,0,0,0.45), 0 0 60px -10px hsla(${hslComma(hsl.primary)},0.15)`,
    blogCardFeatured: `0_0_60px_hsla(${hslComma(hsl.primary)},0.1),0_0_120px_hsla(${hslComma(hsl.accent)},0.05)`,
    blogCardSmall: `0_0_40px_hsla(${hslComma(hsl.primary)},0.08),0_0_80px_hsla(${hslComma(hsl.accent)},0.04)`,
    blogAvatar: `0_0_20px_hsla(${hslComma(hsl.primary)},0.2)`,
    blogShare: `0_0_15px_hsla(${hslComma(hsl.primary)},0.1)`,
    filterActive: `0_0_20px_hsla(${hslComma(hsl.primary)},0.3)`,
    filterTag: `0_0_12px_hsla(${hslComma(hsl.accent)},0.2)`,
    textGlow: `0 0 6px hsla(${hslComma(hsl.primary)},0.4)`,
} as const

/* ── Profile-intro orb colors ────────────────────────────────────── */

export const profileOrbs = {
    topRight: `radial-gradient(circle, ${toHsla(hsl.primary, 0.25)}, transparent 70%)`,
    bottomLeft: `radial-gradient(circle, ${toHsla(hsl.magenta, 0.2)}, transparent 70%)`,
    photoRing: `radial-gradient(circle, ${toHsla(hsl.primary, 0.15)}, transparent 70%)`,
} as const

/* ── Terminal chrome colors ──────────────────────────────────────── */

export const terminalChrome = {
    bg: "hsl(220,20%,5%)",
    headerBg: "hsl(220,20%,7%)",
    footerBg: "hsl(220,20%,6%)",
    dotClose: "#ff5f57",
    dotMinimize: "#febc2e",
    dotExpand: "#28c840",
} as const

/* ── Mermaid diagram theme ───────────────────────────────────────── */

export const mermaidTheme = {
    background: hex.background,
    primaryColor: "#1e3a5f",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: hex.primary,
    lineColor: hex.primary,
    secondaryColor: "#1e5f3a",
    tertiaryColor: "#3b1e5f",
    nodeBorder: hex.primary,
    mainBkg: "#1e3a5f",
    clusterBkg: "#0f172a",
    clusterBorder: "#1e293b",
    titleColor: "#e2e8f0",
    edgeLabelBackground: hex.background,
    nodeTextColor: "#e2e8f0",
} as const

/* ── Hero overlay ────────────────────────────────────────────────── */

export const heroOverlay =
    "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(10,12,20,0.55) 0%, transparent 100%)"

/* ── Architecture diagram colors ─────────────────────────────────── */

export const archDiagram = {
    bg: `hsl(220,20%,5%)`,
    labelFill: "hsl(210 20% 70%)",
} as const

/* ── Blog background fades ───────────────────────────────────────── */

export const blogBg = {
    fade: `from-[hsl(${hsl.background})]`,
    fadeSemi: `via-[hsl(${hsl.background}/0.6)]`,
} as const

/* ── Three.js preset shape colors ────────────────────────────────── */

export const threePresets = {
    skills: [
        { color: hex.primary, glowColor: hex.primaryLight },
        { color: hex.accent, glowColor: hex.accentLight },
        { color: hex.cyan, glowColor: hex.cyanLight },
    ],
    research: [
        { color: hex.primary, glowColor: hex.primaryPale },
        { color: hex.accent, glowColor: hex.accentPale },
    ],
    contact: [
        { color: hex.primary, glowColor: hex.primaryLight },
        { color: hex.accent, glowColor: hex.accentLight },
    ],
} as const
