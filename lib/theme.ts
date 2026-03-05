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
    primary: "0 0% 100%",
    accent: "0 0% 85%",
    cyan: "180 70% 50%",
    magenta: "280 75% 60%",
    rose: "340 75% 55%",
    amber: "45 90% 55%",
    sky: "200 80% 55%",
    background: "220 20% 4%",
    foreground: "0 0% 100%",
    card: "220 20% 6%",
    border: "220 15% 12%",
    muted: "220 10% 70%",
    /** Slightly lighter border for overlays */
    borderLight: "220 15% 14%",
    /* rainbow spectrum — smooth full-spectrum, desaturated */
    rainbow1: "330 65% 58%",
    rainbow2: "280 60% 55%",
    rainbow3: "220 65% 52%",
    rainbow4: "180 60% 48%",
    rainbow5: "150 55% 48%",
    rainbow6: "50 70% 52%",
    rainbow7: "10 65% 55%",
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
    primary: "#ffffff",
    primaryLight: "#f0f0f0",
    primaryPale: "#d4d4d4",
    accent: "#d4d4d4",
    accentLight: "#e0e0e0",
    accentPale: "#f0f0f0",
    cyan: "#06b6d4",
    cyanLight: "#22d3ee",
    background: "#0a0c14",
    /** brain wireframe base — cool grey for 3D depth */
    wireBase: "#b0b2be",
    /** brain wireframe glow — subtle teal tint */
    wireGlow: "#90b0b4",
} as const

/* ── Three.js numeric hex colors ────────────────────────────────── */

export const hexNum = {
    wireBase: 0xb0b2be,
    wireGlow: 0x90b0b4,
    neuralBlue: 0x88dddd,
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
    primaryToAccent: "from-primary/80 to-primary/40",
    accentToCyan: "from-primary/70 via-[hsl(200_65%_52%)] to-primary/40",
    cyanToPrimary: "from-[hsl(195_60%_50%)] to-primary/60",
    primaryToMagenta: "from-primary/70 via-[hsl(280_55%_55%)] to-primary/40",
    magentaToAccent: "from-[hsl(300_50%_55%)] to-primary/50",
    accentToPrimary: "from-primary/60 to-primary/80",
    primaryToRose: "from-primary/70 via-[hsl(330_55%_55%)] to-primary/40",
    primaryToCyan: "from-primary/70 via-[hsl(190_60%_48%)] to-primary/40",
    primaryViaAccentToCyan: "from-primary/70 via-[hsl(210_55%_52%)] to-[hsl(190_55%_48%)]/50",
    accentViaMagentaToPrimary: "from-primary/50 via-[hsl(275_50%_52%)] to-primary/70",
    cyanViaPrimaryToAccent: "from-[hsl(190_55%_48%)]/50 via-primary/60 to-primary/40",
    primaryViaSkyToAccent: "from-primary/70 via-[hsl(210_60%_55%)] to-primary/40",
} as const

/* ── Light (10% opacity) gradient variants for card overlays ──── */

export const lightGradients = {
    primaryToAccent: "from-primary/8 to-primary/4",
    accentToCyan: "from-primary/6 via-[hsl(200_65%_52%)]/8 to-primary/4",
    cyanToPrimary: "from-[hsl(195_60%_50%)]/8 to-primary/6",
    primaryToMagenta: "from-primary/6 via-[hsl(280_55%_55%)]/8 to-primary/4",
    magentaToAccent: "from-[hsl(300_50%_55%)]/8 to-primary/5",
    accentToPrimary: "from-primary/6 to-primary/8",
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
    cyan: "text-[hsl(180_70%_50%)]",
    magenta: "text-[hsl(280_75%_60%)]",
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
    topRight: `radial-gradient(circle, ${toHsla(hsl.primary, 0.15)}, transparent 70%)`,
    bottomLeft: `radial-gradient(circle, ${toHsla(hsl.primary, 0.1)}, transparent 70%)`,
    photoRing: `radial-gradient(circle, ${toHsla(hsl.primary, 0.1)}, transparent 70%)`,
} as const

/* ── Terminal chrome colors ──────────────────────────────────────── */

export const terminalChrome = {
    bg: "hsla(220,18%,10%,0.82)",
    headerBg: "hsla(220,18%,12%,0.88)",
    footerBg: "hsla(220,18%,11%,0.85)",
    revealBg: "hsla(220,18%,10%,0.78)",
    dotClose: "#ff5f57",
    dotMinimize: "#febc2e",
    dotExpand: "#28c840",
} as const

/* ── Hero overlay ────────────────────────────────────────────────── */

export const heroOverlay =
    "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(10,12,20,0.35) 0%, transparent 100%)"

/* ── Architecture diagram colors ─────────────────────────────────── */

export const archDiagram = {
    bg: `hsl(220,20%,5%)`,
    labelFill: "hsl(210 20% 70%)",
} as const

/* ── Blog background fades ───────────────────────────────────────── */

export const blogBg = {
    fade: "from-[hsl(220_20%_4%)]",
    fadeSemi: "via-[hsl(220_20%_4%/0.6)]",
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
