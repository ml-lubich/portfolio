"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

type Direction = "up" | "down" | "left" | "right" | "scale"

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: Direction
  distance?: number
  scaleFrom?: number
  className?: string
  rootMargin?: string
  enterThreshold?: number
  lockOnScrollDown?: boolean
}

export function ScrollReveal({
  children,
  direction = "up",
  distance = 80,
  scaleFrom = 0.95,
  className = "",
  rootMargin = "-5% 0px -15% 0px",
  enterThreshold = 0.35,
  lockOnScrollDown = false
}: ScrollRevealProps) {
  // Build thresholds [0, 0.01, ..., 1]
  const thresholds = useMemo(() => Array.from({ length: 101 }, (_, i) => i / 100), [])

  const { ref, entry } = useInView({
    threshold: thresholds,
    rootMargin,
    triggerOnce: false,
  })
  // Track scroll direction with debouncing to prevent loops
  const [isScrollingDown, setIsScrollingDown] = useState(true)
  const lastYRef = useRef(0)
  const enteredRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stableDirectionRef = useRef(true)
  const [isHovering, setIsHovering] = useState(false)
  const lastScrollTimeRef = useRef(Date.now())

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      const now = Date.now()
      const newDirection = y >= lastYRef.current
      
      // Update last scroll time to track actual scrolling
      lastScrollTimeRef.current = now
      
      // Only update direction if it's actually different and not just noise
      if (Math.abs(y - lastYRef.current) > 5) {
        if (newDirection !== stableDirectionRef.current) {
          stableDirectionRef.current = newDirection
          setIsScrollingDown(newDirection)
        }
      }
      
      lastYRef.current = y

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Set a timeout to stabilize the direction after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        stableDirectionRef.current = newDirection
        setIsScrollingDown(newDirection)
      }, 100)
    }
    
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const rawRatio = Math.max(0, Math.min(1, entry?.intersectionRatio ?? 0))
  // Mark as entered once reasonably visible
  if (!enteredRef.current && rawRatio >= enterThreshold) enteredRef.current = true
  
  // Check if we're in a hover-induced change (no recent scrolling)
  const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current
  const isHoverInduced = timeSinceLastScroll > 200 // 200ms since last scroll
  
  // When scrolling down and already entered, keep fully visible (do not fade out)
  // Also prevent fade changes during hover-induced intersection changes or active hover
  const ratio = (lockOnScrollDown && isScrollingDown && enteredRef.current) || 
                (isHoverInduced && enteredRef.current) ||
                (isHovering && enteredRef.current) ? 1 : rawRatio

  // Map scroll progress to transform/opacity, with slight easing for polish
  const eased = ratio * ratio * (3 - 2 * ratio) // smoothstep
  const translate = (1 - eased) * distance
  const scale = scaleFrom + (1 - scaleFrom) * eased

  let translateX = 0
  let translateY = 0

  switch (direction) {
    case "up":
      translateY = translate
      break
    case "down":
      translateY = -translate
      break
    case "left":
      translateX = translate
      break
    case "right":
      translateX = -translate
      break
    case "scale":
      // no translation, only scale
      break
  }

  const style: React.CSSProperties = {
    opacity: ratio,
    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
    willChange: "transform, opacity",
    // Disable time-based transitions to make it purely scroll-driven
    transition: "none",
  }

  // Mouse event handlers to prevent fade during hover
  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <div 
      ref={ref} 
      className={className} 
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}


