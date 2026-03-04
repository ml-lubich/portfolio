"use client"

import type { ReactNode } from "react"
import { ScrollStackCards } from "../cards"
import { SectionHeader } from "./section-header"

/* ──────────────────────────────────────────────────────────────────────
 *  ScrollStackSection — reusable anchored-title stacking-cards section.
 *
 *  Pattern:
 *    1. Section header (title / subtitle / label) stays pinned at the
 *       top of the viewport while cards stack up beneath it.
 *    2. Once all cards are fully stacked, the section naturally unpins
 *       and scroll continues to the next section.
 *    3. Background effects, post-card content (e.g. DetailPanel), and
 *       all ScrollStackCards tunables are exposed via props.
 *
 *  Usage:
 *    <ScrollStackSection
 *      id="journey"
 *      label="Experience"
 *      title={<>From Braintrust to Apple, delivering{" "}
 *        <span className="gradient-text">impactful solutions</span></>}
 *      subtitle="Click any role to explore architecture details…"
 *      cards={cards}
 *    >
 *      <DetailPanel … />
 *    </ScrollStackSection>
 * ────────────────────────────────────────────────────────────────────── */

interface ScrollStackSectionProps {
  /** HTML id for anchor links (e.g. "journey", "projects") */
  id: string

  /* ── SectionHeader props ───────────────────────────────────────────── */
  /** Monospace uppercase label (e.g. "Experience") */
  label: string
  /** Heading — pass JSX with <span className="gradient-text"> for highlights */
  title: ReactNode
  /** Short paragraph beneath heading */
  subtitle: string
  /** Optional icon rendered before the label */
  icon?: ReactNode
  /** Override className on the SectionHeader wrapper */
  headerClassName?: string

  /* ── Card data ─────────────────────────────────────────────────────── */
  cards: { id: string; children: ReactNode }[]

  /* ── ScrollStackCards tunables ──────────────────────────────────────── */
  /** Distance from viewport top where cards stick (px). Default: 90 */
  stickyTop?: number
  /** Extra vertical offset per card so the stack peeks (px). Default: 16 */
  stackOffset?: number
  /** Scroll distance allocated per card (vh). Default: 55 */
  scrollPerCard?: number
  /** 3D perspective depth (px). Default: 1200 */
  perspective?: number

  /* ── Section-level styling ─────────────────────────────────────────── */
  /** Extra className on the outer <section> */
  className?: string
  /** Max-width container class. Default: "max-w-6xl" */
  maxWidth?: string

  /* ── Slots ─────────────────────────────────────────────────────────── */
  /** Background effect elements (gradient blobs, etc.) */
  bgEffects?: ReactNode
  /**
   * Content rendered *after* the stacking cards (e.g. DetailPanel,
   * Google Scholar link). Receives full section width.
   */
  children?: ReactNode

  /* ── Detail-panel split-view ────────────────────────────────────────── */
  /** ID of the currently active/expanded card, or null */
  activeCardId?: string | null
  /** Called when scroll detected while detail panel is open */
  onScrollDismiss?: () => void
  /** Detail panel content rendered inside the sticky card area */
  detailContent?: ReactNode
}

export function ScrollStackSection({
  id,
  label,
  title,
  subtitle,
  icon,
  headerClassName = "mb-8",
  cards,
  stickyTop = 90,
  stackOffset = 16,
  scrollPerCard = 55,
  perspective = 1200,
  className = "",
  maxWidth = "max-w-6xl",
  bgEffects,
  children,
  activeCardId,
  onScrollDismiss,
  detailContent,
}: ScrollStackSectionProps) {
  return (
    <section
      id={id}
      className={`relative py-14 sm:py-20 ${className}`}
    >
      {/* Background FX (optional) */}
      {bgEffects && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          {bgEffects}
        </div>
      )}

      <div className={`relative mx-auto ${maxWidth} px-4 sm:px-6`}>
        {/* Stacking glass cards with anchored section header */}
        <ScrollStackCards
          header={
            <SectionHeader
              className={headerClassName}
              label={label}
              title={title}
              subtitle={subtitle}
              icon={icon}
            />
          }
          cards={cards}
          stickyTop={stickyTop}
          stackOffset={stackOffset}
          scrollPerCard={scrollPerCard}
          perspective={perspective}
          activeCardId={activeCardId}
          onScrollDismiss={onScrollDismiss}
          detailContent={detailContent}
        />
      </div>

      {/* Post-cards content: DetailPanel, extra links, etc. */}
      {children}
    </section>
  )
}
