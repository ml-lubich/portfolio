import type { ReactNode, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"

export interface ScrollStackCard {
  id: string
  children: ReactNode
}

export interface ScrollStackCardsProps {
  cards: ScrollStackCard[]
  className?: string
  /** Optional header content rendered inside the sticky frame above the cards */
  header?: ReactNode
  /** Distance from top of viewport where cards stick (px). Default: 80 */
  stickyTop?: number
  /** Extra vertical offset per card so you see the stack peek (px). Default: 20 */
  stackOffset?: number
  /** Scroll distance allocated per card (vh). Default: 50 */
  scrollPerCard?: number
  /** 3D perspective depth (px). Default: 1200 */
  perspective?: number
}

/* ── Per-card drag physics state ─────────────────────────────────────── */
export interface DragState {
  /** Is the pointer currently down on this card? */
  active: boolean
  /** Pointer starting position */
  startX: number
  startY: number
  /** Current drag offset from origin */
  dx: number
  dy: number
  /** Velocity (px / frame) — used for fling */
  vx: number
  vy: number
  /** Previous pointer position for velocity calc */
  prevX: number
  prevY: number
  /** Timestamp of last pointer move */
  lastTime: number
}

export type { ReactMouseEvent, ReactTouchEvent }
