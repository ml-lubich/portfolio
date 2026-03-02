import type { DragState } from "./types"

/** Spring constant & damping for rubber-band snap-back */
export const SPRING = 0.08
export const DAMPING = 0.82
export const FLING_DECAY = 0.92
export const DRAG_DEAD_ZONE = 4

export function newDragState(): DragState {
  return {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    prevX: 0,
    prevY: 0,
    lastTime: 0,
  }
}
