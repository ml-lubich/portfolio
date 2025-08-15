"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useInView } from "react-intersection-observer"

type Direction = "up" | "down" | "left" | "right" | "scale"

interface UnifiedRevealProps {
  children: React.ReactNode
  direction?: Direction
  distance?: number
  scaleFrom?: number
  className?: string
  delay?: number
  duration?: number
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
  bidirectional?: boolean
}

export function UnifiedReveal({
  children,
  direction = "up",
  distance = 60,
  scaleFrom = 0.95,
  className = "",
  delay = 0,
  duration = 800,
  triggerOnce = false,
  threshold = 0.15,
  rootMargin = "-10% 0px -10% 0px",
  bidirectional = true
}: UnifiedRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down")
  const lastScrollY = useRef(0)
  const [isHovering, setIsHovering] = useState(false)
  const lastScrollTimeRef = useRef(Date.now())
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  })

  // Memoized scroll handler for better performance with hover protection
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const now = Date.now()
    
    // Update last scroll time to track actual scrolling
    lastScrollTimeRef.current = now
    
    // Only update direction if there's meaningful movement (> 5px)
    if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection("down")
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up")
      }
    }
    
    lastScrollY.current = currentScrollY
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Set a timeout to stabilize after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      // Final stabilization after scroll stops
    }, 100)
  }, [])

  // Track scroll direction with throttling
  useEffect(() => {
    let rafId: number
    const throttledHandleScroll = () => {
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [handleScroll])

  useEffect(() => {
    // Check if we're in a hover-induced change (no recent scrolling)
    const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current
    const isHoverInduced = timeSinceLastScroll > 200 // 200ms since last scroll
    
    if (bidirectional) {
      // Bidirectional: fade in when scrolling into view, fade out when scrolling out of view
      if (inView) {
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, delay)
        return () => clearTimeout(timer)
      } else {
        // Don't hide if it's hover-induced or actively hovering and already visible
        if (!isHoverInduced && !isHovering) {
          setIsVisible(false)
        }
      }
    } else {
      // Original behavior: triggerOnce logic
      if (inView && !hasAnimated) {
        const timer = setTimeout(() => {
          setIsVisible(true)
          if (triggerOnce) {
            setHasAnimated(true)
          }
        }, delay)
        return () => clearTimeout(timer)
      } else if (!inView && !triggerOnce && !hasAnimated && !isHoverInduced && !isHovering) {
        setIsVisible(false)
      }
    }
  }, [inView, delay, triggerOnce, hasAnimated, bidirectional, isHovering])

  // Memoized transform calculation
  const getTransform = useMemo(() => {
    if (isVisible) {
      return "translateX(0) translateY(0) scale(1)"
    }

    // When not visible, transform based on scroll direction for bidirectional mode
    if (bidirectional && scrollDirection === "up") {
      // When scrolling up and element is not in view, it should fade upward
      switch (direction) {
        case "up":
          return `translateY(-${distance}px) scale(${scaleFrom})`
        case "down":
          return `translateY(${distance}px) scale(${scaleFrom})`
        case "left":
          return `translateX(-${distance}px) scale(${scaleFrom})`
        case "right":
          return `translateX(${distance}px) scale(${scaleFrom})`
        case "scale":
          return `scale(${scaleFrom})`
        default:
          return `translateY(-${distance}px) scale(${scaleFrom})`
      }
    } else {
      // Default behavior: elements come from bottom/sides when scrolling down
      switch (direction) {
        case "up":
          return `translateY(${distance}px) scale(${scaleFrom})`
        case "down":
          return `translateY(-${distance}px) scale(${scaleFrom})`
        case "left":
          return `translateX(${distance}px) scale(${scaleFrom})`
        case "right":
          return `translateX(-${distance}px) scale(${scaleFrom})`
        case "scale":
          return `scale(${scaleFrom})`
        default:
          return `translateY(${distance}px) scale(${scaleFrom})`
      }
    }
  }, [isVisible, bidirectional, scrollDirection, direction, distance, scaleFrom])

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
      className={`transition-all ease-out will-change-transform will-change-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// Preset configurations for common use cases
export function SectionReveal({ children, delay = 0, className = "" }: { 
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <UnifiedReveal
      direction="up"
      distance={40}
      duration={800}
      delay={delay}
      threshold={0.1}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}

export function CardReveal({ 
  children, 
  direction = "up" as Direction, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode
  direction?: Direction
  delay?: number
  className?: string 
}) {
  return (
    <UnifiedReveal
      direction={direction}
      distance={60}
      duration={700}
      delay={delay}
      threshold={0.2}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}

export function HeaderReveal({ children, className = "" }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <UnifiedReveal
      direction="up"
      distance={30}
      duration={600}
      delay={100}
      threshold={0.1}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
}
