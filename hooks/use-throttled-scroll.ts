"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseThrottledScrollOptions {
  delay?: number
  passive?: boolean
}

export function useThrottledScroll(
  callback: (scrollY: number) => void,
  options: UseThrottledScrollOptions = {}
) {
  const { delay = 16, passive = true } = options // 16ms = ~60fps
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastExecRef = useRef(0)

  const throttledCallback = useCallback((scrollY: number) => {
    const now = Date.now()
    const timeSinceLastExec = now - lastExecRef.current

    if (timeSinceLastExec >= delay) {
      callback(scrollY)
      lastExecRef.current = now
    } else {
      // Schedule execution for the remaining time
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callback(scrollY)
        lastExecRef.current = Date.now()
      }, delay - timeSinceLastExec)
    }
  }, [callback, delay])

  const handleScroll = useCallback(() => {
    throttledCallback(window.scrollY)
  }, [throttledCallback])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [handleScroll, passive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
}
