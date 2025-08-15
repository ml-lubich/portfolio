"use client"

import { lazy, Suspense } from "react"

// Lazy load the falling code component
const FallingCode = lazy(() => import("./falling-code").then(module => ({ default: module.FallingCode })))

export function LazyFallingCode() {
  return (
    <Suspense fallback={null}>
      <FallingCode />
    </Suspense>
  )
}
