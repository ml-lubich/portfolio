"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { AnimatedText } from "../animations/animated-text"

/* ─────────────────────────────────────────────────────────────────
 *  SectionHeader — single reusable header for every portfolio section.
 *
 *  All text elements now have Anthropic-style reveal animations,
 *  triggered on scroll into viewport.
 *
 *  Usage:
 *    <SectionHeader
 *      label="Technical Skills"
 *      title={<>Comprehensive expertise across the{" "}<span className="gradient-text">full stack</span></>}
 *      subtitle="Deep proficiency in modern AI/ML frameworks…"
 *    />
 *
 *  Optional:
 *    icon   — small icon rendered before the label (e.g. <Brain />)
 *    className — override wrapper classes (mb, text-center, etc.)
 * ────────────────────────────────────────────────────────────────── */

interface SectionHeaderProps {
  /** Monospace uppercase label above the heading (e.g. "Technical Skills") */
  label: string
  /** Heading content — pass JSX with <span className="gradient-text"> for highlights */
  title: ReactNode
  /** Short description below the heading */
  subtitle: string
  /** Optional icon rendered before the label */
  icon?: ReactNode
  /** Optional row directly under the label (e.g. CTA link) — centered */
  afterLabel?: ReactNode
  /** Additional / override Tailwind classes on the wrapper div */
  className?: string
}

export function SectionHeader({
  label,
  title,
  subtitle,
  icon,
  afterLabel,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-7 text-center md:mb-12", className)}>
      <span
        className={cn(
          "font-mono text-xs uppercase tracking-widest text-primary",
          icon ? "inline-flex items-center gap-2" : "inline-block",
        )}
      >
        {icon}
        <AnimatedText text={label} variant="blur-slide" stagger={40} duration={600} />
      </span>

      {afterLabel != null && (
        <div className="mt-2 flex justify-center md:mt-2.5">{afterLabel}</div>
      )}

      <h2 className="mt-3 font-display text-3xl font-light text-foreground sm:text-4xl lg:text-5xl text-balance md:mt-4">
        <AnimatedText variant="blur-slide" delay={150} stagger={55} duration={750}>
          {title}
        </AnimatedText>
      </h2>

      <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:mt-4">
        <AnimatedText text={subtitle} variant="fade-up" delay={400} stagger={20} duration={600} />
      </p>
    </div>
  )
}
